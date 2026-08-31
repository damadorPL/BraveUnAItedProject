import {
  Caller,
  CallRecord,
  Specialist,
  RecordEditLog,
  EmailNotification,
  GuidanceType,
  Voivodeship,
} from "../src/types/index.js";

export type {
  Caller,
  CallRecord,
  Specialist,
  RecordEditLog,
  EmailNotification,
  GuidanceType,
  Voivodeship,
};

export type DatabaseEngine = "sqlite" | "postgres";

export interface DatabaseConfig {
  engine: DatabaseEngine;
  sqlitePath?: string;
  postgresUrl?: string;
  isCustomPostgres?: boolean;
}

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
}

export interface AuthenticatedRequestUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
}

export interface AdminOverviewStats {
  totalCallers: number;
  totalRecords: number;
  totalSpecialists: number;
  totalPendingReferrals: number;
  databaseEngine: DatabaseEngine;
  databaseStatus: "connected" | "disconnected" | "error";
  databaseLocation: string;
  recentAuditLogs: RecordEditLog[];
}

export interface MergeCallersPayload {
  sourceCallerId: string;
  targetCallerId: string;
  customMergedData?: Partial<Caller>;
}
