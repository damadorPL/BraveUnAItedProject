import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const pgSpecialists = pgTable("specialists", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  guidanceType: varchar("guidance_type", { length: 255 }).notNull(),
  avatarBg: varchar("avatar_bg", { length: 100 }).notNull(),
  avatarUrl: text("avatar_url"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pgCallers = pgTable(
  "callers",
  {
    id: varchar("id", { length: 100 }).primaryKey(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 100 }).notNull(),
    voivodeship: varchar("voivodeship", { length: 100 }).notNull(),
    city: varchar("city", { length: 255 }).notNull(),
    beneficiaryTypes: jsonb("beneficiary_types").notNull().default([]),
    hasDisabilityCertificate: varchar("has_disability_certificate", { length: 50 }).notNull(),
    disabilityDegree: varchar("disability_degree", { length: 100 }),
    tags: jsonb("tags").notNull().default([]),
    attachments: jsonb("attachments").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_pg_callers_names").on(table.lastName, table.firstName),
    index("idx_pg_callers_phone").on(table.phoneNumber),
  ]
);

export const pgCallRecords = pgTable(
  "call_records",
  {
    id: varchar("id", { length: 100 }).primaryKey(),
    callerId: varchar("caller_id", { length: 100 })
      .notNull()
      .references(() => pgCallers.id, { onDelete: "cascade" }),
    callDate: timestamp("call_date", { withTimezone: true }).notNull(),
    specialistId: varchar("specialist_id", { length: 100 }).notNull(),
    specialistName: varchar("specialist_name", { length: 255 }).notNull(),
    specialistRole: varchar("specialist_role", { length: 255 }).notNull(),
    contactTypes: jsonb("contact_types").notNull().default([]),
    subjectTargets: jsonb("subject_targets").notNull().default([]),
    guidanceType: varchar("guidance_type", { length: 255 }).notNull(),
    guidanceAreas: jsonb("guidance_areas").notNull().default([]),
    adviceDescription: text("advice_description").notNull(),
    notes: text("notes"),
    referredTo: varchar("referred_to", { length: 255 }),
    referredSpecialistId: varchar("referred_specialist_id", { length: 100 }),
    referredSpecialistEmail: varchar("referred_specialist_email", { length: 255 }),
    referredNote: text("referred_note"),
    referredStatus: varchar("referred_status", { length: 50 }),
    attachments: jsonb("attachments").notNull().default([]),
    durationMinutes: integer("duration_minutes").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    editLogs: jsonb("edit_logs").notNull().default([]),
  },
  (table) => [
    index("idx_pg_records_caller").on(table.callerId),
    index("idx_pg_records_date").on(table.callDate),
  ]
);

export const pgAuditLogs = pgTable("audit_logs", {
  id: varchar("id", { length: 100 }).primaryKey(),
  recordId: varchar("record_id", { length: 100 }).notNull(),
  editedAt: timestamp("edited_at", { withTimezone: true }).notNull().defaultNow(),
  editorId: varchar("editor_id", { length: 100 }).notNull(),
  editorName: varchar("editor_name", { length: 255 }).notNull(),
  editorRole: varchar("editor_role", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  changes: jsonb("changes").notNull().default([]),
});

export const pgPasswords = pgTable("passwords", {
  specialistId: varchar("specialist_id", { length: 100 })
    .primaryKey()
    .references(() => pgSpecialists.id, { onDelete: "cascade" }),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
