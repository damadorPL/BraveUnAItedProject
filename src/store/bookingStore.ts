import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Slot, 
  Specialist, 
  WaitlistEntry, 
  CoordinatorLogEntry, 
  SimulatedSMS, 
  SimulatedEmail,
  RefundItem,
  FirstContactQuestionnaire,
  ConsultationType,
  AttendanceStatus,
  UserRole
} from '../types';
import { 
  INITIAL_SLOTS, 
  INITIAL_SPECIALISTS, 
  INITIAL_WAITLIST, 
  INITIAL_LOGS,
  INITIAL_REFUNDS,
  INITIAL_QUESTIONNAIRES,
  INITIAL_EMAILS
} from '../data/mockData';
import { playNotificationSound } from '../utils/audio';

interface BookingStore {
  currentRole: UserRole;
  activeSpecialistId: string;
  slots: Slot[];
  specialists: Specialist[];
  waitlist: WaitlistEntry[];
  coordinatorLogs: CoordinatorLogEntry[];
  simulatedSmsList: SimulatedSMS[];
  simulatedEmails: SimulatedEmail[];
  refunds: RefundItem[];
  questionnaires: FirstContactQuestionnaire[];
  activeHoldSlotId: string | null;
  holdSecondsLeft: number;
  currentView: 'search' | 'manage_visit' | 'waitlist_offer' | 'coordinator_log' | 'specialist_dashboard' | 'coordinator_dashboard';
  activeBookingToken: string;
  activeOfferToken: string;
  demoModeHoursBeforeVisit: number; // np. 72h (>24h) lub 4h (<24h)
  lastCancelledSlot: Slot | null;

  // Role & View Actions
  setRole: (role: UserRole) => void;
  setActiveSpecialistId: (id: string) => void;
  setView: (view: 'search' | 'manage_visit' | 'waitlist_offer' | 'coordinator_log' | 'specialist_dashboard' | 'coordinator_dashboard') => void;
  setActiveBookingToken: (token: string) => void;
  setActiveOfferToken: (token: string) => void;
  setDemoModeHours: (hours: number) => void;

  // Patient Actions
  startHold: (slotId: string, patientName: string, patientPhone: string) => boolean;
  tickHoldTimer: () => void;
  cancelHold: (slotId: string) => void;
  confirmBooking: (slotId: string, patientName: string, patientPhone: string, patientEmail?: string, paymentMethod?: string) => string | null;
  cancelBooking: (slotId: string) => { success: boolean; message: string; refundedAmount: number; waitlistTriggered: boolean };
  acceptWaitlistOffer: (token: string, paymentMethod?: string) => boolean;
  rejectWaitlistOffer: (token: string) => void;
  addToWaitlist: (patientName: string, patientPhone: string, patientEmail: string, type: ConsultationType, specialistId?: string) => void;

  // Specialist Actions
  updateAttendance: (slotId: string, status: AttendanceStatus) => void;
  rescheduleSlot: (slotId: string, newDate: string, newTime: string) => { success: boolean; message: string };
  cancelSlotBySpecialist: (slotId: string, reason: string) => { success: boolean; message: string };
  addNewSlot: (specialistId: string, date: string, time: string, type: ConsultationType, price: number) => void;

  // Coordinator Actions
  processRefund: (refundId: string) => void;
  submitQuestionnaire: (data: Omit<FirstContactQuestionnaire, 'id' | 'submittedAt'>) => void;
  markEmailRead: (emailId: string) => void;

  // MOMENT WOW Trigger
  triggerWowCascade: () => { success: boolean; offerToken: string };

  // Demo Control
  resetDemoData: () => void;
  clearSmsHistory: () => void;
}

