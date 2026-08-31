export type Voivodeship =
  | "dolnośląskie"
  | "kujawsko-pomorskie"
  | "lubelskie"
  | "lubuskie"
  | "łódzkie"
  | "małopolskie"
  | "mazowieckie"
  | "opolskie"
  | "podkarpackie"
  | "podlaskie"
  | "pomorskie"
  | "śląskie"
  | "świętokrzyskie"
  | "warmińsko-mazurskie"
  | "wielkopolskie"
  | "zachodniopomorskie"
  | "brak";

export const VOIVODESHIPS: Voivodeship[] = [
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
];

export type BeneficiaryType =
  | "rodzic"
  | "opiekun"
  | "osoba dorosła w spektrum"
  | "inne";

export const BENEFICIARY_TYPES: BeneficiaryType[] = [
  "rodzic",
  "opiekun",
  "osoba dorosła w spektrum",
  "inne",
];

export type ContactType = "telefon" | "e-mail" | "osobisty" | "inne";
export const CONTACT_TYPES: ContactType[] = ["telefon", "e-mail", "osobisty", "inne"];

export type SubjectTarget = "dziecko" | "osoba dorosła" | "inne";
export const SUBJECT_TARGETS: SubjectTarget[] = ["dziecko", "osoba dorosła", "inne"];

export type GuidanceType =
  | "prawno-obywatelskie"
  | "w zakresie psychologii i rehabilitacji społecznej"
  | "Parent to Parent"
  | "społeczne"
  | "inne";

export const GUIDANCE_TYPES: GuidanceType[] = [
  "prawno-obywatelskie",
  "w zakresie psychologii i rehabilitacji społecznej",
  "Parent to Parent",
  "społeczne",
  "inne",
];

export const GUIDANCE_AREAS_MAP: Record<GuidanceType, string[]> = {
  "prawno-obywatelskie": [
    "organizowanie kształcenia dzieci i uczniów z ASD",
    "prawo rodzinne i opiekuńcze",
    "zabezpieczenie społeczne - ZUS",
    "zabezpieczenie społeczne - system orzecznictwa i świadczeń OzN",
    "prawo pracy",
    "prawo i postępowanie cywilne",
    "prawo  i postępowanie karne",
    "prawo i postępowanie administracyjne",
    "inne",
  ],
  "w zakresie psychologii i rehabilitacji społecznej": [
    "wsparcie psychologiczne rodziców i opiekunów",
    "wsparcie psychologiczne osób z ASD",
    "terapia",
    "sytuacje kryzysowe",
    "samodzielność",
    "kompetencje społeczne",
    "aktywizacja zawodowa",
    "inne",
  ],
  "Parent to Parent": [
    "życie codzienne/samodzielność",
    "oddziaływania wychowawcze/grupy wsparcia dla rodziców",
    "zachowania trudne",
    "placówki diagnostyczne, terapeutyczne i edukacyjne",
    "przysługujące uprawnienia",
    "turnusy rehabilitacyjne/wyjazdy terapeutyczne",
    "inne",
  ],
  "społeczne": [
    "wsparcie terapeutyczne",
    "przebieg diagnostyki",
    "rodzaje poradnictwa",
    "inne",
  ],
  "inne": [
    "inne zagadnienia",
  ],
};

export type DisabilityCertificateStatus = "tak" | "nie" | "w trakcie";

export type DisabilityDegree =
  | "orzeczenie o niepełnosprawności"
  | "lekki"
  | "umiarkowany"
  | "znaczny"
  | "brak / nie dotyczy";

export const DISABILITY_DEGREES: DisabilityDegree[] = [
  "orzeczenie o niepełnosprawności",
  "lekki",
  "umiarkowany",
  "znaczny",
  "brak / nie dotyczy",
];

export type AttachmentType = "pdf" | "image" | "excel" | "text" | "other";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: AttachmentType;
  mimeType: string;
  url?: string;
  dataUrl?: string;
  storageFilename?: string;
  uploadedAt: string;
  uploadedBySpecialistName?: string;
  description?: string;
}

export interface Caller {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  voivodeship: Voivodeship;
  city: string;
  beneficiaryTypes: BeneficiaryType[]; // Beneficiary relation/type
  hasDisabilityCertificate: DisabilityCertificateStatus; // Certificate status
  disabilityDegree?: DisabilityDegree; // Disability degree
  tags: string[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CallRecord {
  id: string;
  callerId: string;
  callDate: string; // When consultation occurred (ISO String)
  specialistId: string;
  specialistName: string;
  specialistRole: string;
  contactTypes: ContactType[]; // Contact method
  subjectTargets: SubjectTarget[]; // Who advice concerns
  guidanceType: GuidanceType; // Guidance type
  guidanceAreas: string[]; // Guidance area
  adviceDescription: string; // Advice description / case overview
  notes?: string; // Notes
  referredTo?: string; // Referred to another specialist
  referredSpecialistId?: string; // Assigned specialist ID
  referredSpecialistEmail?: string; // Specialist email
  referredNote?: string; // Note for referred specialist
  referredStatus?: "OCZEKUJĄCA" | "PRZYJĘTA" | "ZAKOŃCZONA";
  attachments?: Attachment[]; // Attachments (pdf/jpg/etc.)
  durationMinutes: number;
  createdAt: string;
  updatedAt?: string;
  editLogs?: RecordEditLog[]; // Edit audit history and field change logs
}

export interface RecordFieldChange {
  field: string;
  label: string;
  oldValue: string;
  newValue: string;
}

export interface RecordEditLog {
  id: string;
  recordId: string;
  editedAt: string; // ISO String
  editorId: string;
  editorName: string;
  editorRole: string;
  summary: string;
  changes: RecordFieldChange[];
}

export interface EmailNotification {
  id: string;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  callerName: string;
  callerPhone: string;
  subject: string;
  message: string;
  sentAt: string;
  recordId: string;
  callerId: string;
}

export interface Specialist {
  id: string;
  name: string;
  role: string;
  title: string;
  guidanceType: GuidanceType;
  avatarBg: string;
  // Profile photo as data URL (scaled to square on save);
  // absence of value = initials on colored avatarBg background.
  avatarUrl?: string;
  email: string;
  isAdmin?: boolean;
}

export interface SyncMessage {
  type:
    | "RECORD_ADDED"
    | "CALLER_ADDED"
    | "RECORD_UPDATED"
    | "BULK_IMPORT"
    | "PRESENCE_PING"
    | "PRESENCE_EDITING"
    | "CALLER_MERGED"
    | "SPECIALISTS_UPDATED";
  senderId: string;
  senderName: string;
  timestamp: number;
  payload?: any;
}

export interface FilterState {
  searchQuery: string;
  voivodeship: string;
  guidanceType: string;
  guidanceArea: string;
  beneficiaryType: string;
  specialistId: string;
  dateFrom: string;
  dateTo: string;
}
