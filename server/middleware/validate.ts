import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        res.status(400).json({
          error: issues[0]?.message || "Błąd walidacji danych wejściowych.",
          details: issues,
        });
        return;
      }
      res.status(400).json({ error: "Nieprawidłowe dane wejściowe." });
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        res.status(400).json({
          error: issues[0]?.message || "Błąd walidacji parametrów zapytania.",
          details: issues,
        });
        return;
      }
      res.status(400).json({ error: "Nieprawidłowe parametry zapytania." });
    }
  };
}
