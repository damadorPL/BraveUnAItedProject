import { describe, it, expect, vi } from "vitest";
import { PostgresAdapter } from "./db/postgresAdapter.js";

describe("PostgreSQL Adapter Unit Suite", () => {
  it("should initialize with custom connection string", () => {
    const adapter = new PostgresAdapter("postgres://custom_user:pass@127.0.0.1:5432/custom_db");
    expect(adapter.engine).toBe("postgres");
    expect(adapter.getConnectionString()).toBe("postgres://custom_user:pass@127.0.0.1:5432/custom_db");
  });

  it("ping should return false when disconnected or connection fails", async () => {
    const adapter = new PostgresAdapter("postgres://invalid_user:wrong@127.0.0.1:5432/invalid_db");
    const isOk = await adapter.ping();
    expect(isOk).toBe(false);
  });
});
