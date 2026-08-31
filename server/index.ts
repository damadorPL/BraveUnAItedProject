import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { dbManager } from "./db/index.js";
import { authRouter } from "./routes/auth.js";
import { callersRouter } from "./routes/callers.js";
import { recordsRouter } from "./routes/records.js";
import { adminRouter } from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health Check
app.get("/api/health", async (_req, res) => {
  try {
    const adapter = await dbManager.getAdapter();
    const isDbOk = await adapter.ping();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      databaseEngine: adapter.engine,
      databaseOk: isDbOk,
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Mount Routes
app.use("/api/auth", authRouter);
app.use("/api/callers", callersRouter);
app.use("/api/records", recordsRouter);
app.use("/api/admin", adminRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled API Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Wystąpił wewnętrzny błąd serwera",
  });
});

// Bootstrap server
async function startServer() {
  try {
    console.log("Initializing database connection...");
    await dbManager.init();
    console.log(`Database initialized with engine: ${dbManager.getConfig().engine}`);

    app.listen(PORT, () => {
      console.log(`🚀 SYNAPSIS Backend Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

// Only start when run directly
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
