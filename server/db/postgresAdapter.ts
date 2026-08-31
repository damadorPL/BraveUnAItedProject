import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as pgSchema from "./schema/postgres.js";
import {
  Caller,
  CallRecord,
  Specialist,
  RecordEditLog,
  AdminOverviewStats,
} from "../types.js";
import { DatabaseAdapter, CallerQueryOptions, RecordQueryOptions } from "./adapter.js";
import { INITIAL_SPECIALISTS } from "../../src/data/sampleData.js";

export class PostgresAdapter implements DatabaseAdapter {
  readonly engine = "postgres" as const;
  private pool: Pool | null = null;
  public drizzle: NodePgDatabase<typeof pgSchema> | null = null;
  private connectionString: string;

  constructor(connectionString?: string) {
    this.connectionString =
      connectionString ||
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@localhost:5432/brave_synapsis";
  }

  getConnectionString(): string {
    return this.connectionString;
  }

  async init(): Promise<void> {
    this.pool = new Pool({
      connectionString: this.connectionString,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 10,
    });
    this.drizzle = drizzle(this.pool, { schema: pgSchema });

    // Test connection & initialize schema
    const client = await this.pool.connect();
    try {
      await client.query("SELECT 1;");
      await this.createTables();
    } finally {
      client.release();
    }
  }

