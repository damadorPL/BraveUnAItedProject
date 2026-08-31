import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as sqliteSchema from "./schema/sqlite.js";
import {
  Caller,
  CallRecord,
  Specialist,
  RecordEditLog,
  AdminOverviewStats,
} from "../types.js";
import { DatabaseAdapter, CallerQueryOptions, RecordQueryOptions } from "./adapter.js";
import { INITIAL_SPECIALISTS } from "../../src/data/sampleData.js";

export class SQLiteAdapter implements DatabaseAdapter {
  readonly engine = "sqlite" as const;
  private db: Database.Database | null = null;
  public drizzle: BetterSQLite3Database<typeof sqliteSchema> | null = null;
  private dbPath: string;

  constructor(customPath?: string) {
    this.dbPath = customPath || path.resolve(process.cwd(), "data", "synapsis.sqlite");
  }

  getDbPath(): string {
    return this.dbPath;
  }

  async init(): Promise<void> {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(this.dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.drizzle = drizzle(this.db, { schema: sqliteSchema });

    this.createTables();
  }

  private createTables(): void {
    if (!this.db) throw new Error("SQLite DB not initialized");

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS specialists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        title TEXT NOT NULL,
        guidanceType TEXT NOT NULL,
        avatarBg TEXT NOT NULL,
        avatarUrl TEXT,
        email TEXT NOT NULL UNIQUE,
        isAdmin INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS callers (
        id TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        phoneNumber TEXT NOT NULL,
        voivodeship TEXT NOT NULL,
        city TEXT NOT NULL,
        beneficiaryTypes TEXT NOT NULL,
        hasDisabilityCertificate TEXT NOT NULL,
        disabilityDegree TEXT,
        tags TEXT NOT NULL,
        attachments TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS call_records (
        id TEXT PRIMARY KEY,
        callerId TEXT NOT NULL,
        callDate TEXT NOT NULL,
        specialistId TEXT NOT NULL,
        specialistName TEXT NOT NULL,
        specialistRole TEXT NOT NULL,
        contactTypes TEXT NOT NULL,
        subjectTargets TEXT NOT NULL,
        guidanceType TEXT NOT NULL,
        guidanceAreas TEXT NOT NULL,
        adviceDescription TEXT NOT NULL,
        notes TEXT,
        referredTo TEXT,
        referredSpecialistId TEXT,
        referredSpecialistEmail TEXT,
        referredNote TEXT,
        referredStatus TEXT,
        attachments TEXT,
        durationMinutes INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT,
        editLogs TEXT,
        FOREIGN KEY (callerId) REFERENCES callers(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        recordId TEXT NOT NULL,
        editedAt TEXT NOT NULL,
        editorId TEXT NOT NULL,
        editorName TEXT NOT NULL,
        editorRole TEXT NOT NULL,
        summary TEXT NOT NULL,
        changes TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS passwords (
        specialistId TEXT PRIMARY KEY,
        passwordHash TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (specialistId) REFERENCES specialists(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_callers_names ON callers(lastName, firstName);
      CREATE INDEX IF NOT EXISTS idx_callers_phone ON callers(phoneNumber);
      CREATE INDEX IF NOT EXISTS idx_records_caller ON call_records(callerId);
      CREATE INDEX IF NOT EXISTS idx_records_date ON call_records(callDate);
      CREATE INDEX IF NOT EXISTS idx_records_specialist ON call_records(specialistId);
      CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_logs(recordId);
    `);
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async ping(): Promise<boolean> {
    if (!this.db) return false;
    try {
      const row = this.db.prepare("SELECT 1 as ok").get() as { ok: number } | undefined;
      return row?.ok === 1;
    } catch {
      return false;
    }
  }

  async getStats(): Promise<AdminOverviewStats> {
    if (!this.db) throw new Error("DB not open");

    const callerCount = (this.db.prepare("SELECT count(*) as count FROM callers").get() as any)?.count ?? 0;
    const recordCount = (this.db.prepare("SELECT count(*) as count FROM call_records").get() as any)?.count ?? 0;
    const specialistCount = (this.db.prepare("SELECT count(*) as count FROM specialists").get() as any)?.count ?? 0;
    const pendingReferrals = (
      this.db.prepare("SELECT count(*) as count FROM call_records WHERE referredStatus = 'OCZEKUJĄCA'").get() as any
    )?.count ?? 0;

    const recentLogs = await this.getAuditLogs(10);

    return {
      totalCallers: callerCount,
      totalRecords: recordCount,
      totalSpecialists: specialistCount,
      totalPendingReferrals: pendingReferrals,
      databaseEngine: "sqlite",
      databaseStatus: "connected",
      databaseLocation: this.dbPath,
      recentAuditLogs: recentLogs,
    };
  }

  async resetToSample(
    initialCallers: Caller[],
    initialRecords: CallRecord[],
    initialSpecialists: Specialist[]
  ): Promise<void> {
    if (!this.db) throw new Error("DB not open");

    const transaction = this.db.transaction(() => {
      this.db!.exec("DELETE FROM audit_logs;");
      this.db!.exec("DELETE FROM call_records;");
      this.db!.exec("DELETE FROM callers;");
      this.db!.exec("DELETE FROM passwords;");
      this.db!.exec("DELETE FROM specialists;");

      const insertSpec = this.db!.prepare(`
        INSERT INTO specialists (id, name, role, title, guidanceType, avatarBg, avatarUrl, email, isAdmin, createdAt)
        VALUES (@id, @name, @role, @title, @guidanceType, @avatarBg, @avatarUrl, @email, @isAdmin, @createdAt)
      `);

      for (const s of initialSpecialists) {
        insertSpec.run({
          id: s.id,
          name: s.name,
          role: s.role,
          title: s.title,
          guidanceType: s.guidanceType,
          avatarBg: s.avatarBg,
          avatarUrl: s.avatarUrl || null,
          email: s.email,
          isAdmin: s.isAdmin ? 1 : 0,
          createdAt: new Date().toISOString(),
        });
      }

      const insertCaller = this.db!.prepare(`
        INSERT INTO callers (id, firstName, lastName, phoneNumber, voivodeship, city, beneficiaryTypes, hasDisabilityCertificate, disabilityDegree, tags, attachments, createdAt, updatedAt)
        VALUES (@id, @firstName, @lastName, @phoneNumber, @voivodeship, @city, @beneficiaryTypes, @hasDisabilityCertificate, @disabilityDegree, @tags, @attachments, @createdAt, @updatedAt)
      `);

      for (const c of initialCallers) {
        insertCaller.run({
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          phoneNumber: c.phoneNumber,
          voivodeship: c.voivodeship,
          city: c.city,
          beneficiaryTypes: JSON.stringify(c.beneficiaryTypes || []),
          hasDisabilityCertificate: c.hasDisabilityCertificate,
          disabilityDegree: c.disabilityDegree || null,
          tags: JSON.stringify(c.tags || []),
          attachments: JSON.stringify(c.attachments || []),
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        });
      }

      const insertRecord = this.db!.prepare(`
        INSERT INTO call_records (
          id, callerId, callDate, specialistId, specialistName, specialistRole,
          contactTypes, subjectTargets, guidanceType, guidanceAreas, adviceDescription,
          notes, referredTo, referredSpecialistId, referredSpecialistEmail, referredNote,
          referredStatus, attachments, durationMinutes, createdAt, updatedAt, editLogs
        ) VALUES (
          @id, @callerId, @callDate, @specialistId, @specialistName, @specialistRole,
          @contactTypes, @subjectTargets, @guidanceType, @guidanceAreas, @adviceDescription,
          @notes, @referredTo, @referredSpecialistId, @referredSpecialistEmail, @referredNote,
          @referredStatus, @attachments, @durationMinutes, @createdAt, @updatedAt, @editLogs
        )
      `);

      for (const r of initialRecords) {
        insertRecord.run({
          id: r.id,
          callerId: r.callerId,
          callDate: r.callDate,
          specialistId: r.specialistId,
          specialistName: r.specialistName,
          specialistRole: r.specialistRole,
          contactTypes: JSON.stringify(r.contactTypes || []),
          subjectTargets: JSON.stringify(r.subjectTargets || []),
          guidanceType: r.guidanceType,
          guidanceAreas: JSON.stringify(r.guidanceAreas || []),
          adviceDescription: r.adviceDescription,
          notes: r.notes || null,
          referredTo: r.referredTo || null,
          referredSpecialistId: r.referredSpecialistId || null,
          referredSpecialistEmail: r.referredSpecialistEmail || null,
          referredNote: r.referredNote || null,
          referredStatus: r.referredStatus || null,
          attachments: JSON.stringify(r.attachments || []),
          durationMinutes: r.durationMinutes || 0,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt || null,
          editLogs: JSON.stringify(r.editLogs || []),
        });
      }
    });

    transaction();
  }

  async purgeData(keepSpecialists: boolean = false): Promise<void> {
    if (!this.db) throw new Error("DB not open");

    const transaction = this.db.transaction(() => {
      this.db!.exec("DELETE FROM audit_logs;");
      this.db!.exec("DELETE FROM call_records;");
      this.db!.exec("DELETE FROM callers;");

      if (!keepSpecialists) {
        // Delete password entries for non-admin accounts
        this.db!.exec("DELETE FROM passwords WHERE specialistId NOT IN (SELECT id FROM specialists WHERE isAdmin = 1);");
        this.db!.exec("DELETE FROM specialists WHERE isAdmin != 1;");

        // Guarantee at least one Administrator account exists
        const adminExists = this.db!.prepare("SELECT id FROM specialists WHERE isAdmin = 1 LIMIT 1").get();
        if (!adminExists) {
          const defaultAdmin = INITIAL_SPECIALISTS.find((s) => s.isAdmin) || INITIAL_SPECIALISTS[0];
          this.db!.prepare(`
            INSERT OR REPLACE INTO specialists (id, name, role, title, guidanceType, avatarBg, avatarUrl, email, isAdmin, createdAt)
            VALUES (@id, @name, @role, @title, @guidanceType, @avatarBg, @avatarUrl, @email, @isAdmin, @createdAt)
          `).run({
            id: defaultAdmin.id,
            name: defaultAdmin.name,
            role: defaultAdmin.role,
            title: defaultAdmin.title,
            guidanceType: defaultAdmin.guidanceType,
            avatarBg: defaultAdmin.avatarBg,
            avatarUrl: defaultAdmin.avatarUrl || null,
            email: defaultAdmin.email.toLowerCase(),
            isAdmin: 1,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    transaction();
  }

  // Callers
  async getCallers(options?: CallerQueryOptions): Promise<Caller[]> {
    if (!this.db) throw new Error("DB not open");
    let query = "SELECT * FROM callers";
    const conditions: string[] = [];
    const params: any[] = [];

    if (options?.search) {
      conditions.push("(firstName LIKE ? OR lastName LIKE ? OR phoneNumber LIKE ? OR city LIKE ?)");
      const term = `%${options.search}%`;
      params.push(term, term, term, term);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY lastName ASC, firstName ASC";

    if (options?.limit) {
      query += " LIMIT ?";
      params.push(options.limit);
      if (options?.offset) {
        query += " OFFSET ?";
        params.push(options.offset);
      }
    }

    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map((r) => this.mapCallerRow(r));
  }

  async getCallerById(id: string): Promise<Caller | null> {
    if (!this.db) throw new Error("DB not open");
    const row = this.db.prepare("SELECT * FROM callers WHERE id = ?").get(id) as any;
    if (!row) return null;
    return this.mapCallerRow(row);
  }

  async createCaller(caller: Caller): Promise<Caller> {
    if (!this.db) throw new Error("DB not open");
    const stmt = this.db.prepare(`
      INSERT INTO callers (id, firstName, lastName, phoneNumber, voivodeship, city, beneficiaryTypes, hasDisabilityCertificate, disabilityDegree, tags, attachments, createdAt, updatedAt)
      VALUES (@id, @firstName, @lastName, @phoneNumber, @voivodeship, @city, @beneficiaryTypes, @hasDisabilityCertificate, @disabilityDegree, @tags, @attachments, @createdAt, @updatedAt)
    `);
    stmt.run({
      id: caller.id,
      firstName: caller.firstName,
      lastName: caller.lastName,
      phoneNumber: caller.phoneNumber,
      voivodeship: caller.voivodeship,
      city: caller.city,
      beneficiaryTypes: JSON.stringify(caller.beneficiaryTypes || []),
      hasDisabilityCertificate: caller.hasDisabilityCertificate,
      disabilityDegree: caller.disabilityDegree || null,
      tags: JSON.stringify(caller.tags || []),
      attachments: JSON.stringify(caller.attachments || []),
      createdAt: caller.createdAt || new Date().toISOString(),
      updatedAt: caller.updatedAt || new Date().toISOString(),
    });
    return caller;
  }

  async updateCaller(caller: Caller): Promise<Caller> {
    if (!this.db) throw new Error("DB not open");
    const stmt = this.db.prepare(`
      UPDATE callers SET
        firstName = @firstName,
        lastName = @lastName,
        phoneNumber = @phoneNumber,
        voivodeship = @voivodeship,
        city = @city,
        beneficiaryTypes = @beneficiaryTypes,
        hasDisabilityCertificate = @hasDisabilityCertificate,
        disabilityDegree = @disabilityDegree,
        tags = @tags,
        attachments = @attachments,
        updatedAt = @updatedAt
      WHERE id = @id
    `);
    stmt.run({
      id: caller.id,
      firstName: caller.firstName,
      lastName: caller.lastName,
      phoneNumber: caller.phoneNumber,
      voivodeship: caller.voivodeship,
      city: caller.city,
      beneficiaryTypes: JSON.stringify(caller.beneficiaryTypes || []),
      hasDisabilityCertificate: caller.hasDisabilityCertificate,
      disabilityDegree: caller.disabilityDegree || null,
      tags: JSON.stringify(caller.tags || []),
      attachments: JSON.stringify(caller.attachments || []),
      updatedAt: new Date().toISOString(),
    });
    return (await this.getCallerById(caller.id)) || caller;
  }

  async deleteCaller(id: string): Promise<boolean> {
    if (!this.db) throw new Error("DB not open");
    const res = this.db.prepare("DELETE FROM callers WHERE id = ?").run(id);
    return res.changes > 0;
  }

  // Records
  async getRecords(options?: RecordQueryOptions): Promise<CallRecord[]> {
    if (!this.db) throw new Error("DB not open");
    let query = "SELECT * FROM call_records";
    const conditions: string[] = [];
    const params: any[] = [];

    if (options?.callerId) {
      conditions.push("callerId = ?");
      params.push(options.callerId);
    }
    if (options?.specialistId) {
      conditions.push("specialistId = ?");
      params.push(options.specialistId);
    }
    if (options?.guidanceType) {
      conditions.push("guidanceType = ?");
      params.push(options.guidanceType);
    }
    if (options?.search) {
      conditions.push("(adviceDescription LIKE ? OR notes LIKE ? OR specialistName LIKE ?)");
      const term = `%${options.search}%`;
      params.push(term, term, term);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY callDate DESC";

    if (options?.limit) {
      query += " LIMIT ?";
      params.push(options.limit);
      if (options?.offset) {
        query += " OFFSET ?";
        params.push(options.offset);
      }
    }

    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map((r) => this.mapRecordRow(r));
  }

  async getRecordById(id: string): Promise<CallRecord | null> {
    if (!this.db) throw new Error("DB not open");
    const row = this.db.prepare("SELECT * FROM call_records WHERE id = ?").get(id) as any;
    if (!row) return null;
    return this.mapRecordRow(row);
  }

  async getRecordsByCallerId(callerId: string): Promise<CallRecord[]> {
    if (!this.db) throw new Error("DB not open");
    const rows = this.db.prepare("SELECT * FROM call_records WHERE callerId = ? ORDER BY callDate DESC").all(callerId) as any[];
    return rows.map((r) => this.mapRecordRow(r));
  }

  async createRecord(record: CallRecord): Promise<CallRecord> {
    if (!this.db) throw new Error("DB not open");
    const stmt = this.db.prepare(`
      INSERT INTO call_records (
        id, callerId, callDate, specialistId, specialistName, specialistRole,
        contactTypes, subjectTargets, guidanceType, guidanceAreas, adviceDescription,
        notes, referredTo, referredSpecialistId, referredSpecialistEmail, referredNote,
        referredStatus, attachments, durationMinutes, createdAt, updatedAt, editLogs
      ) VALUES (
        @id, @callerId, @callDate, @specialistId, @specialistName, @specialistRole,
        @contactTypes, @subjectTargets, @guidanceType, @guidanceAreas, @adviceDescription,
        @notes, @referredTo, @referredSpecialistId, @referredSpecialistEmail, @referredNote,
        @referredStatus, @attachments, @durationMinutes, @createdAt, @updatedAt, @editLogs
      )
    `);
    stmt.run({
      id: record.id,
      callerId: record.callerId,
      callDate: record.callDate,
      specialistId: record.specialistId,
      specialistName: record.specialistName,
      specialistRole: record.specialistRole,
      contactTypes: JSON.stringify(record.contactTypes || []),
      subjectTargets: JSON.stringify(record.subjectTargets || []),
      guidanceType: record.guidanceType,
      guidanceAreas: JSON.stringify(record.guidanceAreas || []),
      adviceDescription: record.adviceDescription,
      notes: record.notes || null,
      referredTo: record.referredTo || null,
      referredSpecialistId: record.referredSpecialistId || null,
      referredSpecialistEmail: record.referredSpecialistEmail || null,
      referredNote: record.referredNote || null,
      referredStatus: record.referredStatus || null,
      attachments: JSON.stringify(record.attachments || []),
      durationMinutes: record.durationMinutes || 0,
      createdAt: record.createdAt || new Date().toISOString(),
      updatedAt: record.updatedAt || null,
      editLogs: JSON.stringify(record.editLogs || []),
    });
    return record;
  }

  async updateRecord(record: CallRecord): Promise<CallRecord> {
    if (!this.db) throw new Error("DB not open");
    const stmt = this.db.prepare(`
      UPDATE call_records SET
        callDate = @callDate,
        specialistId = @specialistId,
        specialistName = @specialistName,
        specialistRole = @specialistRole,
        contactTypes = @contactTypes,
        subjectTargets = @subjectTargets,
        guidanceType = @guidanceType,
        guidanceAreas = @guidanceAreas,
        adviceDescription = @adviceDescription,
        notes = @notes,
        referredTo = @referredTo,
        referredSpecialistId = @referredSpecialistId,
        referredSpecialistEmail = @referredSpecialistEmail,
        referredNote = @referredNote,
        referredStatus = @referredStatus,
        attachments = @attachments,
        durationMinutes = @durationMinutes,
        updatedAt = @updatedAt,
        editLogs = @editLogs
      WHERE id = @id
    `);
    stmt.run({
      id: record.id,
      callDate: record.callDate,
      specialistId: record.specialistId,
      specialistName: record.specialistName,
      specialistRole: record.specialistRole,
      contactTypes: JSON.stringify(record.contactTypes || []),
      subjectTargets: JSON.stringify(record.subjectTargets || []),
      guidanceType: record.guidanceType,
      guidanceAreas: JSON.stringify(record.guidanceAreas || []),
      adviceDescription: record.adviceDescription,
      notes: record.notes || null,
      referredTo: record.referredTo || null,
      referredSpecialistId: record.referredSpecialistId || null,
      referredSpecialistEmail: record.referredSpecialistEmail || null,
      referredNote: record.referredNote || null,
      referredStatus: record.referredStatus || null,
      attachments: JSON.stringify(record.attachments || []),
      durationMinutes: record.durationMinutes || 0,
      updatedAt: new Date().toISOString(),
      editLogs: JSON.stringify(record.editLogs || []),
    });
    return (await this.getRecordById(record.id)) || record;
  }

  async deleteRecord(id: string): Promise<boolean> {
    if (!this.db) throw new Error("DB not open");
    const res = this.db.prepare("DELETE FROM call_records WHERE id = ?").run(id);
    return res.changes > 0;
  }

  // Specialists
  async getSpecialists(): Promise<Specialist[]> {
    if (!this.db) throw new Error("DB not open");
    const rows = this.db.prepare("SELECT * FROM specialists ORDER BY name ASC").all() as any[];
    return rows.map((r) => this.mapSpecialistRow(r));
  }

  async getSpecialistById(id: string): Promise<Specialist | null> {
    if (!this.db) throw new Error("DB not open");
    const row = this.db.prepare("SELECT * FROM specialists WHERE id = ?").get(id) as any;
    if (!row) return null;
    return this.mapSpecialistRow(row);
  }

  async getSpecialistByEmail(email: string): Promise<Specialist | null> {
    if (!this.db) throw new Error("DB not open");
    const normalized = email.trim().toLowerCase();
    const row = this.db.prepare("SELECT * FROM specialists WHERE lower(email) = ?").get(normalized) as any;
    if (!row) return null;
    return this.mapSpecialistRow(row);
  }

  async createSpecialist(specialist: Specialist): Promise<Specialist> {
    if (!this.db) throw new Error("DB not open");
    const stmt = this.db.prepare(`
      INSERT INTO specialists (id, name, role, title, guidanceType, avatarBg, avatarUrl, email, isAdmin, createdAt)
      VALUES (@id, @name, @role, @title, @guidanceType, @avatarBg, @avatarUrl, @email, @isAdmin, @createdAt)
    `);
    stmt.run({
      id: specialist.id,
      name: specialist.name,
      role: specialist.role,
      title: specialist.title,
      guidanceType: specialist.guidanceType,
      avatarBg: specialist.avatarBg,
      avatarUrl: specialist.avatarUrl || null,
      email: specialist.email.trim().toLowerCase(),
      isAdmin: specialist.isAdmin ? 1 : 0,
      createdAt: new Date().toISOString(),
    });
    return specialist;
  }

  async updateSpecialist(specialist: Specialist): Promise<Specialist> {
    if (!this.db) throw new Error("DB not open");
    const stmt = this.db.prepare(`
      UPDATE specialists SET
        name = @name,
        role = @role,
        title = @title,
        guidanceType = @guidanceType,
        avatarBg = @avatarBg,
        avatarUrl = @avatarUrl,
        email = @email,
        isAdmin = @isAdmin
      WHERE id = @id
    `);
    stmt.run({
      id: specialist.id,
      name: specialist.name,
      role: specialist.role,
      title: specialist.title,
      guidanceType: specialist.guidanceType,
      avatarBg: specialist.avatarBg,
      avatarUrl: specialist.avatarUrl || null,
      email: specialist.email.trim().toLowerCase(),
      isAdmin: specialist.isAdmin ? 1 : 0,
    });
    return (await this.getSpecialistById(specialist.id)) || specialist;
  }

  async deleteSpecialist(id: string): Promise<boolean> {
    if (!this.db) throw new Error("DB not open");
    const res = this.db.prepare("DELETE FROM specialists WHERE id = ?").run(id);
    return res.changes > 0;
  }

  async getPasswordHash(specialistId: string): Promise<string | null> {
    if (!this.db) throw new Error("DB not open");
    const row = this.db.prepare("SELECT passwordHash FROM passwords WHERE specialistId = ?").get(specialistId) as any;
    return row ? row.passwordHash : null;
  }

  async setPasswordHash(specialistId: string, passwordHash: string): Promise<void> {
    if (!this.db) throw new Error("DB not open");
    const stmt = this.db.prepare(`
      INSERT INTO passwords (specialistId, passwordHash, updatedAt)
      VALUES (?, ?, ?)
      ON CONFLICT(specialistId) DO UPDATE SET passwordHash = excluded.passwordHash, updatedAt = excluded.updatedAt
    `);
    stmt.run(specialistId, passwordHash, new Date().toISOString());
  }

  // Audit Logs
  async getAuditLogs(limit: number = 100): Promise<RecordEditLog[]> {
    if (!this.db) throw new Error("DB not open");
    const rows = this.db.prepare("SELECT * FROM audit_logs ORDER BY editedAt DESC LIMIT ?").all(limit) as any[];
    return rows.map((r) => ({
      id: r.id,
      recordId: r.recordId,
      editedAt: r.editedAt,
      editorId: r.editorId,
      editorName: r.editorName,
      editorRole: r.editorRole,
      summary: r.summary,
      changes: JSON.parse(r.changes || "[]"),
    }));
  }

  async createAuditLog(log: RecordEditLog): Promise<RecordEditLog> {
    if (!this.db) throw new Error("DB not open");
    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (id, recordId, editedAt, editorId, editorName, editorRole, summary, changes)
      VALUES (@id, @recordId, @editedAt, @editorId, @editorName, @editorRole, @summary, @changes)
    `);
    stmt.run({
      id: log.id,
      recordId: log.recordId,
      editedAt: log.editedAt || new Date().toISOString(),
      editorId: log.editorId,
      editorName: log.editorName,
      editorRole: log.editorRole,
      summary: log.summary,
      changes: JSON.stringify(log.changes || []),
    });
    return log;
  }

  // Merge callers
  async mergeCallers(
    sourceCallerId: string,
    targetCallerId: string,
    customMergedData?: Partial<Caller>
  ): Promise<{
    mergedCaller: Caller;
    migratedRecordCount: number;
    migratedAttachmentCount: number;
  }> {
    if (!this.db) throw new Error("DB not open");

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

    let recordCount = 0;

    const transaction = this.db.transaction(() => {
      // 1. Update all records belonging to source to target
      const updateRecs = this.db!.prepare(`
        UPDATE call_records SET callerId = ? WHERE callerId = ?
      `);
      const res = updateRecs.run(targetCallerId, sourceCallerId);
      recordCount = res.changes;

      // 2. Update target caller data
      this.updateCaller(mergedCallerData);

      // 3. Delete source caller
      this.deleteCaller(sourceCallerId);
    });

    transaction();

    const finalTarget = (await this.getCallerById(targetCallerId)) || mergedCallerData;

    return {
      mergedCaller: finalTarget,
      migratedRecordCount: recordCount,
      migratedAttachmentCount: sourceAttachments.length,
    };
  }

  // Helpers
  private mapCallerRow(row: any): Caller {
    return {
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      phoneNumber: row.phoneNumber,
      voivodeship: row.voivodeship,
      city: row.city,
      beneficiaryTypes: JSON.parse(row.beneficiaryTypes || "[]"),
      hasDisabilityCertificate: row.hasDisabilityCertificate,
      disabilityDegree: row.disabilityDegree || undefined,
      tags: JSON.parse(row.tags || "[]"),
      attachments: JSON.parse(row.attachments || "[]"),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapRecordRow(row: any): CallRecord {
    return {
      id: row.id,
      callerId: row.callerId,
      callDate: row.callDate,
      specialistId: row.specialistId,
      specialistName: row.specialistName,
      specialistRole: row.specialistRole,
      contactTypes: JSON.parse(row.contactTypes || "[]"),
      subjectTargets: JSON.parse(row.subjectTargets || "[]"),
      guidanceType: row.guidanceType,
      guidanceAreas: JSON.parse(row.guidanceAreas || "[]"),
      adviceDescription: row.adviceDescription,
      notes: row.notes || undefined,
      referredTo: row.referredTo || undefined,
      referredSpecialistId: row.referredSpecialistId || undefined,
      referredSpecialistEmail: row.referredSpecialistEmail || undefined,
      referredNote: row.referredNote || undefined,
      referredStatus: row.referredStatus || undefined,
      attachments: JSON.parse(row.attachments || "[]"),
      durationMinutes: Number(row.durationMinutes) || 0,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt || undefined,
      editLogs: JSON.parse(row.editLogs || "[]"),
    };
  }

  private mapSpecialistRow(row: any): Specialist {
    return {
      id: row.id,
      name: row.name,
      role: row.role,
      title: row.title,
      guidanceType: row.guidanceType,
      avatarBg: row.avatarBg,
      avatarUrl: row.avatarUrl || undefined,
      email: row.email,
      isAdmin: Boolean(row.isAdmin),
    };
  }
}
