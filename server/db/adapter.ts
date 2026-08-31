import {
  Caller,
  CallRecord,
  Specialist,
  RecordEditLog,
  DatabaseEngine,
  AdminOverviewStats,
} from "../types.js";

export interface RecordQueryOptions {
  callerId?: string;
  specialistId?: string;
  guidanceType?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CallerQueryOptions {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface DatabaseAdapter {
  readonly engine: DatabaseEngine;

  // Lifecycle & Health
  init(): Promise<void>;
  close(): Promise<void>;
  ping(): Promise<boolean>;
  getStats(): Promise<AdminOverviewStats>;
  resetToSample(initialCallers: Caller[], initialRecords: CallRecord[], initialSpecialists: Specialist[]): Promise<void>;

  // Callers CRUD
  getCallers(options?: CallerQueryOptions): Promise<Caller[]>;
  getCallerById(id: string): Promise<Caller | null>;
  createCaller(caller: Caller): Promise<Caller>;
  updateCaller(caller: Caller): Promise<Caller>;
  deleteCaller(id: string): Promise<boolean>;

  // Records CRUD
  getRecords(options?: RecordQueryOptions): Promise<CallRecord[]>;
  getRecordById(id: string): Promise<CallRecord | null>;
  getRecordsByCallerId(callerId: string): Promise<CallRecord[]>;
  createRecord(record: CallRecord): Promise<CallRecord>;
  updateRecord(record: CallRecord): Promise<CallRecord>;
  deleteRecord(id: string): Promise<boolean>;

  // Specialists CRUD & Passwords
  getSpecialists(): Promise<Specialist[]>;
  getSpecialistById(id: string): Promise<Specialist | null>;
  getSpecialistByEmail(email: string): Promise<Specialist | null>;
  createSpecialist(specialist: Specialist): Promise<Specialist>;
  updateSpecialist(specialist: Specialist): Promise<Specialist>;
  deleteSpecialist(id: string): Promise<boolean>;
  getPasswordHash(specialistId: string): Promise<string | null>;
  setPasswordHash(specialistId: string, passwordHash: string): Promise<void>;

  // Audit Logs
  getAuditLogs(limit?: number): Promise<RecordEditLog[]>;
  createAuditLog(log: RecordEditLog): Promise<RecordEditLog>;

  // Complex Operations
  mergeCallers(sourceCallerId: string, targetCallerId: string, customMergedData?: Partial<Caller>): Promise<{
    mergedCaller: Caller;
    migratedRecordCount: number;
    migratedAttachmentCount: number;
  }>;
}
