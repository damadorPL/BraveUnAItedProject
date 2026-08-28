import { ConsultationConfig, Specialist, Slot, WaitlistEntry, CoordinatorLogEntry, RefundItem, FirstContactQuestionnaire, SimulatedEmail } from '../types';

export const CONSULTATION_TYPES: Record<string, ConsultationConfig> = {
  low_cost: {
    id: 'low_cost',
    label: 'Konsultacja niskopłatna',
    price: 55,
    description: 'Wsparcie psychologiczne dla osób w trudnej sytuacji materialnej',
    badgeColor: 'bg-brand-green-light text-emerald-800 border-brand-green-border',
    limitRule: 'Limit 10 wizyt na pacjenta, max 4/tydzień u specjalisty'
  },
  standard: {
    id: 'standard',
    label: 'Konsultacja pełnopłatna',
    price: 140,
    description: 'Indywidualna sesja psychoterapeutyczna z certyfikowanym specjalistą',
    badgeColor: 'bg-brand-cobalt-light text-brand-cobalt border-brand-cobalt-border'
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
    badgeColor: 'bg-brand-cream text-amber-900 border-amber-300/60'
  },
  free: {
    id: 'free',
    label: 'Konsultacja bezpłatna',
    price: 0,
    description: 'Pomoc interwencyjna finansowana ze środków statutowych fundacji',
    badgeColor: 'bg-brand-pink-light text-brand-text border-brand-pink'
  }
};

