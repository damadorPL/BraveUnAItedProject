import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "./index.js";
import { dbManager } from "./db/index.js";
import { generateJWT } from "./middleware/auth.js";
import path from "path";

import fs from "fs";

describe("Backend Server & JWT Auth Test Suite", () => {
  const testDbPath = path.resolve(process.cwd(), "data", `test_synapsis_${Date.now()}_${Math.random().toString(36).slice(2)}.sqlite`);

  beforeAll(async () => {
    // Initialize DB with test sqlite path
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch {}
    }
    await dbManager.init({ engine: "sqlite", sqlitePath: testDbPath });
  });

  afterAll(async () => {
    const adapter = await dbManager.getAdapter();
    await adapter.close();
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch {}
    }
  });

  it("GET /api/health should return ok status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.databaseOk).toBe(true);
  });

  describe("Authentication & JWT", () => {
    it("POST /api/auth/login with valid demo password should return JWT token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "admin@synapsis.org.pl",
          password: "synapsis2026",
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe("admin@synapsis.org.pl");
      expect(res.body.user.isAdmin).toBe(true);
    });

    it("POST /api/auth/login with wrong password should fail with 401", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "admin@synapsis.org.pl",
          password: "wrong-password",
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("GET /api/auth/me should return specialist profile for valid JWT", async () => {
      const adminToken = generateJWT({
        id: "spec-admin",
        email: "admin@synapsis.org.pl",
        name: "dr Michał Adamczyk (Admin)",
        role: "Administrator Systemu",
        isAdmin: true,
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe("spec-admin");
    });

    it("GET /api/callers should reject request without JWT with 401", async () => {
      const res = await request(app).get("/api/callers");
      expect(res.status).toBe(401);
    });
  });

  describe("Admin Route Protection with JWT", () => {
    it("GET /api/admin/overview should succeed for admin token", async () => {
      const adminToken = generateJWT({
        id: "spec-admin",
        email: "admin@synapsis.org.pl",
        name: "Admin",
        role: "Admin",
        isAdmin: true,
      });

      const res = await request(app)
        .get("/api/admin/overview")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalCallers).toBeGreaterThan(0);
      expect(res.body.databaseEngine).toBe("sqlite");
    });

    it("GET /api/admin/overview should reject non-admin token with 403 Forbidden", async () => {
      const regularToken = generateJWT({
        id: "spec-1",
        email: "j.mrozek@synapsis.org.pl",
        name: "Joanna Mrożek",
        role: "Psycholog",
        isAdmin: false,
      });

      const res = await request(app)
        .get("/api/admin/overview")
        .set("Authorization", `Bearer ${regularToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/uprawnień administratora/i);
    });
  });

  describe("Callers & Records CRUD", () => {
    let token: string;

    beforeAll(() => {
      token = generateJWT({
        id: "spec-admin",
        email: "admin@synapsis.org.pl",
        name: "Admin",
        role: "Admin",
        isAdmin: true,
      });
    });

    it("POST /api/callers should create a new caller", async () => {
      const res = await request(app)
        .post("/api/callers")
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "Jan",
          lastName: "Kowalski-Test",
          phoneNumber: "555 123 456",
          voivodeship: "mazowieckie",
          city: "Warszawa",
          beneficiaryTypes: ["rodzic"],
          hasDisabilityCertificate: "tak",
        });

      expect(res.status).toBe(201);
      expect(res.body.firstName).toBe("Jan");
      expect(res.body.id).toBeDefined();
    });

    it("POST /api/records should create a new record", async () => {
      const callersRes = await request(app)
        .get("/api/callers")
        .set("Authorization", `Bearer ${token}`);
      const caller = callersRes.body[0];

      const res = await request(app)
        .post("/api/records")
        .set("Authorization", `Bearer ${token}`)
        .send({
          callerId: caller.id,
          guidanceType: "prawno-obywatelskie",
          adviceDescription: "Porada testowa dotycząca orzeczenia",
          durationMinutes: 45,
        });

      expect(res.status).toBe(201);
      expect(res.body.callerId).toBe(caller.id);
    });

    it("GET /api/records with limit and offset should return paginated subset", async () => {
      const res = await request(app)
        .get("/api/records?limit=2&offset=0")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(2);
    });

    it("GET /api/callers with search query should filter callers", async () => {
      const res = await request(app)
        .get("/api/callers?search=Kowalski")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((c: any) => c.lastName.includes("Kowalski"))).toBe(true);
    });

    it("PUT /api/records/:id should reject modification by unauthorized non-owner specialist with 403", async () => {
      const recordsRes = await request(app)
        .get("/api/records")
        .set("Authorization", `Bearer ${token}`);
      const record = recordsRes.body[0];

      // Generate token for a different, non-admin specialist
      const otherSpecialistToken = generateJWT({
        id: "spec-stranger-999",
        email: "stranger@synapsis.org.pl",
        name: "Inny Specjalista",
        role: "Konsultant",
        isAdmin: false,
      });

      const res = await request(app)
        .put(`/api/records/${record.id}`)
        .set("Authorization", `Bearer ${otherSpecialistToken}`)
        .send({
          adviceDescription: "Nieautoryzowana próba modyfikacji",
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("Brak uprawnień");
    });

    it("PUT /api/records/:id should allow modification by admin or owner with 200", async () => {
      const recordsRes = await request(app)
        .get("/api/records")
        .set("Authorization", `Bearer ${token}`);
      const record = recordsRes.body[0];

      const adminToken = generateJWT({
        id: "spec-admin",
        email: "admin@synapsis.org.pl",
        name: "Admin",
        role: "Admin",
        isAdmin: true,
      });

      const res = await request(app)
        .put(`/api/records/${record.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          adviceDescription: "Zaktualizowany opis przez administratora",
        });

      expect(res.status).toBe(200);
      expect(res.body.adviceDescription).toBe("Zaktualizowany opis przez administratora");
    });
  });
});
