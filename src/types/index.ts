export type SlotStatus = 'free' | 'held' | 'booked' | 'offered';

export type AttendanceStatus = 'scheduled' | 'completed' | 'no_show' | 'cancelled';

export type ConsultationType = 'low_cost' | 'standard' | 'adhd' | 'recovery_assistant' | 'free';

export type UserRole = 'patient' | 'specialist' | 'coordinator';

export interface ConsultationConfig {
  id: ConsultationType;
  label: string;
  price: number;
  description: string;
  badgeColor: string;
  limitRule?: string;
}

export interface Specialist {
  id: string;
  name: string;
  role: string;
  title: string;
  specializations: string[];
  avatar: string;
  weeklyLowCostCount: number;
  phone: string;
  email: string;
}

export interface Slot {
  id: string;
  specialistId: string;
  specialistName: string;
  specialistRole: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: ConsultationType;
  price: number;
  status: SlotStatus;
  attendanceStatus?: AttendanceStatus;
  rescheduleCount?: number; // max 2
  heldUntil?: number; // timestamp ms
  holdReason?: 'booking' | 'waitlist_offer';
  bookedBy?: {
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    bookingToken: string; // /v/:token
    bookedAt: string;
    paymentMethod: string;
    notes?: string;
  };
  offer?: {
    token: string; // /w/:token
    waitlistEntryId: string;
    offeredToName: string;
    offeredToPhone: string;
    offeredToEmail?: string;
    expiresAt: number; // timestamp ms
  };
}

export interface WaitlistEntry {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  preferredType: ConsultationType;
  preferredSpecialistId?: string;
  createdAt: number;
  status: 'waiting' | 'offered' | 'accepted' | 'expired';
}

export interface CoordinatorLogEntry {
  id: string;
  timestamp: string;
  action: 'HOLD_CREATED' | 'BOOKING_CONFIRMED' | 'VISIT_CANCELLED' | 'WAITLIST_OFFER_SENT' | 'WAITLIST_ACCEPTED' | 'HOLD_EXPIRED' | 'ATTENDANCE_UPDATED' | 'REFUND_PROCESSED' | 'SLOT_RESCHEDULED' | 'SLOT_CREATED_BY_SPECIALIST';
  details: string;
  slotId: string;
  actor: string;
}

export interface SimulatedSMS {
  id: string;
  phone: string;
  message: string;
  timestamp: string;
  token?: string;
  type: 'booking' | 'waitlist_offer' | 'cancellation' | 'reschedule';
}

export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  preheader: string;
  content: string;
  token?: string;
  timestamp: string;
  type: 'booking' | 'waitlist_offer' | 'cancellation' | 'reschedule';
  read: boolean;
}

export interface RefundItem {
  id: string;
  slotId: string;
  patientName: string;
  patientPhone: string;
  amount: number;
  cancelledAt: string;
  status: 'pending' | 'completed';
  completedAt?: string;
  processedBy?: string;
}

export interface FirstContactQuestionnaire {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  submittedAt: string;
  q1_ageGroup: string; // Pełnoletni / Niepełnoletni
  q2_preferredFormat: string; // Online / Gabinet Warszawa
  q3_urgency: string; // Standardowy / Pilny (kryzys)
  q4_previousTherapy: string; // Pierwszy raz / Kontynuacja
  q5_preferredDays: string; // Dni powszednie / Weekendy
  q6_consentData: boolean; // Zgoda RODO
  assignedSpecialistId?: string;
}
