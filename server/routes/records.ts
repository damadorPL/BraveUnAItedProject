import { Router } from "express";
import { dbManager } from "../db/index.js";
import {
  authenticateJWT,
  requireAdmin,
  AuthenticatedRequest,
} from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { callRecordSchema, updateRecordSchema } from "../db/schema/zod.js";
import { CallRecord, RecordEditLog } from "../types.js";

export const recordsRouter = Router();

// All records routes require valid JWT
recordsRouter.use(authenticateJWT);

// GET /api/records
recordsRouter.get("/", async (req, res) => {
  try {
    const callerId = req.query.callerId as string | undefined;
    const specialistId = req.query.specialistId as string | undefined;
    const guidanceType = req.query.guidanceType as string | undefined;
    const search = req.query.search as string | undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offset = req.query.offset ? Number(req.query.offset) : undefined;

    const adapter = await dbManager.getAdapter();

    if (callerId && !limit && !offset && !search && !guidanceType && !specialistId) {
      const records = await adapter.getRecordsByCallerId(callerId);
      res.json(records);
      return;
    }

    const records = await adapter.getRecords({
      callerId,
      specialistId,
      guidanceType,
      search,
      limit,
      offset,
    });
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd pobierania rejestru porad" });
  }
});

// GET /api/records/:id
recordsRouter.get("/:id", async (req, res) => {
  try {
    const id = req.params.id as string;
    const adapter = await dbManager.getAdapter();
    const record = await adapter.getRecordById(id);
    if (!record) {
      res.status(404).json({ error: "Nie znaleziono wpisu porady" });
      return;
    }
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd pobierania wpisu porady" });
  }
});

// POST /api/records
recordsRouter.post("/", validateBody(callRecordSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const data = req.body;

    const newRecord: CallRecord = {
      id: data.id || `rec-${Date.now()}`,
      callerId: data.callerId,
      callDate: data.callDate || new Date().toISOString(),
      specialistId: data.specialistId || req.user!.id,
      specialistName: data.specialistName || req.user!.name,
      specialistRole: data.specialistRole || req.user!.role,
      contactTypes: data.contactTypes || ["telefon"],
      subjectTargets: data.subjectTargets || ["dziecko"],
      guidanceType: data.guidanceType,
      guidanceAreas: data.guidanceAreas || [],
      adviceDescription: data.adviceDescription || "",
      notes: data.notes || undefined,
      referredTo: data.referredTo || undefined,
      referredSpecialistId: data.referredSpecialistId || undefined,
      referredSpecialistEmail: data.referredSpecialistEmail || undefined,
      referredNote: data.referredNote || undefined,
      referredStatus: data.referredStatus || (data.referredSpecialistId ? "OCZEKUJĄCA" : undefined),
      attachments: data.attachments || [],
      durationMinutes: Number(data.durationMinutes) || 0,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: undefined,
      editLogs: [],
    };

    const adapter = await dbManager.getAdapter();
    const created = await adapter.createRecord(newRecord);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd rejestracji porady" });
  }
});

// PUT /api/records/:id
recordsRouter.put("/:id", validateBody(updateRecordSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;
    const adapter = await dbManager.getAdapter();
    const existing = await adapter.getRecordById(id);
    if (!existing) {
      res.status(404).json({ error: "Nie znaleziono wpisu do edycji" });
      return;
    }

    const updatedRecord: CallRecord = {
      ...existing,
      ...req.body,
      id,
      updatedAt: new Date().toISOString(),
    };

    // If new edit log was passed in req.body.newEditLog, save it
    if (req.body.newEditLog) {
      const editLog: RecordEditLog = req.body.newEditLog;
      await adapter.createAuditLog(editLog);
    }

    const saved = await adapter.updateRecord(updatedRecord);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd aktualizacji porady" });
  }
});

// DELETE /api/records/:id (Admin only)
recordsRouter.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id as string;
    const adapter = await dbManager.getAdapter();
    const success = await adapter.deleteRecord(id);
    if (!success) {
      res.status(404).json({ error: "Nie znaleziono wpisu lub już usunięty" });
      return;
    }
    res.json({ success: true, message: "Wpis porady został usunięty" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd usuwania porady" });
  }
});
