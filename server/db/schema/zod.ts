import { z } from "zod";

export const VOIVODESHIPS = [
  "dolnośląskie",
  "kujawsko-pomorskie",
  "lubelskie",
  "lubuskie",
  "łódzkie",
  "małopolskie",
  "mazowieckie",
  "opolskie",
  "podkarpackie",
  "podlaskie",
  "pomorskie",
  "śląskie",
  "świętokrzyskie",
  "warmińsko-mazurskie",
  "wielkopolskie",
  "zachodniopomorskie",
  "brak",
] as const;

export const GUIDANCE_TYPES = [
  "prawno-obywatelskie",
  "w zakresie psychologii i rehabilitacji społecznej",
  "Parent to Parent",
  "społeczne",
  "inne",
] as const;

export const BENEFICIARY_TYPES = [
  "rodzic",
  "opiekun",
  "osoba dorosła w spektrum",
  "inne",
] as const;

// 1. Auth Schemas
export const loginSchema = z.object({
  email: z
    .email("Wprowadź poprawny adres e-mail.")
    .trim(),
  password: z
    .string()
    .min(1, "Wprowadź hasło dostępowe."),
});

export const resetPasswordSchema = z.object({
  email: z.email("Wprowadź poprawny adres e-mail.").trim(),
  newPassword: z
    .string()
    .min(8, "Nowe hasło musi składać się z co najmniej 8 znaków."),
  resetCode: z.string().min(1, "Kod weryfikacyjny jest wymagany."),
});

// 2. Caller Schemas
export const callerSchema = z.object({
  id: z.string().optional(),
  firstName: z
    .string()
    .min(1, "Imię nie może być puste.")
    .trim(),
  lastName: z
    .string()
    .min(1, "Nazwisko nie może być puste.")
    .trim(),
  phoneNumber: z
    .string()
    .min(3, "Wprowadź poprawny numer telefonu.")
    .trim(),
  voivodeship: z.enum(VOIVODESHIPS).default("brak"),
  city: z.string().default(""),
  beneficiaryTypes: z.array(z.string()).default(["rodzic"]),
  hasDisabilityCertificate: z.enum(["tak", "nie", "w trakcie"]).default("nie"),
  disabilityDegree: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.any()).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const updateCallerSchema = callerSchema.partial();

// 3. Call Record Schemas
export const callRecordSchema = z.object({
  id: z.string().optional(),
  callerId: z.string().min(1, "Identyfikator kontaktu jest wymagany."),
  callDate: z.string().optional(),
  specialistId: z.string().optional(),
  specialistName: z.string().optional(),
  specialistRole: z.string().optional(),
  contactTypes: z.array(z.string()).default(["telefon"]),
  subjectTargets: z.array(z.string()).default(["dziecko"]),
  guidanceType: z.enum(GUIDANCE_TYPES),
  guidanceAreas: z.array(z.string()).default([]),
  adviceDescription: z.string().default(""),
  notes: z.string().optional().nullable(),
  referredTo: z.string().optional().nullable(),
  referredSpecialistId: z.string().optional().nullable(),
  referredSpecialistEmail: z.string().optional().nullable(),
  referredNote: z.string().optional().nullable(),
  referredStatus: z.enum(["OCZEKUJĄCA", "PRZYJĘTA", "ZAKOŃCZONA"]).optional().nullable(),
  attachments: z.array(z.any()).default([]),
  durationMinutes: z.number().int().nonnegative().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  newEditLog: z.any().optional(),
});

export const updateRecordSchema = callRecordSchema.partial();

// 4. Specialist Schemas
export const specialistSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Imię i nazwisko specjalisty jest wymagane."),
  email: z
    .email("Niepoprawny format adresu e-mail.")
    .refine((val) => val.trim().toLowerCase().endsWith("@synapsis.org.pl"), {
      message: "Adres e-mail musi należeć do domeny @synapsis.org.pl",
    }),
  title: z.string().default("Psycholog"),
  role: z.string().default("Konsultant"),
  guidanceType: z.enum(GUIDANCE_TYPES).default("prawno-obywatelskie"),
  avatarBg: z.string().default("bg-blue-600"),
  avatarUrl: z.string().optional().nullable(),
  isAdmin: z.boolean().default(false),
  initialPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

export const updateSpecialistSchema = specialistSchema.partial();

// 5. Complex Operations
export const mergeCallersSchema = z.object({
  sourceCallerId: z.string().min(1, "Wskaż kontakt źródłowy do scalenia."),
  targetCallerId: z.string().min(1, "Wskaż kontakt docelowy."),
  customMergedData: z.record(z.string(), z.any()).optional(),
});

// 6. DB Config Schema
export const dbConfigSchema = z.object({
  engine: z.enum(["sqlite", "postgres"]),
  sqlitePath: z.string().optional(),
  postgresUrl: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CallerInput = z.infer<typeof callerSchema>;
export type CallRecordInput = z.infer<typeof callRecordSchema>;
export type SpecialistInput = z.infer<typeof specialistSchema>;
export type MergeCallersInput = z.infer<typeof mergeCallersSchema>;
export type DbConfigInput = z.infer<typeof dbConfigSchema>;
