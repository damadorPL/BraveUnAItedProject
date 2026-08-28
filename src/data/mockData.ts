import { ConsultationConfig, Specialist, Slot, WaitlistEntry } from '../types';

export const CONSULTATION_TYPES: Record<string, ConsultationConfig> = {
  low_cost: {
    id: 'low_cost',
    label: 'Konsultacja niskopłatna',
    price: 55,
    description: 'Wsparcie psychologiczne dla osób w trudnej sytuacji materialnej',
    badgeColor: 'bg-brand-blue-light text-brand-blue border-brand-blue/30',
    limitRule: 'Limit 10 wizyt na pacjenta, max 4/tydzień u specjalisty'
  },
  standard: {
    id: 'standard',
    label: 'Konsultacja pełnopłatna',
    price: 140,
    description: 'Indywidualna sesja psychoterapeutyczna z certyfikowanym specjalistą',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  adhd: {
    id: 'adhd',
    label: 'Diagnoza ADHD',
    price: 750,
    description: 'Kompleksowy proces diagnostyczny dorosłych z raportem',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  recovery_assistant: {
    id: 'recovery_assistant',
    label: 'Asystent zdrowienia',
    price: 37,
    description: 'Wsparcie osoby z doświadczeniem kryzysu psychicznego w procesie zdrowienia',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  free: {
    id: 'free',
    label: 'Konsultacja bezpłatna',
    price: 0,
    description: 'Pomoc interwencyjna finansowana ze środków statutowych fundacji',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200'
  }
};

export const INITIAL_SPECIALISTS: Specialist[] = [
  {
    id: 'spec_1',
    name: 'mgr Aleksandra Wiśniewska',
    role: 'Psycholożka, Psychoterapeutka',
    title: 'Certyfikowana psychoterapeutka poznawczo-behawioralna (CBT), 9 lat doświadczenia',
    specializations: ['Kryzysy emocjonalne', 'Stany lękowe', 'Depresja'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    weeklyLowCostCount: 2,
    phone: '+48 22 123 45 67'
  },
  {
    id: 'spec_2',
    name: 'dr Tomasz Kowalczyk',
    role: 'Psychiatra, Diagnosta',
    title: 'Specjalista diagnozy neuroatypowości u dorosłych (ADHD, spektrum autyzmu)',
    specializations: ['Diagnoza ADHD', 'Farmakoterapia', 'Zaburzenia nastroju'],
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    weeklyLowCostCount: 1,
    phone: '+48 22 987 65 43'
  },
  {
    id: 'spec_3',
    name: 'Marta Zielińska',
    role: 'Certyfikowana Asystentka Zdrowienia',
    title: 'Ekspertka przez doświadczenie, wsparcie w powrocie do aktywności po kryzysie',
    specializations: ['Wsparcie rówieśnicze', 'Planowanie zdrowienia', 'Relacje'],
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    weeklyLowCostCount: 4,
    phone: '+48 22 555 12 34'
  },
  {
    id: 'spec_4',
    name: 'mgr Jakub Dąbrowski',
    role: 'Psycholog, Interwent kryzysowy',
    title: 'Konsultacje doraźne, interwencja w ostrych kryzysach życiowych i żałobie',
    specializations: ['Interwencja kryzysowa', 'Wypalenie', 'Stres pourazowy'],
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
    weeklyLowCostCount: 3,
    phone: '+48 22 444 88 99'
  }
];

export const INITIAL_SLOTS: Slot[] = [
  {
    id: 'slot_101',
    specialistId: 'spec_1',
    specialistName: 'mgr Aleksandra Wiśniewska',
    specialistRole: 'Psycholożka, Psychoterapeutka',
    date: '2026-08-29',
    time: '11:00',
    type: 'low_cost',
    price: 55,
    status: 'free'
  },
  {
    id: 'slot_102',
    specialistId: 'spec_1',
    specialistName: 'mgr Aleksandra Wiśniewska',
    specialistRole: 'Psycholożka, Psychoterapeutka',
    date: '2026-08-29',
    time: '14:00',
    type: 'low_cost',
    price: 55,
    status: 'booked',
    bookedBy: {
      patientName: 'Katarzyna Nowak',
      patientPhone: '+48 501 ••• 412',
      bookingToken: 'token_nowak_2908',
      bookedAt: '2026-08-28 08:30',
      paymentMethod: 'BLIK'
    }
  },
  {
    id: 'slot_103',
    specialistId: 'spec_2',
    specialistName: 'dr Tomasz Kowalczyk',
    specialistRole: 'Psychiatra, Diagnosta',
    date: '2026-08-29',
    time: '16:30',
    type: 'adhd',
    price: 750,
    status: 'free'
  },
  {
    id: 'slot_104',
    specialistId: 'spec_3',
    specialistName: 'Marta Zielińska',
    specialistRole: 'Certyfikowana Asystentka Zdrowienia',
    date: '2026-08-30',
    time: '10:00',
    type: 'recovery_assistant',
    price: 37,
    status: 'free'
  },
  {
    id: 'slot_105',
    specialistId: 'spec_4',
    specialistName: 'mgr Jakub Dąbrowski',
    specialistRole: 'Psycholog, Interwent kryzysowy',
    date: '2026-08-30',
    time: '12:30',
    type: 'free',
    price: 0,
    status: 'free'
  },
  {
    id: 'slot_106',
    specialistId: 'spec_1',
    specialistName: 'mgr Aleksandra Wiśniewska',
    specialistRole: 'Psycholożka, Psychoterapeutka',
    date: '2026-08-31',
    time: '09:00',
    type: 'standard',
    price: 140,
    status: 'free'
  }
];

export const INITIAL_WAITLIST: WaitlistEntry[] = [
  {
    id: 'wait_1',
    patientName: 'Piotr Włodarczyk',
    patientPhone: '+48 692 ••• 881',
    preferredType: 'low_cost',
    preferredSpecialistId: 'spec_1',
    createdAt: 1724830000000, // Pierwszy w kolejce FIFO
    status: 'waiting'
  },
  {
    id: 'wait_2',
    patientName: 'Monika Adamska',
    patientPhone: '+48 601 ••• 332',
    preferredType: 'low_cost',
    preferredSpecialistId: 'spec_1',
    createdAt: 1724835000000, // Druga w kolejce FIFO
    status: 'waiting'
  }
];
