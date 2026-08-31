import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const sqliteSpecialists = sqliteTable(
  "specialists",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    title: text("title").notNull(),
    guidanceType: text("guidanceType").notNull(),
    avatarBg: text("avatarBg").notNull(),
    avatarUrl: text("avatarUrl"),
    email: text("email").notNull().unique(),
    isAdmin: integer("isAdmin").notNull().default(0),
    createdAt: text("createdAt").notNull(),
  }
);

export const sqliteCallers = sqliteTable(
  "callers",
  {
    id: text("id").primaryKey(),
    firstName: text("firstName").notNull(),
    lastName: text("lastName").notNull(),
    phoneNumber: text("phoneNumber").notNull(),
    voivodeship: text("voivodeship").notNull(),
    city: text("city").notNull(),
    beneficiaryTypes: text("beneficiaryTypes").notNull(), // JSON string
    hasDisabilityCertificate: text("hasDisabilityCertificate").notNull(),
    disabilityDegree: text("disabilityDegree"),
    tags: text("tags").notNull(), // JSON string
    attachments: text("attachments"), // JSON string
    createdAt: text("createdAt").notNull(),
    updatedAt: text("updatedAt").notNull(),
  },
  (table) => [
    index("idx_callers_names").on(table.lastName, table.firstName),
    index("idx_callers_phone").on(table.phoneNumber),
  ]
);

export const sqliteCallRecords = sqliteTable(
  "call_records",
  {
    id: text("id").primaryKey(),
    callerId: text("callerId")
      .notNull()
      .references(() => sqliteCallers.id, { onDelete: "cascade" }),
    callDate: text("callDate").notNull(),
    specialistId: text("specialistId").notNull(),
    specialistName: text("specialistName").notNull(),
    specialistRole: text("specialistRole").notNull(),
    contactTypes: text("contactTypes").notNull(), // JSON string
    subjectTargets: text("subjectTargets").notNull(), // JSON string
    guidanceType: text("guidanceType").notNull(),
    guidanceAreas: text("guidanceAreas").notNull(), // JSON string
    adviceDescription: text("adviceDescription").notNull(),
    notes: text("notes"),
    referredTo: text("referredTo"),
    referredSpecialistId: text("referredSpecialistId"),
    referredSpecialistEmail: text("referredSpecialistEmail"),
    referredNote: text("referredNote"),
    referredStatus: text("referredStatus"),
    attachments: text("attachments"), // JSON string
    durationMinutes: integer("durationMinutes").notNull().default(0),
    createdAt: text("createdAt").notNull(),
    updatedAt: text("updatedAt"),
    editLogs: text("editLogs"), // JSON string
  },
  (table) => [
    index("idx_records_caller").on(table.callerId),
    index("idx_records_date").on(table.callDate),
    index("idx_records_specialist").on(table.specialistId),
  ]
);

export const sqliteAuditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    recordId: text("recordId").notNull(),
    editedAt: text("editedAt").notNull(),
    editorId: text("editorId").notNull(),
    editorName: text("editorName").notNull(),
    editorRole: text("editorRole").notNull(),
    summary: text("summary").notNull(),
    changes: text("changes").notNull(), // JSON string
  },
  (table) => [index("idx_audit_record").on(table.recordId)]
);

export const sqlitePasswords = sqliteTable(
  "passwords",
  {
    specialistId: text("specialistId")
      .primaryKey()
      .references(() => sqliteSpecialists.id, { onDelete: "cascade" }),
    passwordHash: text("passwordHash").notNull(),
    updatedAt: text("updatedAt").notNull(),
  }
);

export const sqliteSettings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
