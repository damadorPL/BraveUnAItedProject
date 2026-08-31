import { Router } from "express";
import { dbManager } from "../db/index.js";
import {
  authenticateJWT,
  requireAdmin,
  AuthenticatedRequest,
} from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { callerSchema, updateCallerSchema } from "../db/schema/zod.js";
import { Caller } from "../types.js";

export const callersRouter = Router();

// All callers routes require valid JWT
callersRouter.use(authenticateJWT);

// GET /api/callers
callersRouter.get("/", async (req, res) => {
  try {
    const adapter = await dbManager.getAdapter();
    const callers = await adapter.getCallers();
    res.json(callers);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd pobierania kontaktów" });
  }
});

// GET /api/callers/:id
callersRouter.get("/:id", async (req, res) => {
  try {
    const id = req.params.id as string;
    const adapter = await dbManager.getAdapter();
    const caller = await adapter.getCallerById(id);
    if (!caller) {
      res.status(404).json({ error: "Nie znaleziono kontaktu" });
      return;
    }
    res.json(caller);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd pobierania kontaktu" });
  }
});

// POST /api/callers
callersRouter.post("/", validateBody(callerSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const data = req.body;

    const newCaller: Caller = {
      id: data.id || `c-${Date.now()}`,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phoneNumber: data.phoneNumber.trim(),
      voivodeship: data.voivodeship || "brak",
      city: data.city || "",
      beneficiaryTypes: data.beneficiaryTypes || [],
      hasDisabilityCertificate: data.hasDisabilityCertificate || "nie",
      disabilityDegree: data.disabilityDegree || undefined,
      tags: data.tags || [],
      attachments: data.attachments || [],
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const adapter = await dbManager.getAdapter();
    const created = await adapter.createCaller(newCaller);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd tworzenia kontaktu" });
  }
});

// PUT /api/callers/:id
callersRouter.put("/:id", validateBody(updateCallerSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;
    const adapter = await dbManager.getAdapter();
    const existing = await adapter.getCallerById(id);
    if (!existing) {
      res.status(404).json({ error: "Nie znaleziono kontaktu do aktualizacji" });
      return;
    }

    const updatedCaller: Caller = {
      ...existing,
      ...req.body,
      id,
      updatedAt: new Date().toISOString(),
    };

    const saved = await adapter.updateCaller(updatedCaller);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd aktualizacji kontaktu" });
  }
});

// DELETE /api/callers/:id (Admin only)
callersRouter.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id as string;
    const adapter = await dbManager.getAdapter();
    const success = await adapter.deleteCaller(id);
    if (!success) {
      res.status(404).json({ error: "Nie znaleziono kontaktu lub już usunięty" });
      return;
    }
    res.json({ success: true, message: "Kartoteka kontaktu została usunięta" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd usuwania kontaktu" });
  }
});