const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 7)}`;

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      currentRole: 'patient',
      activeSpecialistId: 'spec_1',
      slots: INITIAL_SLOTS,
      specialists: INITIAL_SPECIALISTS,
      waitlist: INITIAL_WAITLIST,
      coordinatorLogs: INITIAL_LOGS,
      simulatedSmsList: [
        {
          id: 'sms_0',
          phone: '+48 501 412 889',
          message: 'Termin: 29.08 godz. 14:00 został potwierdzony. Link do zarządzania: niepodzielni.pl/v/token_nowak_2908',
          timestamp: '08:30',
          token: 'token_nowak_2908',
          type: 'booking'
        }
      ],
      simulatedEmails: INITIAL_EMAILS,
      refunds: INITIAL_REFUNDS,
      questionnaires: INITIAL_QUESTIONNAIRES,
      activeHoldSlotId: null,
      holdSecondsLeft: 600,
      currentView: 'search',
      activeBookingToken: 'token_nowak_2908',
      activeOfferToken: 'token_offer_wlodarczyk',
      demoModeHoursBeforeVisit: 72,
      lastCancelledSlot: null,

      setRole: (role) => {
        let view: BookingStore['currentView'] = 'search';
        if (role === 'specialist') view = 'specialist_dashboard';
        if (role === 'coordinator') view = 'coordinator_dashboard';
        set({ currentRole: role, currentView: view });
      },

      setActiveSpecialistId: (id) => set({ activeSpecialistId: id }),
      setView: (view) => set({ currentView: view }),
      setActiveBookingToken: (token) => set({ activeBookingToken: token, currentView: 'manage_visit', currentRole: 'patient' }),
      setActiveOfferToken: (token) => set({ activeOfferToken: token, currentView: 'waitlist_offer', currentRole: 'patient' }),
      setDemoModeHours: (hours) => set({ demoModeHoursBeforeVisit: hours }),

      startHold: (slotId, patientName, _patientPhone) => {
        const { slots, coordinatorLogs } = get();
        const slot = slots.find(s => s.id === slotId);
        if (!slot || slot.status !== 'free') return false;

        const heldUntil = Date.now() + 10 * 60 * 1000;
        const updatedSlots = slots.map(s => 
          s.id === slotId ? { ...s, status: 'held' as const, heldUntil, holdReason: 'booking' as const } : s
        );

        const newLog: CoordinatorLogEntry = {
          id: generateId('log'),
          timestamp: new Date().toLocaleTimeString('pl-PL'),
          action: 'HOLD_CREATED',
          details: `Slot #${slotId} (${slot.specialistName}, ${slot.time}) zablokowany na 10 min przez ${patientName || 'użytkownika'}.`,
          slotId,
          actor: 'Pacjent (Wyszukiwarka)'
        };

        set({
          slots: updatedSlots,
          activeHoldSlotId: slotId,
          holdSecondsLeft: 600,
          coordinatorLogs: [newLog, ...coordinatorLogs]
        });
        return true;
      },

      tickHoldTimer: () => {
        const { activeHoldSlotId, holdSecondsLeft, slots, coordinatorLogs } = get();
        if (!activeHoldSlotId) return;

        if (holdSecondsLeft <= 1) {
          const updatedSlots = slots.map(s => 
            s.id === activeHoldSlotId && s.status === 'held' ? { ...s, status: 'free' as const, heldUntil: undefined } : s
          );
          const newLog: CoordinatorLogEntry = {
            id: generateId('log'),
            timestamp: new Date().toLocaleTimeString('pl-PL'),
            action: 'HOLD_EXPIRED',
            details: `Blokada 10-minutowa dla slotu #${activeHoldSlotId} wygasła. Termin powrócił do puli ogólnej.`,
            slotId: activeHoldSlotId,
            actor: 'System (Timer)'
          };
          set({
            slots: updatedSlots,
            activeHoldSlotId: null,
            holdSecondsLeft: 600,
            coordinatorLogs: [newLog, ...coordinatorLogs]
          });
        } else {
          set({ holdSecondsLeft: holdSecondsLeft - 1 });
        }
      },

      cancelHold: (slotId) => {
        const { slots, coordinatorLogs } = get();
        const updatedSlots = slots.map(s => 
          s.id === slotId && s.status === 'held' ? { ...s, status: 'free' as const, heldUntil: undefined } : s
        );
        set({
          slots: updatedSlots,
          activeHoldSlotId: null,
          holdSecondsLeft: 600,
          coordinatorLogs: [
            {
              id: generateId('log'),
              timestamp: new Date().toLocaleTimeString('pl-PL'),
              action: 'HOLD_EXPIRED',
              details: `Anulowano blokadę slotu #${slotId}. Termin zwolniony.`,
              slotId,
              actor: 'Pacjent'
            },
            ...coordinatorLogs
          ]
        });
      },

      confirmBooking: (slotId, patientName, patientPhone, patientEmail = 'pacjent@poczta.pl', paymentMethod = 'BLIK') => {
        const { slots, coordinatorLogs, simulatedSmsList, simulatedEmails } = get();
        const slot = slots.find(s => s.id === slotId);
        if (!slot) return null;

        const token = `token_${patientName.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substring(2, 6)}`;
        const nowFormatted = new Date().toLocaleString('pl-PL');

        const updatedSlots = slots.map(s => {
          if (s.id === slotId) {
            return {
              ...s,
              status: 'booked' as const,
              attendanceStatus: 'scheduled' as const,
              heldUntil: undefined,
              bookedBy: {
                patientName,
                patientPhone,
                patientEmail,
                bookingToken: token,
                bookedAt: nowFormatted,
                paymentMethod
              }
            };
          }
          return s;
        });

        // SMS Notification
        const smsMessage = `Termin: ${slot.date} godz. ${slot.time} został potwierdzony. Link: niepodzielni.pl/v/${token}`;
        const newSms: SimulatedSMS = {
          id: generateId('sms'),
          phone: patientPhone || '+48 501 234 567',
          message: smsMessage,
          timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          token,
          type: 'booking'
        };

        // E-mail Notification
        const emailContent = `Dzień dobry ${patientName},\n\nTwój termin został pomyślnie zarezerwowany i opłacony.\n\nSzczegóły wizyty:\n• Data i godzina: ${slot.date}, godz. ${slot.time}\n• Specjalista: ${slot.specialistName}\n• Płatność: ${paymentMethod} (${slot.price} zł)\n\nMożesz w każdej chwili zarządzać wizytą (odwołać lub zmienić termin) pod bezpiecznym adresem bez logowania:`;
        const newEmail: SimulatedEmail = {
          id: generateId('mail'),
          to: patientEmail,
          subject: `Potwierdzenie wizyty: ${slot.date} godz. ${slot.time} – Fundacja Niepodzielni`,
          preheader: `Rezerwacja u: ${slot.specialistName}`,
          content: emailContent,
          token,
          timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          type: 'booking',
          read: false
        };

        const newLog: CoordinatorLogEntry = {
          id: generateId('log'),
          timestamp: new Date().toLocaleTimeString('pl-PL'),
          action: 'BOOKING_CONFIRMED',
          details: `Opłacono i potwierdzono rezerwację slotu #${slotId} (${slot.specialistName}). Płatność: ${paymentMethod} ${slot.price} zł. Pacjent: ${patientName}.`,
          slotId,
          actor: 'Pacjent (BLIK)'
        };

        playNotificationSound();

        set({
          slots: updatedSlots,
          activeHoldSlotId: null,
          activeBookingToken: token,
          lastCancelledSlot: null,
          coordinatorLogs: [newLog, ...coordinatorLogs],
          simulatedSmsList: [newSms, ...simulatedSmsList],
          simulatedEmails: [newEmail, ...simulatedEmails]
        });

        return token;
      },

      cancelBooking: (slotId) => {
        const { slots, waitlist, coordinatorLogs, simulatedSmsList, simulatedEmails, refunds, demoModeHoursBeforeVisit } = get();
        const slot = slots.find(s => s.id === slotId);
        if (!slot || slot.status !== 'booked') {
          return { success: false, message: 'Nie znaleziono zarezerwowanej wizyty', refundedAmount: 0, waitlistTriggered: false };
        }

        if (demoModeHoursBeforeVisit < 24) {
          return { 
            success: false, 
            message: 'Mniej niż 24h do terminu. Prosimy o bezpośredni kontakt ze specjalistą.', 
            refundedAmount: 0, 
            waitlistTriggered: false 
          };
        }

        const refundedAmount = slot.price;
        const patientName = slot.bookedBy?.patientName || 'Pacjent';
        const patientPhone = slot.bookedBy?.patientPhone || '+48 501 000 000';
        const patientEmail = slot.bookedBy?.patientEmail || 'pacjent@poczta.pl';

        // 1. Zapis do listy zwrotów Stripe
        const newRefund: RefundItem = {
          id: generateId('ref'),
          slotId: slot.id,
          patientName,
          patientPhone,
          amount: refundedAmount,
          cancelledAt: new Date().toLocaleString('pl-PL'),
          status: 'pending'
        };

        const cancelLog: CoordinatorLogEntry = {
          id: generateId('log'),
          timestamp: new Date().toLocaleTimeString('pl-PL'),
          action: 'VISIT_CANCELLED',
          details: `Wizyta #${slotId} odwołana przez pacjenta (${patientName}) z wyprzedzeniem ${demoModeHoursBeforeVisit}h. Kwota zwrotu ${refundedAmount} zł trafiła na listę zwrotów Stripe (do wykonania).`,
          slotId,
          actor: 'Pacjent (/v/:token)'
        };

        // E-mail o anulowaniu
        const cancelEmail: SimulatedEmail = {
          id: generateId('mail'),
          to: patientEmail,
          subject: 'Odwołanie wizyty – Fundacja Niepodzielni',
          preheader: `Wizyta z dnia ${slot.date} została odwołana`,
          content: `Dzień dobry ${patientName},\n\nTwoja wizyta w dniu ${slot.date} o godz. ${slot.time} została odwołana.\nPełny zwrot kwoty ${refundedAmount} zł został zlecony i zostanie zrealizowany na konto, z którego dokonano płatności.`,
          timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          type: 'cancellation',
          read: false
        };

        // 2. Kaskada listy rezerwowej FIFO
        const candidateIndex = waitlist.findIndex(w => 
          w.status === 'waiting' && 
          (w.preferredSpecialistId === slot.specialistId || !w.preferredSpecialistId) &&
          w.preferredType === slot.type
        );

        if (candidateIndex !== -1) {
          const candidate = waitlist[candidateIndex];
          const offerToken = `token_offer_${Math.random().toString(36).substring(2, 8)}`;
          const offerExpiresAt = Date.now() + 15 * 60 * 1000;

          const updatedSlots = slots.map(s => {
            if (s.id === slotId) {
              return {
                ...s,
                status: 'offered' as const,
                attendanceStatus: 'scheduled' as const,
                bookedBy: undefined,
                heldUntil: offerExpiresAt,
                holdReason: 'waitlist_offer' as const,
                offer: {
                  token: offerToken,
                  waitlistEntryId: candidate.id,
                  offeredToName: candidate.patientName,
                  offeredToPhone: candidate.patientPhone,
                  offeredToEmail: candidate.patientEmail,
                  expiresAt: offerExpiresAt
                }
              };
            }
            return s;
          });

          const updatedWaitlist = waitlist.map((w, idx) => 
            idx === candidateIndex ? { ...w, status: 'offered' as const } : w
          );

          // SMS & Email do osoby z listy rezerwowej
          const waitlistSmsText = `Rezerwacja: Termin ${slot.date} godz. ${slot.time} został zwolniony. Potwierdź: niepodzielni.pl/w/${offerToken}`;
          const newSms: SimulatedSMS = {
            id: generateId('sms'),
            phone: candidate.patientPhone,
            message: waitlistSmsText,
            timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
            token: offerToken,
            type: 'waitlist_offer'
          };

          const waitlistEmail: SimulatedEmail = {
            id: generateId('mail'),
            to: candidate.patientEmail || 'kolejka@niepodzielni.com',
            subject: 'Zwolniony termin dla Ciebie! – Fundacja Niepodzielni',
            preheader: `Termin u ${slot.specialistName} czeka na Twoje potwierdzenie`,
            content: `Dzień dobry ${candidate.patientName},\n\nZwolnił się termin u specjalisty ${slot.specialistName} w dniu ${slot.date} o godz. ${slot.time}.\n\nJako osoba z listy rezerwowej masz 15 minut na potwierdzenie i rezerwację terminu.`,
            token: offerToken,
            timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
            type: 'waitlist_offer',
            read: false
          };

          const waitlistLog: CoordinatorLogEntry = {
            id: generateId('log'),
            timestamp: new Date().toLocaleTimeString('pl-PL'),
            action: 'WAITLIST_OFFER_SENT',
            details: `KASKADA: Zwolniony termin zaoferowany osobie #${candidateIndex + 1} z listy rezerwowej (${candidate.patientName}, tel. ${candidate.patientPhone}). Wysłano SMS i E-mail.`,
            slotId,
            actor: 'System (Kaskada FIFO)'
          };

          playNotificationSound();

          set({
            slots: updatedSlots,
            waitlist: updatedWaitlist,
            refunds: [newRefund, ...refunds],
            activeOfferToken: offerToken,
            lastCancelledSlot: slot,
            coordinatorLogs: [waitlistLog, cancelLog, ...coordinatorLogs],
            simulatedSmsList: [newSms, ...simulatedSmsList],
            simulatedEmails: [waitlistEmail, cancelEmail, ...simulatedEmails]
          });

          return { 
            success: true, 
            message: `Wizyta odwołana pomyślnie. Zwrot ${refundedAmount} zł trafił do panelu Stripe. Termin automatycznie przekazano osobie z listy rezerwowej (${candidate.patientName})!`, 
            refundedAmount, 
            waitlistTriggered: true 
          };
        } else {
          const updatedSlots = slots.map(s => 
            s.id === slotId ? { ...s, status: 'free' as const, bookedBy: undefined, offer: undefined } : s
          );
          set({
            slots: updatedSlots,
            refunds: [newRefund, ...refunds],
            lastCancelledSlot: slot,
            coordinatorLogs: [cancelLog, ...coordinatorLogs],
            simulatedEmails: [cancelEmail, ...simulatedEmails]
          });

          return { 
            success: true, 
            message: `Wizyta odwołana pomyślnie. Zwrot ${refundedAmount} zł trafił do panelu Stripe. Termin powrócił do puli ogólnej.`, 
            refundedAmount, 
            waitlistTriggered: false 
          };
        }
      },

      acceptWaitlistOffer: (token, paymentMethod = 'BLIK') => {
        const { slots, waitlist, coordinatorLogs, simulatedSmsList, simulatedEmails } = get();
        const slot = slots.find(s => s.offer?.token === token && s.status === 'offered') 
          || slots.find(s => s.status === 'offered');
        if (!slot || !slot.offer) return false;

        const candidateName = slot.offer.offeredToName;
        const candidatePhone = slot.offer.offeredToPhone;
        const candidateEmail = slot.offer.offeredToEmail || 'pacjent@poczta.pl';
        const newBookingToken = `token_${candidateName.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substring(2, 6)}`;

        const updatedSlots = slots.map(s => {
          if (s.id === slot.id) {
            return {
              ...s,
              status: 'booked' as const,
              attendanceStatus: 'scheduled' as const,
              heldUntil: undefined,
              offer: undefined,
              bookedBy: {
                patientName: candidateName,
                patientPhone: candidatePhone,
                patientEmail: candidateEmail,
                bookingToken: newBookingToken,
                bookedAt: new Date().toLocaleString('pl-PL'),
                paymentMethod
              }
            };
          }
          return s;
        });

        const updatedWaitlist = waitlist.map(w => 
          w.id === slot.offer?.waitlistEntryId ? { ...w, status: 'accepted' as const } : w
        );

        const newSms: SimulatedSMS = {
          id: generateId('sms'),
          phone: candidatePhone,
          message: `Termin z listy rezerwowej (${slot.date} ${slot.time}) został potwierdzony. Link: niepodzielni.pl/v/${newBookingToken}`,
          timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          token: newBookingToken,
          type: 'booking'
        };

        const newEmail: SimulatedEmail = {
          id: generateId('mail'),
          to: candidateEmail,
          subject: 'Potwierdzenie przejęcia terminu – Fundacja Niepodzielni',
          preheader: `Wizyta: ${slot.date} godz. ${slot.time}`,
          content: `Dzień dobry ${candidateName},\n\nTwój termin z listy rezerwowej u specjalisty ${slot.specialistName} został opłacony i potwierdzony.\nLink do zarządzania wizytą:`,
          token: newBookingToken,
          timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          type: 'booking',
          read: false
        };

        const newLog: CoordinatorLogEntry = {
          id: generateId('log'),
          timestamp: new Date().toLocaleTimeString('pl-PL'),
          action: 'WAITLIST_ACCEPTED',
          details: `Oferta z listy rezerwowej zaakceptowana przez ${candidateName}. Wizyta #${slot.id} opłacona ${paymentMethod} ${slot.price} zł.`,
          slotId: slot.id,
          actor: 'Pacjent z Waitlisty'
        };

        playNotificationSound();

        set({
          slots: updatedSlots,
          waitlist: updatedWaitlist,
          activeBookingToken: newBookingToken,
          lastCancelledSlot: null,
          coordinatorLogs: [newLog, ...coordinatorLogs],
          simulatedSmsList: [newSms, ...simulatedSmsList],
          simulatedEmails: [newEmail, ...simulatedEmails]
        });

        return true;
      },

      rejectWaitlistOffer: (token) => {
        const { slots, waitlist, coordinatorLogs } = get();
        const slot = slots.find(s => s.offer?.token === token);
        if (!slot) return;

        const currentOfferEntryId = slot.offer?.waitlistEntryId;
        const nextCandidate = waitlist.find(w => 
          w.id !== currentOfferEntryId && 
          w.status === 'waiting' && 
          (w.preferredSpecialistId === slot.specialistId || !w.preferredSpecialistId)
        );

        if (nextCandidate) {
          const nextToken = `token_offer_${Math.random().toString(36).substring(2, 8)}`;
          const updatedSlots = slots.map(s => {
            if (s.id === slot.id) {
              return {
                ...s,
                offer: {
                  token: nextToken,
                  waitlistEntryId: nextCandidate.id,
                  offeredToName: nextCandidate.patientName,
                  offeredToPhone: nextCandidate.patientPhone,
                  offeredToEmail: nextCandidate.patientEmail,
                  expiresAt: Date.now() + 15 * 60 * 1000
                }
              };
            }
            return s;
          });

          set({
            slots: updatedSlots,
            activeOfferToken: nextToken,
            coordinatorLogs: [
              {
                id: generateId('log'),
                timestamp: new Date().toLocaleTimeString('pl-PL'),
                action: 'WAITLIST_OFFER_SENT',
                details: `Poprzednia osoba odrzuciła. Termin przekazano kolejnej osobie: ${nextCandidate.patientName}.`,
                slotId: slot.id,
                actor: 'System (Kaskada FIFO)'
              },
              ...coordinatorLogs
            ]
          });
        } else {
          const updatedSlots = slots.map(s => 
            s.id === slot.id ? { ...s, status: 'free' as const, offer: undefined } : s
          );
          set({
            slots: updatedSlots,
            coordinatorLogs: [
              {
                id: generateId('log'),
                timestamp: new Date().toLocaleTimeString('pl-PL'),
                action: 'HOLD_EXPIRED',
                details: `Kolejka rezerwowa wyczerpana. Slot #${slot.id} wrócił do puli publicznej.`,
                slotId: slot.id,
                actor: 'System'
              },
              ...coordinatorLogs
            ]
          });
        }
      },

      addToWaitlist: (patientName, patientPhone, patientEmail, type, specialistId) => {
        const { waitlist, coordinatorLogs } = get();
        const newEntry: WaitlistEntry = {
          id: generateId('wait'),
          patientName,
          patientPhone,
          patientEmail,
          preferredType: type,
          preferredSpecialistId: specialistId,
          createdAt: Date.now(),
          status: 'waiting'
        };
        set({
          waitlist: [...waitlist, newEntry],
          coordinatorLogs: [
            {
              id: generateId('log'),
              timestamp: new Date().toLocaleTimeString('pl-PL'),
              action: 'WAITLIST_OFFER_SENT',
              details: `Nowy zapis na listę rezerwową: ${patientName} (${type}). Pozycja w kolejce: #${waitlist.length + 1}.`,
              slotId: 'waitlist',
              actor: 'Pacjent'
            },
            ...coordinatorLogs
          ]
        });
      },

      // Specialist Actions
      updateAttendance: (slotId, status) => {
        const { slots, coordinatorLogs } = get();
        const slot = slots.find(s => s.id === slotId);
        if (!slot) return;

        const updatedSlots = slots.map(s => 
          s.id === slotId ? { ...s, attendanceStatus: status } : s
        );

        const statusLabels: Record<AttendanceStatus, string> = {
          completed: 'Odbyta ✓',
          no_show: 'Nieobecność nieusprawiedliwiona ✗',
          scheduled: 'Zaplanowana',
          cancelled: 'Odwołana'
        };

        const newLog: CoordinatorLogEntry = {
          id: generateId('log'),
          timestamp: new Date().toLocaleTimeString('pl-PL'),
          action: 'ATTENDANCE_UPDATED',
          details: `Specjalista ${slot.specialistName} zaktualizował obecność dla wizyty #${slotId}: ${statusLabels[status]}.`,
          slotId,
          actor: slot.specialistName
        };

        set({
          slots: updatedSlots,
          coordinatorLogs: [newLog, ...coordinatorLogs]
        });
      },

      rescheduleSlot: (slotId, newDate, newTime) => {
        const { slots, coordinatorLogs, simulatedSmsList, simulatedEmails } = get();
        const slot = slots.find(s => s.id === slotId);
        if (!slot) return { success: false, message: 'Nie znaleziono wizyty' };

        const currentCount = slot.rescheduleCount || 0;
        if (currentCount >= 2) {
          return { success: false, message: 'Osiągnięto limit maksymalnie 2 przełożeń dla tej wizyty.' };
        }

        const updatedSlots = slots.map(s => {
          if (s.id === slotId) {
            return {
              ...s,
              date: newDate,
              time: newTime,
              rescheduleCount: currentCount + 1
            };
          }
          return s;
        });

        // Notifications
        if (slot.bookedBy) {
          const smsText = `Zmiana terminu: Nowy termin wizyty to ${newDate} godz. ${newTime}. Link: niepodzielni.pl/v/${slot.bookedBy.bookingToken}`;
          const newSms: SimulatedSMS = {
            id: generateId('sms'),
            phone: slot.bookedBy.patientPhone,
            message: smsText,
            timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
            token: slot.bookedBy.bookingToken,
            type: 'reschedule'
          };

          const newEmail: SimulatedEmail = {
            id: generateId('mail'),
            to: slot.bookedBy.patientEmail || 'pacjent@poczta.pl',
            subject: 'Zmiana terminu wizyty – Fundacja Niepodzielni',
            preheader: `Nowy termin: ${newDate} godz. ${newTime}`,
            content: `Dzień dobry ${slot.bookedBy.patientName},\n\nTermin Twojej wizyty u specjalisty ${slot.specialistName} został przełożony na: ${newDate}, godz. ${newTime}.\nLiczba wykorzystanych przełożeń: ${currentCount + 1}/2.\nLink do zarządzania:`,
            token: slot.bookedBy.bookingToken,
            timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
            type: 'reschedule',
            read: false
          };

          playNotificationSound();

          set({
            simulatedSmsList: [newSms, ...simulatedSmsList],
            simulatedEmails: [newEmail, ...simulatedEmails]
          });
        }

        const newLog: CoordinatorLogEntry = {
          id: generateId('log'),
          timestamp: new Date().toLocaleTimeString('pl-PL'),
          action: 'SLOT_RESCHEDULED',
          details: `Przełożono wizytę #${slotId} na ${newDate} ${newTime} (przełożenie ${currentCount + 1}/2).`,
          slotId,
          actor: 'Specjalista / Koordynator'
        };

        set({
          slots: updatedSlots,
          coordinatorLogs: [newLog, ...coordinatorLogs]
        });

        return { success: true, message: `Pomyślnie zmieniono termin na ${newDate} ${newTime}.` };
      },

      cancelSlotBySpecialist: (slotId, reason) => {
        const { slots, waitlist, coordinatorLogs, simulatedSmsList, refunds } = get();
        const slot = slots.find(s => s.id === slotId);
        if (!slot) return { success: false, message: 'Nie znaleziono terminu' };

        const patientName = slot.bookedBy?.patientName || 'Brak pacjenta';
        const patientPhone = slot.bookedBy?.patientPhone || '';

        let newRefunds = refunds;
        if (slot.bookedBy && slot.price > 0) {
          const refund: RefundItem = {
            id: generateId('ref'),
            slotId: slot.id,
            patientName,
            patientPhone,
            amount: slot.price,
            cancelledAt: new Date().toLocaleString('pl-PL'),
            status: 'pending'
          };
          newRefunds = [refund, ...refunds];
        }

        const candidateIndex = waitlist.findIndex(w => 
          w.status === 'waiting' && 
          (w.preferredSpecialistId === slot.specialistId || !w.preferredSpecialistId) &&
          w.preferredType === slot.type
        );

        if (candidateIndex !== -1) {
          const candidate = waitlist[candidateIndex];
          const offerToken = `token_offer_${Math.random().toString(36).substring(2, 8)}`;
          const offerExpiresAt = Date.now() + 15 * 60 * 1000;

          const updatedSlots = slots.map(s => {
            if (s.id === slotId) {
              return {
                ...s,
                status: 'offered' as const,
                attendanceStatus: 'scheduled' as const,
                bookedBy: undefined,
                heldUntil: offerExpiresAt,
                holdReason: 'waitlist_offer' as const,
                offer: {
                  token: offerToken,
                  waitlistEntryId: candidate.id,
                  offeredToName: candidate.patientName,
                  offeredToPhone: candidate.patientPhone,
                  offeredToEmail: candidate.patientEmail,
                  expiresAt: offerExpiresAt
                }
              };
            }
            return s;
          });

          const updatedWaitlist = waitlist.map((w, idx) => 
            idx === candidateIndex ? { ...w, status: 'offered' as const } : w
          );

          const newSms: SimulatedSMS = {
            id: generateId('sms'),
            phone: candidate.patientPhone,
            message: `Rezerwacja: Termin ${slot.date} godz. ${slot.time} został zwolniony. Potwierdź: niepodzielni.pl/w/${offerToken}`,
            timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
            token: offerToken,
            type: 'waitlist_offer'
          };

          const log: CoordinatorLogEntry = {
            id: generateId('log'),
            timestamp: new Date().toLocaleTimeString('pl-PL'),
            action: 'VISIT_CANCELLED',
            details: `Specjalista ${slot.specialistName} odwołał termin #${slotId} (${reason}). KASKADA: Zwolniony termin zaoferowano ${candidate.patientName}.`,
            slotId,
            actor: slot.specialistName
          };

          playNotificationSound();

          set({
            slots: updatedSlots,
            waitlist: updatedWaitlist,
            refunds: newRefunds,
            coordinatorLogs: [log, ...coordinatorLogs],
            simulatedSmsList: [newSms, ...simulatedSmsList]
          });

          return { success: true, message: 'Termin odwołany przez specjalistę i natychmiast przekazany osobie z listy rezerwowej!' };
        } else {
          const updatedSlots = slots.map(s => 
            s.id === slotId ? { ...s, status: 'free' as const, bookedBy: undefined, offer: undefined } : s
          );
          const log: CoordinatorLogEntry = {
            id: generateId('log'),
            timestamp: new Date().toLocaleTimeString('pl-PL'),
            action: 'VISIT_CANCELLED',
            details: `Specjalista ${slot.specialistName} odwołał wizytę #${slotId} (${reason}). Termin wrócił do puli ogólnej.`,
            slotId,
            actor: slot.specialistName
          };

          set({
            slots: updatedSlots,
            refunds: newRefunds,
            coordinatorLogs: [log, ...coordinatorLogs]
          });

          return { success: true, message: 'Termin został zwolniony i przywrócony do puli wolnych.' };
        }
      },

      addNewSlot: (specialistId, date, time, type, price) => {
        const { slots, specialists, coordinatorLogs } = get();
        const spec = specialists.find(s => s.id === specialistId);
        if (!spec) return;

        const newSlot: Slot = {
          id: generateId('slot'),
          specialistId,
          specialistName: spec.name,
          specialistRole: spec.role,
          date,
          time,
          type,
          price,
          status: 'free',
          attendanceStatus: 'scheduled',
          rescheduleCount: 0
        };

        const log: CoordinatorLogEntry = {
          id: generateId('log'),
          timestamp: new Date().toLocaleTimeString('pl-PL'),
          action: 'SLOT_CREATED_BY_SPECIALIST',
          details: `Dodano nowy termin w grafiku: ${spec.name} (${date}, godz. ${time}, ${price} zł).`,
          slotId: newSlot.id,
          actor: spec.name
        };

        set({
          slots: [newSlot, ...slots],
          coordinatorLogs: [log, ...coordinatorLogs]
        });
      },

      // Coordinator Actions
      processRefund: (refundId) => {
        const { refunds, coordinatorLogs } = get();
        const ref = refunds.find(r => r.id === refundId);
        if (!ref) return;

        const updatedRefunds = refunds.map(r => 
          r.id === refundId ? { ...r, status: 'completed' as const, completedAt: new Date().toLocaleString('pl-PL'), processedBy: 'Koordynator Fundacji' } : r
        );

        const log: CoordinatorLogEntry = {
          id: generateId('log'),
          timestamp: new Date().toLocaleTimeString('pl-PL'),
          action: 'REFUND_PROCESSED',
          details: `Koordynator wykonał ręczny zwrot w Stripe: ${ref.amount} zł dla ${ref.patientName} (slot #${ref.slotId}).`,
          slotId: ref.slotId,
          actor: 'Koordynator Fundacji'
        };

        set({
          refunds: updatedRefunds,
          coordinatorLogs: [log, ...coordinatorLogs]
        });
      },

      submitQuestionnaire: (data) => {
        const { questionnaires, coordinatorLogs } = get();
        const newQ: FirstContactQuestionnaire = {
          ...data,
          id: generateId('quest'),
          submittedAt: new Date().toLocaleString('pl-PL')
        };
        set({
          questionnaires: [newQ, ...questionnaires],
          coordinatorLogs: [
            {
              id: generateId('log'),
              timestamp: new Date().toLocaleTimeString('pl-PL'),
              action: 'HOLD_CREATED',
              details: `Wpłynęła ankieta pierwszego kontaktu od: ${data.patientName} (6 pytań zamkniętych).`,
              slotId: 'ankieta',
              actor: 'Pacjent (Ankieta)'
            },
            ...coordinatorLogs
          ]
        });
      },

      markEmailRead: (emailId) => {
        const { simulatedEmails } = get();
        set({
          simulatedEmails: simulatedEmails.map(e => e.id === emailId ? { ...e, read: true } : e)
        });
      },

      // GUARANTEED MOMENT WOW TRIGGER
      triggerWowCascade: () => {
        const { slots } = get();
        
        // 1. Zapewnij, że slot_102 jest zarezerwowany przez Katarzynę Nowak
        let targetSlot = slots.find(s => s.id === 'slot_102');
        let currentSlots = slots;

        if (!targetSlot || targetSlot.status !== 'booked') {
          currentSlots = slots.map(s => {
            if (s.id === 'slot_102') {
              return {
                ...s,
                status: 'booked' as const,
                attendanceStatus: 'scheduled' as const,
                bookedBy: {
                  patientName: 'Katarzyna Nowak',
                  patientPhone: '+48 501 412 889',
                  patientEmail: 'katarzyna.nowak@poczta.pl',
                  bookingToken: 'token_nowak_2908',
                  bookedAt: '2026-08-28 08:30',
                  paymentMethod: 'BLIK'
                }
              };
            }
            return s;
          });
          set({ slots: currentSlots });
        }

        // 2. Ustaw stan dema na >24h
        set({
          demoModeHoursBeforeVisit: 72,
          currentRole: 'patient',
          activeBookingToken: 'token_nowak_2908'
        });

        // 3. Wykonaj odwołanie i kaskadę
        const res = get().cancelBooking('slot_102');
        const offerToken = get().activeOfferToken;

        // 4. Przejdź do widoku zarządzania wizytą (gdzie widać odwołanie i powiadomienie SMS na telefonie)
        set({ currentView: 'manage_visit' });

        return {
          success: res.success,
          offerToken
        };
      },

      resetDemoData: () => {
        set({
          currentRole: 'patient',
          activeSpecialistId: 'spec_1',
          slots: INITIAL_SLOTS,
          specialists: INITIAL_SPECIALISTS,
          waitlist: INITIAL_WAITLIST,
          coordinatorLogs: INITIAL_LOGS,
          simulatedSmsList: [
            {
              id: 'sms_init',
              phone: '+48 501 412 889',
              message: 'Termin: 29.08 godz. 14:00 został potwierdzony. Link: niepodzielni.pl/v/token_nowak_2908',
              timestamp: '08:30',
              token: 'token_nowak_2908',
              type: 'booking'
            }
          ],
          simulatedEmails: INITIAL_EMAILS,
          refunds: INITIAL_REFUNDS,
          questionnaires: INITIAL_QUESTIONNAIRES,
          activeHoldSlotId: null,
          holdSecondsLeft: 600,
          currentView: 'search',
          activeBookingToken: 'token_nowak_2908',
          activeOfferToken: 'token_offer_wlodarczyk',
          demoModeHoursBeforeVisit: 72,
          lastCancelledSlot: null
        });
      },

      clearSmsHistory: () => set({ simulatedSmsList: [], simulatedEmails: [] })
    }),
    {
      name: 'niepodzielni-booking-storage-v3',
      partialize: (state) => ({
        currentRole: state.currentRole,
        activeSpecialistId: state.activeSpecialistId,
        slots: state.slots,
        waitlist: state.waitlist,
        coordinatorLogs: state.coordinatorLogs,
        simulatedSmsList: state.simulatedSmsList,
        simulatedEmails: state.simulatedEmails,
        refunds: state.refunds,
        questionnaires: state.questionnaires,
        demoModeHoursBeforeVisit: state.demoModeHoursBeforeVisit
      })
    }
  )
);
