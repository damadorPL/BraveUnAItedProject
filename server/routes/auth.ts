import crypto from "crypto";
import { Router } from "express";
import { dbManager } from "../db/index.js";
import {
  authenticateJWT,
  AuthenticatedRequest,
  generateJWT,
} from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema, resetPasswordSchema } from "../db/schema/zod.js";

export const authRouter = Router();
export const DEMO_PASSWORD = "synapsis2026";

function sha256Hex(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "E-mail i hasło są wymagane." });
      return;
    }

    const adapter = await dbManager.getAdapter();
    const specialist = await adapter.getSpecialistByEmail(email);

    if (!specialist) {
      res.status(401).json({ error: "Nie znaleziono specjalisty o podanym adresie e-mail." });
      return;
    }

    const passwordHash = await adapter.getPasswordHash(specialist.id);
    let isPasswordValid = false;

    if (passwordHash) {
      // Check against stored sha256 hash
      const incomingHash = sha256Hex(password);
      isPasswordValid = incomingHash === passwordHash;
    } else {
      // Check against demo password
      isPasswordValid = password === DEMO_PASSWORD;
    }

    if (!isPasswordValid) {
      res.status(401).json({ error: "Nieprawidłowe hasło dostępowe." });
      return;
    }

    const token = generateJWT({
      id: specialist.id,
      email: specialist.email,
      name: specialist.name,
      role: specialist.role,
      isAdmin: Boolean(specialist.isAdmin),
    });

    res.json({
      token,
      user: specialist,
      message: "Logowanie pomyślne",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Wystąpił błąd podczas logowania." });
  }
});

authRouter.get("/specialists", async (_req, res) => {
  try {
    const adapter = await dbManager.getAdapter();
    const specialists = await adapter.getSpecialists();
    res.json(specialists);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd pobierania listy specjalistów." });
  }
});

authRouter.get("/me", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const adapter = await dbManager.getAdapter();
    const specialist = await adapter.getSpecialistById(req.user!.id);
    if (!specialist) {
      res.status(404).json({ error: "Specjalista nie istnieje w bazie." });
      return;
    }
    res.json({ user: specialist });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd serwera." });
  }
});

authRouter.post("/reset-password", validateBody(resetPasswordSchema), async (req, res) => {
  try {
    const { email, newPassword, resetCode } = req.body;
    if (!email || !newPassword || !resetCode) {
      res.status(400).json({ error: "Brak wymaganych danych do zresetowania hasła." });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: "Hasło musi mieć co najmniej 8 znaków." });
      return;
    }

    const adapter = await dbManager.getAdapter();
    const specialist = await adapter.getSpecialistByEmail(email);
    if (!specialist) {
      res.status(404).json({ error: "Nie znaleziono specjalisty." });
      return;
    }

    const hash = sha256Hex(newPassword);
    await adapter.setPasswordHash(specialist.id, hash);

    res.json({ success: true, message: "Hasło zostało pomyślnie zmienione." });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Błąd podczas resetowania hasła." });
  }
});
