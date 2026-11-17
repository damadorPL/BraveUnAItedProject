import rateLimit from "express-rate-limit";

/** Standard rate limiter for authenticated API endpoints. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Zbyt wiele żądań. Spróbuj ponownie za chwilę." },
});

/** Stricter rate limiter for authentication endpoints. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Zbyt wiele prób logowania. Spróbuj ponownie później." },
});

/** Rate limiter for static SPA fallback file serving. */
export const staticLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
