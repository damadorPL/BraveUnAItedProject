import crypto from "crypto";
import { Router } from "express";
import { dbManager } from "../db/index.js";
import {
  authenticateJWT,
  requireAdmin,
  AuthenticatedRequest,
} from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  specialistSchema,
  updateSpecialistSchema,
  mergeCallersSchema,
  dbConfigSchema,
} from "../db/schema/zod.js";
import { Specialist, DatabaseConfig } from "../types.js";

export const adminRouter = Router();

// Require both valid JWT and isAdmin === true for all admin endpoints
adminRouter.use(authenticateJWT);
adminRouter.use(requireAdmin);

function sha256Hex(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

// GET /api/admin/overview
adminRouter.get("/overview", async (req, res) => {
  try {
    const adapter = await dbManager.getAdapter();
    const stats = await adapter.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd pobierania statystyk panelu admina" });
  }
});

// GET /api/admin/specialists
adminRouter.get("/specialists", async (req, res) => {
  try {
    const adapter = await dbManager.getAdapter();
    const specs = await adapter.getSpecialists();
    res.json(specs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd pobierania specjalistów" });
  }
});

// POST /api/admin/specialists
adminRouter.post("/specialists", validateBody(specialistSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const data = req.body;

    const adapter = await dbManager.getAdapter();
    const existing = await adapter.getSpecialistByEmail(data.email);
    if (existing) {
      res.status(400).json({ error: "Specjalista o tym adresie e-mail już istnieje w systemie." });
      return;
    }

    const newSpec: Specialist = {
      id: data.id || `spec-${Date.now()}`,
      name: data.name.trim(),
      role: data.role || "Konsultant",
      title: data.title || "Specjalista",
      guidanceType: data.guidanceType || "prawno-obywatelskie",
      avatarBg: data.avatarBg || "bg-blue-600",
      avatarUrl: data.avatarUrl || undefined,
      email: data.email.trim().toLowerCase(),
      isAdmin: Boolean(data.isAdmin),
    };

    const created = await adapter.createSpecialist(newSpec);

    // If initial password was supplied
    if (data.initialPassword) {
      const hash = sha256Hex(data.initialPassword);
      await adapter.setPasswordHash(created.id, hash);
    }

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd tworzenia profilu specjalisty" });
  }
});

// PUT /api/admin/specialists/:id
adminRouter.put("/specialists/:id", validateBody(updateSpecialistSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;
    const adapter = await dbManager.getAdapter();
    const existing = await adapter.getSpecialistById(id);
    if (!existing) {
      res.status(404).json({ error: "Nie znaleziono specjalisty" });
      return;
    }

    // Protect against self-demoting the last admin if needed
    if (existing.id === "spec-admin" && req.body.isAdmin === false) {
      res.status(400).json({ error: "Nie można odebrać uprawnień głównemu administratorowi systemu." });
      return;
    }

    const updatedSpec: Specialist = {
      ...existing,
      ...req.body,
      id,
      email: (req.body.email || existing.email).trim().toLowerCase(),
      isAdmin: req.body.isAdmin !== undefined ? Boolean(req.body.isAdmin) : existing.isAdmin,
    };

    const saved = await adapter.updateSpecialist(updatedSpec);

    if (req.body.newPassword) {
      const hash = sha256Hex(req.body.newPassword);
      await adapter.setPasswordHash(saved.id, hash);
    }

    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd aktualizacji specjalisty" });
  }
});

// DELETE /api/admin/specialists/:id
adminRouter.delete("/specialists/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;
    if (id === req.user!.id) {
      res.status(400).json({ error: "Nie możesz usunąć własnego konta administratora." });
      return;
    }
    if (id === "spec-admin") {
      res.status(400).json({ error: "Nie można usunąć głównego konta administratora systemu." });
      return;
    }

    const adapter = await dbManager.getAdapter();
    const success = await adapter.deleteSpecialist(id);
    if (!success) {
      res.status(404).json({ error: "Nie znaleziono specjalisty" });
      return;
    }
    res.json({ success: true, message: "Konto specjalisty zostało usunięte" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd usuwania specjalisty" });
  }
});

