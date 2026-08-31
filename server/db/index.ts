import { DatabaseAdapter } from "./adapter.js";
import { SQLiteAdapter } from "./sqliteAdapter.js";
import { PostgresAdapter } from "./postgresAdapter.js";
import { DatabaseConfig, DatabaseEngine } from "../types.js";
import {
  INITIAL_CALLERS,
  INITIAL_RECORDS,
  INITIAL_SPECIALISTS,
} from "../../src/data/sampleData.js";

class DatabaseManager {
  private activeAdapter: DatabaseAdapter | null = null;
  private currentConfig: DatabaseConfig = {
    engine: "sqlite",
  };

  async init(config?: Partial<DatabaseConfig>): Promise<DatabaseAdapter> {
    if (config) {
      this.currentConfig = { ...this.currentConfig, ...config };
    }

    // Prefer environment variable DATABASE_ENGINE if set
    if (!config?.engine && process.env.DATABASE_ENGINE) {
      this.currentConfig.engine = process.env.DATABASE_ENGINE as DatabaseEngine;
    }

    if (!config?.sqlitePath && process.env.SQLITE_PATH) {
      this.currentConfig.sqlitePath = process.env.SQLITE_PATH;
    }

    if (this.currentConfig.engine === "postgres") {
      const adapter = new PostgresAdapter(this.currentConfig.postgresUrl);
      await adapter.init();
      this.activeAdapter = adapter;
    } else {
      const adapter = new SQLiteAdapter(this.currentConfig.sqlitePath);
      await adapter.init();
      this.activeAdapter = adapter;
    }

    // Auto-seed if database has no specialists or callers
    await this.ensureSeeded();

    return this.activeAdapter;
  }

  async getAdapter(): Promise<DatabaseAdapter> {
    if (!this.activeAdapter) {
      return this.init();
    }
    return this.activeAdapter;
  }

  getConfig(): DatabaseConfig {
    return { ...this.currentConfig };
  }

  async testConnection(config: DatabaseConfig): Promise<{ success: boolean; message: string }> {
    try {
      if (config.engine === "postgres") {
        const testAdapter = new PostgresAdapter(config.postgresUrl);
        await testAdapter.init();
        const ok = await testAdapter.ping();
        await testAdapter.close();
        if (ok) {
          return { success: true, message: "PostgreSQL: Połączenie nawiązane pomyślnie." };
        }
        return { success: false, message: "PostgreSQL: Brak odpowiedzi z serwera bazy." };
      } else {
        const testAdapter = new SQLiteAdapter(config.sqlitePath);
        await testAdapter.init();
        const ok = await testAdapter.ping();
        await testAdapter.close();
        if (ok) {
          return { success: true, message: "SQLite: Plik bazy gotowy i poprawny." };
        }
        return { success: false, message: "SQLite: Błąd odczytu bazy danych." };
      }
    } catch (err: any) {
      return { success: false, message: err.message || "Błąd podczas testu połączenia z bazą." };
    }
  }

  async switchEngine(newConfig: DatabaseConfig): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Close current
      if (this.activeAdapter) {
        await this.activeAdapter.close();
        this.activeAdapter = null;
      }

      // 2. Initialize new
      this.currentConfig = newConfig;
      await this.init(newConfig);

      return {
        success: true,
        message: `Pomyślnie przełączono silnik bazy danych na ${newConfig.engine.toUpperCase()}`,
      };
    } catch (err: any) {
      // Fallback to SQLite
      console.error("Failed to switch database, falling back to SQLite:", err);
      this.currentConfig = { engine: "sqlite" };
      await this.init({ engine: "sqlite" });
      return {
        success: false,
        message: `Błąd przełączania: ${err.message}. Przywrócono SQLite.`,
      };
    }
  }

  private async ensureSeeded(): Promise<void> {
    if (!this.activeAdapter) return;
    try {
      const specs = await this.activeAdapter.getSpecialists();
      if (specs.length === 0) {
        console.log("Database is empty, auto-seeding sample dataset...");
        await this.activeAdapter.resetToSample(INITIAL_CALLERS, INITIAL_RECORDS, INITIAL_SPECIALISTS);
        console.log("Database seeded successfully with initial dataset.");
      }
    } catch (err) {
      console.error("Error during auto-seed check:", err);
    }
  }

  async resetDatabase(): Promise<void> {
    const adapter = await this.getAdapter();
    await adapter.resetToSample(INITIAL_CALLERS, INITIAL_RECORDS, INITIAL_SPECIALISTS);
  }

  async purgeDatabase(keepSpecialists: boolean = false): Promise<void> {
    const adapter = await this.getAdapter();
    await adapter.purgeData(keepSpecialists);
  }
}

export const dbManager = new DatabaseManager();
