import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { SQLiteAdapter } from "./db/sqliteAdapter.js";
import { sqliteSpecialists, sqliteCallers } from "./db/schema/sqlite.js";
import path from "path";
import fs from "fs";

describe("Drizzle ORM & SQLite Adapter Test Suite", () => {
  const testDbPath = path.resolve(
    process.cwd(),
    "data",
    `drizzle_test_${Date.now()}_${Math.random().toString(36).slice(2)}.sqlite`
  );
  let adapter: SQLiteAdapter;

  beforeAll(async () => {
    adapter = new SQLiteAdapter(testDbPath);
    await adapter.init();
  });

  afterAll(async () => {
    await adapter.close();
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch {}
    }
  });

  it("should initialize Drizzle instance on SQLiteAdapter", () => {
    expect(adapter.drizzle).toBeDefined();
    expect(adapter.drizzle).not.toBeNull();
  });

  it("should query specialists table via Drizzle select", async () => {
    if (!adapter.drizzle) throw new Error("Drizzle not initialized");
    const results = await adapter.drizzle.select().from(sqliteSpecialists);
    expect(Array.isArray(results)).toBe(true);
  });

  it("should query callers table via Drizzle select", async () => {
    if (!adapter.drizzle) throw new Error("Drizzle not initialized");
    const results = await adapter.drizzle.select().from(sqliteCallers);
    expect(Array.isArray(results)).toBe(true);
  });
});