// POST /api/admin/specialists/:id/reset-password
adminRouter.post("/specialists/:id/reset-password", async (req, res) => {
  try {
    const id = req.params.id as string;
    const adapter = await dbManager.getAdapter();
    const existing = await adapter.getSpecialistById(id);
    if (!existing) {
      res.status(404).json({ error: "Nie znaleziono specjalisty o podanym ID w bazie danych." });
      return;
    }

    const { newPassword } = req.body;
    const tempPassword = newPassword || `Synapsis${Math.floor(1000 + Math.random() * 9000)}!`;
    const hash = sha256Hex(tempPassword);

    await adapter.setPasswordHash(id, hash);

    res.json({
      success: true,
      message: "Hasło zostało zresetowane pomyślnie.",
      temporaryPassword: tempPassword,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd resetowania hasła" });
  }
});

// POST /api/admin/merge-callers
adminRouter.post("/merge-callers", validateBody(mergeCallersSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { sourceCallerId, targetCallerId, customMergedData } = req.body;
    if (sourceCallerId === targetCallerId) {
      res.status(400).json({ error: "Nie można scalić kontaktu z samym sobą." });
      return;
    }

    const adapter = await dbManager.getAdapter();
    const result = await adapter.mergeCallers(sourceCallerId, targetCallerId, customMergedData);

    res.json({
      success: true,
      message: `Scalono kontakty. Przeniesiono ${result.migratedRecordCount} porad oraz ${result.migratedAttachmentCount} załączników.`,
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd podczas scalania kontaktów" });
  }
});

// GET /api/admin/audit-logs
adminRouter.get("/audit-logs", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const adapter = await dbManager.getAdapter();
    const logs = await adapter.getAuditLogs(limit);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd pobierania rejestru zmian" });
  }
});

// GET /api/admin/db/config
adminRouter.get("/db/config", async (req, res) => {
  try {
    const config = dbManager.getConfig();
    const adapter = await dbManager.getAdapter();
    const ok = await adapter.ping();
    res.json({
      ...config,
      status: ok ? "connected" : "disconnected",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/db/config (Switch DB Engine)
adminRouter.post("/db/config", validateBody(dbConfigSchema), async (req, res) => {
  try {
    const newConfig: DatabaseConfig = req.body;
    if (!newConfig.engine || !["sqlite", "postgres"].includes(newConfig.engine)) {
      res.status(400).json({ error: "Nieprawidłowy silnik bazy danych (dozwolone: sqlite, postgres)" });
      return;
    }

    const result = await dbManager.switchEngine(newConfig);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/db/test (Test connection)
adminRouter.post("/db/test", async (req, res) => {
  try {
    const config: DatabaseConfig = req.body;
    const result = await dbManager.testConnection(config);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/db/reset (Reset database to sample dataset)
adminRouter.post("/db/reset", async (req, res) => {
  try {
    await dbManager.resetDatabase();
    res.json({ success: true, message: "Baza danych została przywrócona do stanu początkowego." });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd resetowania bazy danych" });
  }
});

// POST /api/admin/db/clear (Purge demo data / clear database)
adminRouter.post("/db/clear", async (req, res) => {
  try {
    const keepSpecialists = Boolean(req.body.keepSpecialists);
    await dbManager.purgeDatabase(keepSpecialists);
    res.json({
      success: true,
      message: keepSpecialists
        ? "Wyczyszczono wszystkie kartoteki i porady. Zachowano zdefiniowane konta specjalistów i administratora."
        : "Wyczyszczono wszystkie dane demonstracyjne. Zachowano konto Administratora do logowania.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd czyszczenia bazy danych" });
  }
});
