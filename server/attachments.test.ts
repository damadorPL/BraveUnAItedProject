import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "./index.js";
import { dbManager } from "./db/index.js";
import { generateJWT } from "./middleware/auth.js";
import {
  saveAttachmentFile,
  getAttachmentFilePath,
  deleteAttachmentFile,
} from "./storage/attachmentStorage.js";
import path from "path";
import fs from "fs";

describe("Attachment Storage & API Endpoint Test Suite", () => {
  const testDbPath = path.resolve(
    process.cwd(),
    "data",
    `test_att_${Date.now()}_${Math.random().toString(36).slice(2)}.sqlite`
  );
  let adminToken: string;

  beforeAll(async () => {
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch {}
    }
    await dbManager.init({ engine: "sqlite", sqlitePath: testDbPath });

    adminToken = generateJWT({
      id: "spec-admin",
      email: "admin@synapsis.org.pl",
      name: "Administrator Systemu",
      role: "Koordynator / Admin",
      isAdmin: true,
    });
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

  describe("Direct Storage Utilities", () => {
    it("should save and retrieve file from disk storage", async () => {
      const buffer = Buffer.from("Test content 123", "utf8");
      const meta = await saveAttachmentFile(
        buffer,
        "test_doc.pdf",
        "application/pdf",
        "mgr Jan Kowalski"
      );

      expect(meta.id).toBeDefined();
      expect(meta.type).toBe("pdf");
      expect(meta.size).toBe(buffer.length);
      expect(meta.url).toBe(`/api/attachments/${meta.id}`);

      const fileInfo = getAttachmentFilePath(meta.id);
      expect(fileInfo).not.toBeNull();
      expect(fs.existsSync(fileInfo!.filePath)).toBe(true);

      // Clean up
      await deleteAttachmentFile(meta.id);
      expect(getAttachmentFilePath(meta.id)).toBeNull();
    });

    it("should prevent directory traversal attacks", () => {
      expect(getAttachmentFilePath("../../../etc/passwd")).toBeNull();
      expect(getAttachmentFilePath("..\\..\\windows\\system32")).toBeNull();
    });
  });

  describe("API Endpoints", () => {
    let uploadedId = "";

    it("POST /api/attachments/upload requires authentication", async () => {
      const res = await request(app)
        .post("/api/attachments/upload")
        .attach("file", Buffer.from("Sample PDF"), "orzeczenie.pdf");

      expect(res.status).toBe(401);
    });

    it("POST /api/attachments/upload fails without file", async () => {
      const res = await request(app)
        .post("/api/attachments/upload")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Brak pliku");
    });

    it("POST /api/attachments/upload successfully saves file and returns metadata", async () => {
      const res = await request(app)
        .post("/api/attachments/upload")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("specialistName", "mgr Jan Kowalski")
        .field("description", "Opis orzeczenia")
        .attach("file", Buffer.from("Fake PDF content"), "wzor_orzeczenia.pdf");

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.attachment).not.toBeUndefined();
      expect(res.body.attachment.name).toBe("wzor_orzeczenia.pdf");
      expect(res.body.attachment.type).toBe("pdf");
      expect(res.body.attachment.url).not.toBeUndefined();

      uploadedId = res.body.attachment.id;
    });

    it("GET /api/attachments/:id allows authenticated download via Bearer token", async () => {
      const res = await request(app)
        .get(`/api/attachments/${uploadedId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .buffer(true);

      expect(res.status).toBe(200);
      expect((res.body && Buffer.isBuffer(res.body) ? res.body.toString("utf8") : res.text)).toBe("Fake PDF content");
    });

    it("POST /api/attachments/:id/ticket requires authentication", async () => {
      const res = await request(app).post(`/api/attachments/${uploadedId}/ticket`);
      expect(res.status).toBe(401);
    });

    it("POST /api/attachments/:id/ticket generates single-use download nonce ticket", async () => {
      const res = await request(app)
        .post(`/api/attachments/${uploadedId}/ticket`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.ticket).toBe("string");
      expect(res.body.ticket.length).toBeGreaterThan(20);
      expect(res.body.expiresIn).toBe(60);
      expect(res.body.downloadUrl).toContain(`ticket=${res.body.ticket}`);
    });

    it("GET /api/attachments/:id allows download via ?ticket= nonce query parameter", async () => {
      // 1. Generate nonce ticket
      const ticketRes = await request(app)
        .post(`/api/attachments/${uploadedId}/ticket`)
        .set("Authorization", `Bearer ${adminToken}`);
      const ticket = ticketRes.body.ticket;

      // 2. Download with ?ticket=
      const res = await request(app)
        .get(`/api/attachments/${uploadedId}?ticket=${ticket}`)
        .buffer(true);

      expect(res.status).toBe(200);
      expect((res.body && Buffer.isBuffer(res.body) ? res.body.toString("utf8") : res.text)).toBe("Fake PDF content");
    });

    it("GET /api/attachments/:id rejects replay attack (reusing the same nonce fails with 401)", async () => {
      // 1. Generate nonce ticket
      const ticketRes = await request(app)
        .post(`/api/attachments/${uploadedId}/ticket`)
        .set("Authorization", `Bearer ${adminToken}`);
      const ticket = ticketRes.body.ticket;

      // 2. First download succeeds
      const firstRes = await request(app).get(`/api/attachments/${uploadedId}?ticket=${ticket}`);
      expect(firstRes.status).toBe(200);

      // 3. Second download with identical nonce must fail (single-use / replay protection)
      const secondRes = await request(app).get(`/api/attachments/${uploadedId}?ticket=${ticket}`);
      expect(secondRes.status).toBe(401);
      expect(secondRes.body.error).toContain("wykorzystany");
    });

    it("GET /api/attachments/:id fails with 401 on invalid or unknown nonce", async () => {
      const res = await request(app).get(`/api/attachments/${uploadedId}?ticket=completely-fake-nonce-12345`);
      expect(res.status).toBe(401);
    });

    it("GET /api/attachments/:id fails when nonce was created for another attachment", async () => {
      // 1. Generate ticket for uploadedId
      const ticketRes = await request(app)
        .post(`/api/attachments/${uploadedId}/ticket`)
        .set("Authorization", `Bearer ${adminToken}`);
      const ticket = ticketRes.body.ticket;

      // 2. Attempt to use that ticket on a different file ID
      const res = await request(app).get(`/api/attachments/different-file-id?ticket=${ticket}`);
      expect(res.status).toBe(401);
    });

    it("GET /api/attachments/:id fails with 401 without token", async () => {
      const res = await request(app).get(`/api/attachments/${uploadedId}`);
      expect(res.status).toBe(401);
    });

    it("DELETE /api/attachments/:id removes file", async () => {
      const res = await request(app)
        .delete(`/api/attachments/${uploadedId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkRes = await request(app)
        .get(`/api/attachments/${uploadedId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(checkRes.status).toBe(404);
    });
  });
});
