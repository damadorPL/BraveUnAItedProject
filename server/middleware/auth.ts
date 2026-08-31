import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequestUser, JWTPayload } from "../types.js";

export const JWT_SECRET = process.env.JWT_SECRET || "brave-synapsis-jwt-secret-key-2026-unAIted";
export const JWT_EXPIRES_IN = "24h";

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedRequestUser;
}

export function generateJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Wymagana autoryzacja (Brak tokenu Bearer)" });
    return;
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyJWT(token);

  if (!payload) {
    res.status(401).json({ error: "Nieprawidłowy lub wygasły token sesji" });
    return;
  }

  req.user = payload;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Wymagana autoryzacja" });
    return;
  }

  if (!req.user.isAdmin) {
    res.status(403).json({ error: "Brak uprawnień administratora. Dostęp zabroniony." });
    return;
  }

  next();
}