  private async createTables(): Promise<void> {
    if (!this.pool) throw new Error("PostgreSQL pool not initialized");

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS specialists (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        guidance_type VARCHAR(255) NOT NULL,
        avatar_bg VARCHAR(100) NOT NULL,
        avatar_url TEXT,
        email VARCHAR(255) NOT NULL UNIQUE,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS callers (
        id VARCHAR(100) PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(100) NOT NULL,
        voivodeship VARCHAR(100) NOT NULL,
        city VARCHAR(255) NOT NULL,
        beneficiary_types JSONB NOT NULL DEFAULT '[]',
        has_disability_certificate VARCHAR(50) NOT NULL,
        disability_degree VARCHAR(100),
        tags JSONB NOT NULL DEFAULT '[]',
        attachments JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS call_records (
        id VARCHAR(100) PRIMARY KEY,
        caller_id VARCHAR(100) NOT NULL REFERENCES callers(id) ON DELETE CASCADE,
        call_date TIMESTAMPTZ NOT NULL,
        specialist_id VARCHAR(100) NOT NULL,
        specialist_name VARCHAR(255) NOT NULL,
        specialist_role VARCHAR(255) NOT NULL,
        contact_types JSONB NOT NULL DEFAULT '[]',
        subject_targets JSONB NOT NULL DEFAULT '[]',
        guidance_type VARCHAR(255) NOT NULL,
        guidance_areas JSONB NOT NULL DEFAULT '[]',
        advice_description TEXT NOT NULL,
        notes TEXT,
        referred_to VARCHAR(255),
        referred_specialist_id VARCHAR(100),
        referred_specialist_email VARCHAR(255),
        referred_note TEXT,
        referred_status VARCHAR(50),
        attachments JSONB NOT NULL DEFAULT '[]',
        duration_minutes INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ,
        edit_logs JSONB NOT NULL DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(100) PRIMARY KEY,
        record_id VARCHAR(100) NOT NULL,
        edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        editor_id VARCHAR(100) NOT NULL,
        editor_name VARCHAR(255) NOT NULL,
        editor_role VARCHAR(255) NOT NULL,
        summary TEXT NOT NULL,
        changes JSONB NOT NULL DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS passwords (
        specialist_id VARCHAR(100) PRIMARY KEY REFERENCES specialists(id) ON DELETE CASCADE,
        password_hash TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_pg_callers_names ON callers(last_name, first_name);
      CREATE INDEX IF NOT EXISTS idx_pg_callers_phone ON callers(phone_number);
      CREATE INDEX IF NOT EXISTS idx_pg_records_caller ON call_records(caller_id);
      CREATE INDEX IF NOT EXISTS idx_pg_records_date ON call_records(call_date);
    `);
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  async ping(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const res = await this.pool.query("SELECT 1 as ok;");
      return res.rows.length > 0;
    } catch {
      return false;
    }
  }

  async getStats(): Promise<AdminOverviewStats> {
    if (!this.pool) throw new Error("PG pool not open");

    const callerCountRes = await this.pool.query("SELECT count(*)::int as count FROM callers");
    const recordCountRes = await this.pool.query("SELECT count(*)::int as count FROM call_records");
    const specCountRes = await this.pool.query("SELECT count(*)::int as count FROM specialists");
    const pendingRes = await this.pool.query(
      "SELECT count(*)::int as count FROM call_records WHERE referred_status = 'OCZEKUJĄCA'"
    );

    const recentLogs = await this.getAuditLogs(10);

    return {
      totalCallers: callerCountRes.rows[0]?.count || 0,
      totalRecords: recordCountRes.rows[0]?.count || 0,
      totalSpecialists: specCountRes.rows[0]?.count || 0,
      totalPendingReferrals: pendingRes.rows[0]?.count || 0,
      databaseEngine: "postgres",
      databaseStatus: "connected",
      databaseLocation: this.connectionString.replace(/:\/\/[^@]+@/, "://***:***@"),
      recentAuditLogs: recentLogs,
    };
  }

  async resetToSample(
    initialCallers: Caller[],
    initialRecords: CallRecord[],
    initialSpecialists: Specialist[]
  ): Promise<void> {
    if (!this.pool) throw new Error("PG pool not open");
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      await client.query("TRUNCATE TABLE audit_logs CASCADE;");
      await client.query("TRUNCATE TABLE call_records CASCADE;");
      await client.query("TRUNCATE TABLE callers CASCADE;");
      await client.query("TRUNCATE TABLE passwords CASCADE;");
      await client.query("TRUNCATE TABLE specialists CASCADE;");

      for (const s of initialSpecialists) {
        await client.query(
          `INSERT INTO specialists (id, name, role, title, guidance_type, avatar_bg, avatar_url, email, is_admin)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [s.id, s.name, s.role, s.title, s.guidanceType, s.avatarBg, s.avatarUrl || null, s.email.toLowerCase(), s.isAdmin || false]
        );
      }

      for (const c of initialCallers) {
        await client.query(
          `INSERT INTO callers (id, first_name, last_name, phone_number, voivodeship, city, beneficiary_types, has_disability_certificate, disability_degree, tags, attachments, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            c.id,
            c.firstName,
            c.lastName,
            c.phoneNumber,
            c.voivodeship,
            c.city,
            JSON.stringify(c.beneficiaryTypes || []),
            c.hasDisabilityCertificate,
            c.disabilityDegree || null,
            JSON.stringify(c.tags || []),
            JSON.stringify(c.attachments || []),
            c.createdAt,
            c.updatedAt,
          ]
        );
      }

      for (const r of initialRecords) {
        await client.query(
          `INSERT INTO call_records (
            id, caller_id, call_date, specialist_id, specialist_name, specialist_role,
            contact_types, subject_targets, guidance_type, guidance_areas, advice_description,
            notes, referred_to, referred_specialist_id, referred_specialist_email, referred_note,
            referred_status, attachments, duration_minutes, created_at, updated_at, edit_logs
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
          [
            r.id,
            r.callerId,
            r.callDate,
            r.specialistId,
            r.specialistName,
            r.specialistRole,
            JSON.stringify(r.contactTypes || []),
            JSON.stringify(r.subjectTargets || []),
            r.guidanceType,
            JSON.stringify(r.guidanceAreas || []),
            r.adviceDescription,
            r.notes || null,
            r.referredTo || null,
            r.referredSpecialistId || null,
            r.referredSpecialistEmail || null,
            r.referredNote || null,
            r.referredStatus || null,
            JSON.stringify(r.attachments || []),
            r.durationMinutes || 0,
            r.createdAt,
            r.updatedAt || null,
            JSON.stringify(r.editLogs || []),
          ]
        );
      }

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async purgeData(keepSpecialists: boolean = false): Promise<void> {
    if (!this.pool) throw new Error("PG pool not open");
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      await client.query("TRUNCATE TABLE audit_logs CASCADE;");
      await client.query("TRUNCATE TABLE call_records CASCADE;");
      await client.query("TRUNCATE TABLE callers CASCADE;");

      if (!keepSpecialists) {
        await client.query("DELETE FROM passwords WHERE specialist_id NOT IN (SELECT id FROM specialists WHERE is_admin = true);");
        await client.query("DELETE FROM specialists WHERE is_admin IS NOT TRUE;");

        const adminRes = await client.query("SELECT id FROM specialists WHERE is_admin = true LIMIT 1;");
        if (adminRes.rows.length === 0) {
          const defaultAdmin = INITIAL_SPECIALISTS.find((s) => s.isAdmin) || INITIAL_SPECIALISTS[0];
          await client.query(
            `INSERT INTO specialists (id, name, role, title, guidance_type, avatar_bg, avatar_url, email, is_admin)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              defaultAdmin.id,
              defaultAdmin.name,
              defaultAdmin.role,
              defaultAdmin.title,
              defaultAdmin.guidanceType,
              defaultAdmin.avatarBg,
              defaultAdmin.avatarUrl || null,
              defaultAdmin.email.toLowerCase(),
              true,
            ]
          );
        }
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // Callers
  async getCallers(options?: CallerQueryOptions): Promise<Caller[]> {
    if (!this.pool) throw new Error("PG pool not open");
    let query = "SELECT * FROM callers";
    const conditions: string[] = [];
    const params: any[] = [];

    if (options?.search) {
      params.push(`%${options.search}%`);
      const idx = params.length;
      conditions.push(`(first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR phone_number ILIKE $${idx} OR city ILIKE $${idx})`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY last_name ASC, first_name ASC";

    if (options?.limit) {
      params.push(options.limit);
      query += ` LIMIT $${params.length}`;
      if (options?.offset) {
        params.push(options.offset);
        query += ` OFFSET $${params.length}`;
      }
    }

    const res = await this.pool.query(query, params);
    return res.rows.map((r) => this.mapCallerRow(r));
  }

  async getCallerById(id: string): Promise<Caller | null> {
    if (!this.pool) throw new Error("PG pool not open");
    const res = await this.pool.query("SELECT * FROM callers WHERE id = $1", [id]);
    if (res.rows.length === 0) return null;
    return this.mapCallerRow(res.rows[0]);
  }

  async createCaller(caller: Caller): Promise<Caller> {
    if (!this.pool) throw new Error("PG pool not open");
    await this.pool.query(
      `INSERT INTO callers (id, first_name, last_name, phone_number, voivodeship, city, beneficiary_types, has_disability_certificate, disability_degree, tags, attachments, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        caller.id,
        caller.firstName,
        caller.lastName,
        caller.phoneNumber,
        caller.voivodeship,
        caller.city,
        JSON.stringify(caller.beneficiaryTypes || []),
        caller.hasDisabilityCertificate,
        caller.disabilityDegree || null,
        JSON.stringify(caller.tags || []),
        JSON.stringify(caller.attachments || []),
        caller.createdAt || new Date().toISOString(),
        caller.updatedAt || new Date().toISOString(),
      ]
    );
    return caller;
  }

  async updateCaller(caller: Caller): Promise<Caller> {
    if (!this.pool) throw new Error("PG pool not open");
    await this.pool.query(
      `UPDATE callers SET
        first_name = $1,
        last_name = $2,
        phone_number = $3,
        voivodeship = $4,
        city = $5,
        beneficiary_types = $6,
        has_disability_certificate = $7,
        disability_degree = $8,
        tags = $9,
        attachments = $10,
        updated_at = NOW()
       WHERE id = $11`,
      [
        caller.firstName,
        caller.lastName,
        caller.phoneNumber,
        caller.voivodeship,
        caller.city,
        JSON.stringify(caller.beneficiaryTypes || []),
        caller.hasDisabilityCertificate,
        caller.disabilityDegree || null,
        JSON.stringify(caller.tags || []),
        JSON.stringify(caller.attachments || []),
        caller.id,
      ]
    );
    return (await this.getCallerById(caller.id)) || caller;
  }

  async deleteCaller(id: string): Promise<boolean> {
    if (!this.pool) throw new Error("PG pool not open");
    const res = await this.pool.query("DELETE FROM callers WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  }

  // Records
  async getRecords(options?: RecordQueryOptions): Promise<CallRecord[]> {
    if (!this.pool) throw new Error("PG pool not open");
    let query = "SELECT * FROM call_records";
    const conditions: string[] = [];
    const params: any[] = [];

    if (options?.callerId) {
      params.push(options.callerId);
      conditions.push(`caller_id = $${params.length}`);
    }
    if (options?.specialistId) {
      params.push(options.specialistId);
      conditions.push(`specialist_id = $${params.length}`);
    }
    if (options?.guidanceType) {
      params.push(options.guidanceType);
      conditions.push(`guidance_type = $${params.length}`);
    }
    if (options?.search) {
      params.push(`%${options.search}%`);
      const idx = params.length;
      conditions.push(`(advice_description ILIKE $${idx} OR notes ILIKE $${idx} OR specialist_name ILIKE $${idx})`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY call_date DESC";

    if (options?.limit) {
      params.push(options.limit);
      query += ` LIMIT $${params.length}`;
      if (options?.offset) {
        params.push(options.offset);
        query += ` OFFSET $${params.length}`;
      }
    }

    const res = await this.pool.query(query, params);
    return res.rows.map((r) => this.mapRecordRow(r));
  }

  async getRecordById(id: string): Promise<CallRecord | null> {
    if (!this.pool) throw new Error("PG pool not open");
    const res = await this.pool.query("SELECT * FROM call_records WHERE id = $1", [id]);
    if (res.rows.length === 0) return null;
    return this.mapRecordRow(res.rows[0]);
  }

  async getRecordsByCallerId(callerId: string): Promise<CallRecord[]> {
    if (!this.pool) throw new Error("PG pool not open");
    const res = await this.pool.query("SELECT * FROM call_records WHERE caller_id = $1 ORDER BY call_date DESC", [callerId]);
    return res.rows.map((r) => this.mapRecordRow(r));
  }

  async createRecord(record: CallRecord): Promise<CallRecord> {
    if (!this.pool) throw new Error("PG pool not open");
    await this.pool.query(
      `INSERT INTO call_records (
        id, caller_id, call_date, specialist_id, specialist_name, specialist_role,
        contact_types, subject_targets, guidance_type, guidance_areas, advice_description,
        notes, referred_to, referred_specialist_id, referred_specialist_email, referred_note,
        referred_status, attachments, duration_minutes, created_at, updated_at, edit_logs
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
      [
        record.id,
        record.callerId,
        record.callDate,
        record.specialistId,
        record.specialistName,
        record.specialistRole,
        JSON.stringify(record.contactTypes || []),
        JSON.stringify(record.subjectTargets || []),
        record.guidanceType,
        JSON.stringify(record.guidanceAreas || []),
        record.adviceDescription,
        record.notes || null,
        record.referredTo || null,
        record.referredSpecialistId || null,
        record.referredSpecialistEmail || null,
        record.referredNote || null,
        record.referredStatus || null,
        JSON.stringify(record.attachments || []),
        record.durationMinutes || 0,
        record.createdAt || new Date().toISOString(),
        record.updatedAt || null,
        JSON.stringify(record.editLogs || []),
      ]
    );
    return record;
  }

  async updateRecord(record: CallRecord): Promise<CallRecord> {
    if (!this.pool) throw new Error("PG pool not open");
    await this.pool.query(
      `UPDATE call_records SET
        call_date = $1,
        specialist_id = $2,
        specialist_name = $3,
        specialist_role = $4,
        contact_types = $5,
        subject_targets = $6,
        guidance_type = $7,
        guidance_areas = $8,
        advice_description = $9,
        notes = $10,
        referred_to = $11,
        referred_specialist_id = $12,
        referred_specialist_email = $13,
        referred_note = $14,
        referred_status = $15,
        attachments = $16,
        duration_minutes = $17,
        updated_at = NOW(),
        edit_logs = $18
      WHERE id = $19`,
      [
        record.callDate,
        record.specialistId,
        record.specialistName,
        record.specialistRole,
        JSON.stringify(record.contactTypes || []),
        JSON.stringify(record.subjectTargets || []),
        record.guidanceType,
        JSON.stringify(record.guidanceAreas || []),
        record.adviceDescription,
        record.notes || null,
        record.referredTo || null,
        record.referredSpecialistId || null,
        record.referredSpecialistEmail || null,
        record.referredNote || null,
        record.referredStatus || null,
        JSON.stringify(record.attachments || []),
        record.durationMinutes || 0,
        JSON.stringify(record.editLogs || []),
        record.id,
      ]
    );
    return (await this.getRecordById(record.id)) || record;
  }

  async deleteRecord(id: string): Promise<boolean> {
    if (!this.pool) throw new Error("PG pool not open");
    const res = await this.pool.query("DELETE FROM call_records WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  }

  // Specialists
  async getSpecialists(): Promise<Specialist[]> {
    if (!this.pool) throw new Error("PG pool not open");
    const res = await this.pool.query("SELECT * FROM specialists ORDER BY name ASC");
    return res.rows.map((r) => this.mapSpecialistRow(r));
  }

  async getSpecialistById(id: string): Promise<Specialist | null> {
    if (!this.pool) throw new Error("PG pool not open");
    const res = await this.pool.query("SELECT * FROM specialists WHERE id = $1", [id]);
    if (res.rows.length === 0) return null;
    return this.mapSpecialistRow(res.rows[0]);
  }

  async getSpecialistByEmail(email: string): Promise<Specialist | null> {
    if (!this.pool) throw new Error("PG pool not open");
    const res = await this.pool.query("SELECT * FROM specialists WHERE LOWER(email) = LOWER($1)", [email.trim()]);
    if (res.rows.length === 0) return null;
    return this.mapSpecialistRow(res.rows[0]);
  }

  async createSpecialist(specialist: Specialist): Promise<Specialist> {
    if (!this.pool) throw new Error("PG pool not open");
    await this.pool.query(
      `INSERT INTO specialists (id, name, role, title, guidance_type, avatar_bg, avatar_url, email, is_admin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        specialist.id,
        specialist.name,
        specialist.role,
        specialist.title,
        specialist.guidanceType,
        specialist.avatarBg,
        specialist.avatarUrl || null,
        specialist.email.trim().toLowerCase(),
        specialist.isAdmin || false,
      ]
    );
    return specialist;
  }

  async updateSpecialist(specialist: Specialist): Promise<Specialist> {
    if (!this.pool) throw new Error("PG pool not open");
    await this.pool.query(
      `UPDATE specialists SET
        name = $1,
        role = $2,
        title = $3,
        guidance_type = $4,
        avatar_bg = $5,
        avatar_url = $6,
        email = $7,
        is_admin = $8
      WHERE id = $9`,
      [
        specialist.name,
        specialist.role,
        specialist.title,
        specialist.guidanceType,
        specialist.avatarBg,
        specialist.avatarUrl || null,
        specialist.email.trim().toLowerCase(),
        specialist.isAdmin || false,
        specialist.id,
      ]
    );
    return (await this.getSpecialistById(specialist.id)) || specialist;
  }

  async deleteSpecialist(id: string): Promise<boolean> {
    if (!this.pool) throw new Error("PG pool not open");
    const res = await this.pool.query("DELETE FROM specialists WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async getPasswordHash(specialistId: string): Promise<string | null> {
    if (!this.pool) throw new Error("PG pool not open");
    const res = await this.pool.query("SELECT password_hash FROM passwords WHERE specialist_id = $1", [specialistId]);
    return res.rows[0]?.password_hash || null;
  }

  async setPasswordHash(specialistId: string, passwordHash: string): Promise<void> {
    if (!this.pool) throw new Error("PG pool not open");
    await this.pool.query(
      `INSERT INTO passwords (specialist_id, password_hash, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (specialist_id) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()`,
      [specialistId, passwordHash]
    );
  }

  // Audit Logs
  async getAuditLogs(limit: number = 100): Promise<RecordEditLog[]> {
    if (!this.pool) throw new Error("PG pool not open");
    const res = await this.pool.query("SELECT * FROM audit_logs ORDER BY edited_at DESC LIMIT $1", [limit]);
    return res.rows.map((r) => ({
      id: r.id,
      recordId: r.record_id,
      editedAt: r.edited_at,
      editorId: r.editor_id,
      editorName: r.editor_name,
      editorRole: r.editor_role,
      summary: r.summary,
      changes: typeof r.changes === "string" ? JSON.parse(r.changes) : r.changes,
    }));
  }

  async createAuditLog(log: RecordEditLog): Promise<RecordEditLog> {
    if (!this.pool) throw new Error("PG pool not open");
    await this.pool.query(
      `INSERT INTO audit_logs (id, record_id, edited_at, editor_id, editor_name, editor_role, summary, changes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        log.id,
        log.recordId,
        log.editedAt || new Date().toISOString(),
        log.editorId,
        log.editorName,
        log.editorRole,
        log.summary,
        JSON.stringify(log.changes || []),
      ]
    );
    return log;
  }

  async mergeCallers(
    sourceCallerId: string,
    targetCallerId: string,
    customMergedData?: Partial<Caller>
  ): Promise<{
    mergedCaller: Caller;
    migratedRecordCount: number;
    migratedAttachmentCount: number;
  }> {
    if (!this.pool) throw new Error("PG pool not open");

    const sourceCaller = await this.getCallerById(sourceCallerId);
    const targetCaller = await this.getCallerById(targetCallerId);
    if (!sourceCaller || !targetCaller) {
      throw new Error("Source or target caller not found");
    }

    const sourceAttachments = sourceCaller.attachments || [];
    const targetAttachments = targetCaller.attachments || [];
    const combinedAttachments = [...targetAttachments, ...sourceAttachments];

    const sourceTags = sourceCaller.tags || [];
    const targetTags = targetCaller.tags || [];
    const combinedTags = Array.from(new Set([...targetTags, ...sourceTags]));

    const mergedCallerData: Caller = {
      ...targetCaller,
      ...customMergedData,
      id: targetCallerId,
      tags: customMergedData?.tags || combinedTags,
      attachments: customMergedData?.attachments || combinedAttachments,
      updatedAt: new Date().toISOString(),
    };

    const client = await this.pool.connect();
    let recordCount = 0;

    try {
      await client.query("BEGIN");
      const res = await client.query("UPDATE call_records SET caller_id = $1 WHERE caller_id = $2", [
        targetCallerId,
        sourceCallerId,
      ]);
      recordCount = res.rowCount ?? 0;

      await client.query("DELETE FROM callers WHERE id = $1", [sourceCallerId]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    await this.updateCaller(mergedCallerData);
    const finalTarget = (await this.getCallerById(targetCallerId)) || mergedCallerData;

    return {
      mergedCaller: finalTarget,
      migratedRecordCount: recordCount,
      migratedAttachmentCount: sourceAttachments.length,
    };
  }

  private mapCallerRow(row: any): Caller {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      phoneNumber: row.phone_number,
      voivodeship: row.voivodeship,
      city: row.city,
      beneficiaryTypes: typeof row.beneficiary_types === "string" ? JSON.parse(row.beneficiary_types) : row.beneficiary_types,
      hasDisabilityCertificate: row.has_disability_certificate,
      disabilityDegree: row.disability_degree || undefined,
      tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
      attachments: typeof row.attachments === "string" ? JSON.parse(row.attachments) : row.attachments,
      createdAt: typeof row.created_at === "string" ? row.created_at : row.created_at.toISOString(),
      updatedAt: typeof row.updated_at === "string" ? row.updated_at : row.updated_at.toISOString(),
    };
  }

  private mapRecordRow(row: any): CallRecord {
    return {
      id: row.id,
      callerId: row.caller_id,
      callDate: typeof row.call_date === "string" ? row.call_date : row.call_date.toISOString(),
      specialistId: row.specialist_id,
      specialistName: row.specialist_name,
      specialistRole: row.specialist_role,
      contactTypes: typeof row.contact_types === "string" ? JSON.parse(row.contact_types) : row.contact_types,
      subjectTargets: typeof row.subject_targets === "string" ? JSON.parse(row.subject_targets) : row.subject_targets,
      guidanceType: row.guidance_type,
      guidanceAreas: typeof row.guidance_areas === "string" ? JSON.parse(row.guidance_areas) : row.guidance_areas,
      adviceDescription: row.advice_description,
      notes: row.notes || undefined,
      referredTo: row.referred_to || undefined,
      referredSpecialistId: row.referred_specialist_id || undefined,
      referredSpecialistEmail: row.referred_specialist_email || undefined,
      referredNote: row.referred_note || undefined,
      referredStatus: row.referred_status || undefined,
      attachments: typeof row.attachments === "string" ? JSON.parse(row.attachments) : row.attachments,
      durationMinutes: Number(row.duration_minutes) || 0,
      createdAt: typeof row.created_at === "string" ? row.created_at : row.created_at.toISOString(),
      updatedAt: row.updated_at ? (typeof row.updated_at === "string" ? row.updated_at : row.updated_at.toISOString()) : undefined,
      editLogs: typeof row.edit_logs === "string" ? JSON.parse(row.edit_logs) : row.edit_logs,
    };
  }

  private mapSpecialistRow(row: any): Specialist {
    return {
      id: row.id,
      name: row.name,
      role: row.role,
      title: row.title,
      guidanceType: row.guidance_type,
      avatarBg: row.avatar_bg,
      avatarUrl: row.avatar_url || undefined,
      email: row.email,
      isAdmin: Boolean(row.is_admin),
    };
  }
}
