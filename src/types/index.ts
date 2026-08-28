export type SlotStatus = 'free' | 'held' | 'booked' | 'offered';

export type ConsultationType = 'low_cost' | 'standard' | 'adhd' | 'recovery_assistant' | 'free';

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
  title: string; // np. "Psycholożka, Psychoterapeutka CBT"
  specializations: string[];
  avatar: string;
  weeklyLowCostCount: number;
  phone: string;
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
  heldUntil?: number; // timestamp ms
  holdReason?: 'booking' | 'waitlist_offer';
  bookedBy?: {
    patientName: string;
    patientPhone: string;
    bookingToken: string; // /v/:token
    bookedAt: string;
    paymentMethod: string;
  };
  offer?: {
    token: string; // /w/:token
    waitlistEntryId: string;
    offeredToName: string;
    offeredToPhone: string;
    expiresAt: number; // timestamp ms
  };
}

export interface WaitlistEntry {
  id: string;
  patientName: string;
  patientPhone: string;
  preferredType: ConsultationType;
  preferredSpecialistId?: string;
  createdAt: number;
  status: 'waiting' | 'offered' | 'accepted' | 'expired';
}

export interface CoordinatorLogEntry {
  id: string;
  timestamp: string;
  action: 'HOLD_CREATED' | 'BOOKING_CONFIRMED' | 'VISIT_CANCELLED' | 'WAITLIST_OFFER_SENT' | 'WAITLIST_ACCEPTED' | 'HOLD_EXPIRED';
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
  type: 'booking' | 'waitlist_offer' | 'cancellation';
}
