import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "./index.js";
import { dbManager } from "./db/index.js";
import { generateJWT } from "./middleware/auth.js";
import {
  saveAttachmentFile,
  getAttachmentFilePath,
  deleteAttachmentFile,
  migrateLegacyBase64Attachments,
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

    it("GET /api/attachments/:id allows download via ?token= query parameter", async () => {
      const res = await request(app)
        .get(`/api/attachments/${uploadedId}?token=${adminToken}`)
        .buffer(true);

      expect(res.status).toBe(200);
      expect((res.body && Buffer.isBuffer(res.body) ? res.body.toString("utf8") : res.text)).toBe("Fake PDF content");
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

  describe("Legacy Base64 Migration", () => {
    it("should migrate existing caller base64 attachments to disk files", async () => {
      const adapter = await dbManager.getAdapter();
      const sampleBase64 = "data:application/pdf;base64," + Buffer.from("Legacy PDF Content").toString("base64");

      const caller = await adapter.createCaller({
        id: "caller-legacy-1",
        firstName: "Jan",
        lastName: "Nowak",
        phoneNumber: "500600700",
        voivodeship: "mazowieckie",
        city: "Warszawa",
        beneficiaryTypes: ["rodzic"],
        hasDisabilityCertificate: "tak",
        tags: [],
        attachments: [
          {
            id: "att-legacy-1",
            name: "stare_orzeczenie.pdf",
            size: 100,
            type: "pdf",
            mimeType: "application/pdf",
            dataUrl: sampleBase64,
            uploadedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const { migratedCount } = await migrateLegacyBase64Attachments(adapter);
      expect(migratedCount).toBeGreaterThanOrEqual(1);

      const updatedCaller = await adapter.getCallerById(caller.id);
      expect(updatedCaller).not.toBeNull();
      const migratedAtt = updatedCaller!.attachments![0];
      expect(migratedAtt.dataUrl).toBeUndefined();
      expect(migratedAtt.url).toBe(`/api/attachments/att-legacy-1`);

      const fileInfo = getAttachmentFilePath("att-legacy-1");
      expect(fileInfo).not.toBeNull();
      expect(fs.readFileSync(fileInfo!.filePath, "utf8")).toBe("Legacy PDF Content");

      // Cleanup
      await deleteAttachmentFile("att-legacy-1");
    });
  });
});