export const INITIAL_SPECIALISTS: Specialist[] = [
  {
    id: 'spec_1',
    name: 'mgr Aleksandra Wiśniewska',
    role: 'Psycholożka, Psychoterapeutka CBT',
    title: 'Certyfikowana psychoterapeutka poznawczo-behawioralna, 9 lat doświadczenia klinicznego',
    specializations: ['Kryzysy emocjonalne', 'Stany lękowe', 'Depresja'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    weeklyLowCostCount: 3,
    phone: '+48 22 123 45 67',
    email: 'aleksandra.wisniewska@niepodzielni.com'
  },
  {
    id: 'spec_2',
    name: 'dr Tomasz Kowalczyk',
    role: 'Psychiatra, Diagnosta ADHD',
    title: 'Specjalista diagnozy neuroatypowości u dorosłych (ADHD, spektrum autyzmu, farmakoterapia)',
    specializations: ['Diagnoza ADHD', 'Farmakoterapia', 'Zaburzenia nastroju'],
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    weeklyLowCostCount: 2,
    phone: '+48 22 987 65 43',
    email: 'tomasz.kowalczyk@niepodzielni.com'
  },
  {
    id: 'spec_3',
    name: 'Marta Zielińska',
    role: 'Certyfikowana Asystentka Zdrowienia',
    title: 'Ekspertka przez doświadczenie, wsparcie w powrocie do aktywności po kryzysie',
    specializations: ['Wsparcie rówieśnicze', 'Planowanie zdrowienia', 'Kryzysy życiowe'],
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    weeklyLowCostCount: 4,
    phone: '+48 22 555 12 34',
    email: 'marta.zielinska@niepodzielni.com'
  },
  {
    id: 'spec_4',
    name: 'mgr Jakub Dąbrowski',
    role: 'Psycholog, Interwent kryzysowy',
    title: 'Konsultacje doraźne, interwencja w nagłych kryzysach życiowych, żałobie i traumie',
    specializations: ['Interwencja kryzysowa', 'Wypalenie zawodowe', 'Stres pourazowy'],
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
    weeklyLowCostCount: 3,
    phone: '+48 22 444 88 99',
    email: 'jakub.dabrowski@niepodzielni.com'
  },
  {
    id: 'spec_5',
    name: 'mgr Natalia Kaczmarek',
    role: 'Psychoterapeutka Psychodynamiczna',
    title: 'Praca z relacjami, zaburzeniami osobowości oraz trudnościami adaptacyjnymi',
    specializations: ['Trudności w relacjach', 'Zaburzenia psychosomatyczne', 'Tożsamość'],
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=200',
    weeklyLowCostCount: 2,
    phone: '+48 22 777 11 22',
    email: 'natalia.kaczmarek@niepodzielni.com'
  },
  {
    id: 'spec_6',
    name: 'lek. med. Michał Lewandowski',
    role: 'Lekarz Psychiatra',
    title: 'Konsultacje psychiatryczne, dobór i prowadzenie leczenia farmakologicznego',
    specializations: ['Depresja lekooporna', 'Bezsenność', 'Zaburzenia lękowe'],
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    weeklyLowCostCount: 1,
    phone: '+48 22 888 33 44',
    email: 'michal.lewandowski@niepodzielni.com'
  },
  {
    id: 'spec_7',
    name: 'mgr Zofia Wójcik',
    role: 'Psycholożka Dzieci i Młodzieży',
    title: 'Wsparcie psychologiczne nastolatków, psychoedukacja rodziców i diagnoza trudności szkolnych',
    specializations: ['Młodzież', 'Trudności szkolne', 'Komunikacja w rodzinie'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    weeklyLowCostCount: 3,
    phone: '+48 22 333 99 00',
    email: 'zofia.wojcik@niepodzielni.com'
  },
  {
    id: 'spec_8',
    name: 'mgr Kamil Szymański',
    role: 'Seksuolog, Psychoterapeuta par',
    title: 'Terapia par, konsultacje seksuologiczne, komunikacja intymna i kryzysy w związkach',
    specializations: ['Terapia par', 'Seksuologia', 'Kryzysy partnerskie'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    weeklyLowCostCount: 2,
    phone: '+48 22 666 44 55',
    email: 'kamil.szymanski@niepodzielni.com'
  }
];

export const INITIAL_SLOTS: Slot[] = [
  // Dzień 1: 2026-08-29
  {
    id: 'slot_101',
    specialistId: 'spec_1',
    specialistName: 'mgr Aleksandra Wiśniewska',
    specialistRole: 'Psycholożka, Psychoterapeutka CBT',
    date: '2026-08-29',
    time: '11:00',
    type: 'low_cost',
    price: 55,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_102',
    specialistId: 'spec_1',
    specialistName: 'mgr Aleksandra Wiśniewska',
    specialistRole: 'Psycholożka, Psychoterapeutka CBT',
    date: '2026-08-29',
    time: '14:00',
    type: 'low_cost',
    price: 55,
    status: 'booked',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0,
    bookedBy: {
      patientName: 'Katarzyna Nowak',
      patientPhone: '+48 501 412 889',
      patientEmail: 'katarzyna.nowak@poczta.pl',
      bookingToken: 'token_nowak_2908',
      bookedAt: '2026-08-28 08:30',
      paymentMethod: 'BLIK'
    }
  },
  {
    id: 'slot_103',
    specialistId: 'spec_2',
    specialistName: 'dr Tomasz Kowalczyk',
    specialistRole: 'Psychiatra, Diagnosta ADHD',
    date: '2026-08-29',
    time: '16:30',
    type: 'adhd',
    price: 750,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_104',
    specialistId: 'spec_3',
    specialistName: 'Marta Zielińska',
    specialistRole: 'Certyfikowana Asystentka Zdrowienia',
    date: '2026-08-29',
    time: '18:00',
    type: 'recovery_assistant',
    price: 37,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_105',
    specialistId: 'spec_5',
    specialistName: 'mgr Natalia Kaczmarek',
    specialistRole: 'Psychoterapeutka Psychodynamiczna',
    date: '2026-08-29',
    time: '12:00',
    type: 'standard',
    price: 140,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_106',
    specialistId: 'spec_1',
    specialistName: 'mgr Aleksandra Wiśniewska',
    specialistRole: 'Psycholożka, Psychoterapeutka CBT',
    date: '2026-08-29',
    time: '09:00',
    type: 'low_cost',
    price: 55,
    status: 'booked',
    attendanceStatus: 'completed',
    rescheduleCount: 0,
    bookedBy: {
      patientName: 'Marek Pawlak',
      patientPhone: '+48 602 113 445',
      patientEmail: 'marek.pawlak@gmail.com',
      bookingToken: 'token_pawlak_0900',
      bookedAt: '2026-08-27 15:20',
      paymentMethod: 'Karta VISA'
    }
  },

  // Dzień 2: 2026-08-30
  {
    id: 'slot_201',
    specialistId: 'spec_4',
    specialistName: 'mgr Jakub Dąbrowski',
    specialistRole: 'Psycholog, Interwent kryzysowy',
    date: '2026-08-30',
    time: '09:30',
    type: 'free',
    price: 0,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_202',
    specialistId: 'spec_3',
    specialistName: 'Marta Zielińska',
    specialistRole: 'Certyfikowana Asystentka Zdrowienia',
    date: '2026-08-30',
    time: '10:00',
    type: 'recovery_assistant',
    price: 37,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_203',
    specialistId: 'spec_1',
    specialistName: 'mgr Aleksandra Wiśniewska',
    specialistRole: 'Psycholożka, Psychoterapeutka CBT',
    date: '2026-08-30',
    time: '13:00',
    type: 'low_cost',
    price: 55,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_204',
    specialistId: 'spec_6',
    specialistName: 'lek. med. Michał Lewandowski',
    specialistRole: 'Lekarz Psychiatra',
    date: '2026-08-30',
    time: '15:00',
    type: 'standard',
    price: 140,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_205',
    specialistId: 'spec_7',
    specialistName: 'mgr Zofia Wójcik',
    specialistRole: 'Psycholożka Dzieci i Młodzieży',
    date: '2026-08-30',
    time: '16:30',
    type: 'low_cost',
    price: 55,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_206',
    specialistId: 'spec_2',
    specialistName: 'dr Tomasz Kowalczyk',
    specialistRole: 'Psychiatra, Diagnosta ADHD',
    date: '2026-08-30',
    time: '11:00',
    type: 'adhd',
    price: 750,
    status: 'booked',
    attendanceStatus: 'scheduled',
    rescheduleCount: 1,
    bookedBy: {
      patientName: 'Grzegorz Bąk',
      patientPhone: '+48 510 774 220',
      patientEmail: 'grzegorz.bak@outlook.com',
      bookingToken: 'token_bak_adhd',
      bookedAt: '2026-08-27 19:40',
      paymentMethod: 'BLIK'
    }
  },

  // Dzień 3: 2026-08-31
  {
    id: 'slot_301',
    specialistId: 'spec_1',
    specialistName: 'mgr Aleksandra Wiśniewska',
    specialistRole: 'Psycholożka, Psychoterapeutka CBT',
    date: '2026-08-31',
    time: '09:00',
    type: 'standard',
    price: 140,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_302',
    specialistId: 'spec_8',
    specialistName: 'mgr Kamil Szymański',
    specialistRole: 'Seksuolog, Psychoterapeuta par',
    date: '2026-08-31',
    time: '11:30',
    type: 'standard',
    price: 140,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_303',
    specialistId: 'spec_2',
    specialistName: 'dr Tomasz Kowalczyk',
    specialistRole: 'Psychiatra, Diagnosta ADHD',
    date: '2026-08-31',
    time: '14:00',
    type: 'adhd',
    price: 750,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_304',
    specialistId: 'spec_4',
    specialistName: 'mgr Jakub Dąbrowski',
    specialistRole: 'Psycholog, Interwent kryzysowy',
    date: '2026-08-31',
    time: '17:00',
    type: 'free',
    price: 0,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_305',
    specialistId: 'spec_5',
    specialistName: 'mgr Natalia Kaczmarek',
    specialistRole: 'Psychoterapeutka Psychodynamiczna',
    date: '2026-08-31',
    time: '15:30',
    type: 'low_cost',
    price: 55,
    status: 'booked',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0,
    bookedBy: {
      patientName: 'Joanna Lis',
      patientPhone: '+48 504 992 110',
      patientEmail: 'joanna.lis@wp.pl',
      bookingToken: 'token_lis_3108',
      bookedAt: '2026-08-28 07:15',
      paymentMethod: 'BLIK'
    }
  },

  // Dzień 4: 2026-09-01
  {
    id: 'slot_401',
    specialistId: 'spec_5',
    specialistName: 'mgr Natalia Kaczmarek',
    specialistRole: 'Psychoterapeutka Psychodynamiczna',
    date: '2026-09-01',
    time: '10:00',
    type: 'low_cost',
    price: 55,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_402',
    specialistId: 'spec_7',
    specialistName: 'mgr Zofia Wójcik',
    specialistRole: 'Psycholożka Dzieci i Młodzieży',
    date: '2026-09-01',
    time: '12:30',
    type: 'low_cost',
    price: 55,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_403',
    specialistId: 'spec_3',
    specialistName: 'Marta Zielińska',
    specialistRole: 'Certyfikowana Asystentka Zdrowienia',
    date: '2026-09-01',
    time: '15:30',
    type: 'recovery_assistant',
    price: 37,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_404',
    specialistId: 'spec_8',
    specialistName: 'mgr Kamil Szymański',
    specialistRole: 'Seksuolog, Psychoterapeuta par',
    date: '2026-09-01',
    time: '18:00',
    type: 'standard',
    price: 140,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_405',
    specialistId: 'spec_6',
    specialistName: 'lek. med. Michał Lewandowski',
    specialistRole: 'Lekarz Psychiatra',
    date: '2026-09-01',
    time: '11:00',
    type: 'standard',
    price: 140,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },

  // Dzień 5: 2026-09-02
  {
    id: 'slot_501',
    specialistId: 'spec_1',
    specialistName: 'mgr Aleksandra Wiśniewska',
    specialistRole: 'Psycholożka, Psychoterapeutka CBT',
    date: '2026-09-02',
    time: '08:30',
    type: 'low_cost',
    price: 55,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_502',
    specialistId: 'spec_1',
    specialistName: 'mgr Aleksandra Wiśniewska',
    specialistRole: 'Psycholożka, Psychoterapeutka CBT',
    date: '2026-09-02',
    time: '10:00',
    type: 'low_cost',
    price: 55,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_503',
    specialistId: 'spec_2',
    specialistName: 'dr Tomasz Kowalczyk',
    specialistRole: 'Psychiatra, Diagnosta ADHD',
    date: '2026-09-02',
    time: '13:30',
    type: 'adhd',
    price: 750,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_504',
    specialistId: 'spec_3',
    specialistName: 'Marta Zielińska',
    specialistRole: 'Certyfikowana Asystentka Zdrowienia',
    date: '2026-09-02',
    time: '16:00',
    type: 'recovery_assistant',
    price: 37,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  },
  {
    id: 'slot_505',
    specialistId: 'spec_4',
    specialistName: 'mgr Jakub Dąbrowski',
    specialistRole: 'Psycholog, Interwent kryzysowy',
    date: '2026-09-02',
    time: '17:30',
    type: 'free',
    price: 0,
    status: 'free',
    attendanceStatus: 'scheduled',
    rescheduleCount: 0
  }
];

export const INITIAL_WAITLIST: WaitlistEntry[] = [
  {
    id: 'wait_1',
    patientName: 'Piotr Włodarczyk',
    patientPhone: '+48 692 ••• 881',
    patientEmail: 'piotr.wlodarczyk@onet.pl',
    preferredType: 'low_cost',
    preferredSpecialistId: 'spec_1',
    createdAt: 1724830000000,
    status: 'waiting'
  },
  {
    id: 'wait_2',
    patientName: 'Monika Adamska',
    patientPhone: '+48 601 ••• 332',
    patientEmail: 'monika.adamska@gmail.com',
    preferredType: 'low_cost',
    preferredSpecialistId: 'spec_1',
    createdAt: 1724835000000,
    status: 'waiting'
  },
  {
    id: 'wait_3',
    patientName: 'Tomasz Grabowski',
    patientPhone: '+48 512 ••• 990',
    patientEmail: 'tomasz.g@interia.pl',
    preferredType: 'adhd',
    preferredSpecialistId: 'spec_2',
    createdAt: 1724838000000,
    status: 'waiting'
  },
  {
    id: 'wait_4',
    patientName: 'Karolina Mazur',
    patientPhone: '+48 733 ••• 112',
    patientEmail: 'karolina.mazur@wp.pl',
    preferredType: 'recovery_assistant',
    preferredSpecialistId: 'spec_3',
    createdAt: 1724841000000,
    status: 'waiting'
  },
  {
    id: 'wait_5',
    patientName: 'Ewa Czarnecka',
    patientPhone: '+48 664 ••• 557',
    patientEmail: 'ewa.czarnecka@gazeta.pl',
    preferredType: 'free',
    preferredSpecialistId: 'spec_4',
    createdAt: 1724844000000,
    status: 'waiting'
  }
];

export const INITIAL_LOGS: CoordinatorLogEntry[] = [
  {
    id: 'log_0',
    timestamp: '08:30:15',
    action: 'BOOKING_CONFIRMED',
    details: 'Wizyta #slot_102 (mgr Aleksandra Wiśniewska) zarezerwowana przez Katarzyna Nowak. Płatność: BLIK 55 zł.',
    slotId: 'slot_102',
    actor: 'System Rezerwacji'
  },
  {
    id: 'log_1',
    timestamp: '08:25:40',
    action: 'WAITLIST_ACCEPTED',
    details: 'Wizyta #slot_099 potwierdzona przez pacjenta z listy rezerwowej (Marek Pawlak).',
    slotId: 'slot_099',
    actor: 'Pacjent z Waitlisty'
  },
  {
    id: 'log_2',
    timestamp: '08:14:10',
    action: 'VISIT_CANCELLED',
    details: 'Odwołano wizytę #slot_099 (>24h). Dodano zwrot 55 zł do listy Stripe (do wykonania).',
    slotId: 'slot_099',
    actor: 'Pacjent (/v/:token)'
  },
  {
    id: 'log_init',
    timestamp: '08:00:00',
    action: 'HOLD_CREATED',
    details: 'Inicjalizacja systemu. Dostępnych 111 specjalistów w bazie Fundacji Niepodzielni.',
    slotId: 'all',
    actor: 'Koordynator Fundacji'
  }
];

export const INITIAL_REFUNDS: RefundItem[] = [
  {
    id: 'ref_101',
    slotId: 'slot_099',
    patientName: 'Marek Pawlak',
    patientPhone: '+48 602 113 445',
    amount: 55,
    cancelledAt: '2026-08-28 08:14',
    status: 'pending'
  },
  {
    id: 'ref_102',
    slotId: 'slot_088',
    patientName: 'Sylwia Kozłowska',
    patientPhone: '+48 501 988 221',
    amount: 140,
    cancelledAt: '2026-08-27 16:45',
    status: 'completed',
    completedAt: '2026-08-27 17:10',
    processedBy: 'Koordynator Anna'
  }
];

export const INITIAL_QUESTIONNAIRES: FirstContactQuestionnaire[] = [
  {
    id: 'quest_1',
    patientName: 'Katarzyna Nowak',
    patientPhone: '+48 501 412 889',
    patientEmail: 'katarzyna.nowak@poczta.pl',
    submittedAt: '2026-08-28 08:28',
    q1_ageGroup: 'Pełnoletni (18+)',
    q2_preferredFormat: 'Online (wideo)',
    q3_urgency: 'Wizyta standardowa',
    q4_previousTherapy: 'Pierwszy raz w życiu',
    q5_preferredDays: 'Popołudnia w tygodniu',
    q6_consentData: true,
    assignedSpecialistId: 'spec_1'
  },
  {
    id: 'quest_2',
    patientName: 'Grzegorz Bąk',
    patientPhone: '+48 510 774 220',
    patientEmail: 'grzegorz.bak@outlook.com',
    submittedAt: '2026-08-27 19:35',
    q1_ageGroup: 'Pełnoletni (18+)',
    q2_preferredFormat: 'Gabinet Warszawa',
    q3_urgency: 'Wizyta standardowa (ADHD)',
    q4_previousTherapy: 'Kontynuacja / diagnoza',
    q5_preferredDays: 'Dowolne',
    q6_consentData: true,
    assignedSpecialistId: 'spec_2'
  }
];

export const INITIAL_EMAILS: SimulatedEmail[] = [
  {
    id: 'mail_1',
    to: 'katarzyna.nowak@poczta.pl',
    subject: 'Potwierdzenie rezerwacji terminu – Fundacja Niepodzielni',
    preheader: 'Twój termin wizyty: 29.08.2026 godz. 14:00',
    content: 'Dzień dobry Katarzyno,\n\nTwój termin został pomyślnie potwierdzony i opłacony.\n\nSzczegóły rezerwacji:\n• Data: 29 sierpnia 2026, godz. 14:00\n• Specjalista: mgr Aleksandra Wiśniewska\n• Typ: Konsultacja niskopłatna (55 zł)\n\nWiadomość zawiera bezpieczny link do zarządzania wizytą (odwołanie lub przełożenie bez zakładania konta).',
    token: 'token_nowak_2908',
    timestamp: '08:30',
    type: 'booking',
    read: false
  }
];
