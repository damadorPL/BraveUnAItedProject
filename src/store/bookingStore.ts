import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Slot, Specialist, WaitlistEntry, CoordinatorLogEntry, SimulatedSMS, ConsultationType } from '../types';
import { INITIAL_SLOTS, INITIAL_SPECIALISTS, INITIAL_WAITLIST } from '../data/mockData';

interface BookingStore {
  slots: Slot[];
  specialists: Specialist[];
  waitlist: WaitlistEntry[];
  coordinatorLogs: CoordinatorLogEntry[];
  simulatedSmsList: SimulatedSMS[];
  activeHoldSlotId: string | null;
  holdSecondsLeft: number;
  currentView: 'search' | 'manage_visit' | 'waitlist_offer' | 'coordinator_log';
  activeBookingToken: string;
  activeOfferToken: string;
  demoModeHoursBeforeVisit: number; // np. 72h (>24h) lub 4h (<24h)

  // Actions
  setView: (view: 'search' | 'manage_visit' | 'waitlist_offer' | 'coordinator_log') => void;
  setActiveBookingToken: (token: string) => void;
  setActiveOfferToken: (token: string) => void;
  setDemoModeHours: (hours: number) => void;

  startHold: (slotId: string, patientName: string, patientPhone: string) => boolean;
  tickHoldTimer: () => void;
  cancelHold: (slotId: string) => void;
  confirmBooking: (slotId: string, patientName: string, patientPhone: string, paymentMethod?: string) => string | null;
  cancelBooking: (slotId: string) => { success: boolean; message: string; refundedAmount: number; waitlistTriggered: boolean };
  acceptWaitlistOffer: (token: string, paymentMethod?: string) => boolean;
  rejectWaitlistOffer: (token: string) => void;
  addToWaitlist: (patientName: string, patientPhone: string, type: ConsultationType, specialistId?: string) => void;
  resetDemoData: () => void;
  clearSmsHistory: () => void;
}

const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 7)}`;

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      slots: INITIAL_SLOTS,
      specialists: INITIAL_SPECIALISTS,
      waitlist: INITIAL_WAITLIST,
      coordinatorLogs: [
        {
          id: 'log_0',
          timestamp: '2026-08-28 08:30:15',
          action: 'BOOKING_CONFIRMED',
          details: 'Wizyta #slot_102 (mgr Aleksandra Wiśniewska) zarezerwowana przez Katarzyna Nowak. Płatność: BLIK 55 zł.',
          slotId: 'slot_102',
          actor: 'System Rezerwacji'
        },
        {
          id: 'log_init',
          timestamp: '2026-08-28 08:35:00',
          action: 'HOLD_CREATED',
          details: 'Inicjalizacja systemu. Dostępnych 111 specjalistów w bazie.',
          slotId: 'all',
          actor: 'Koordynator Fundacji'
        }
      ],
      simulatedSmsList: [
        {
          id: 'sms_0',
          phone: '+48 501 ••• 412',
          message: 'Termin: 29.08 godz. 14:00 został potwierdzony. Link do zarządzania: niepodzielni.pl/v/token_nowak_2908',
          timestamp: '08:30',
          token: 'token_nowak_2908',
          type: 'booking'
        }
      ],
      activeHoldSlotId: null,
      holdSecondsLeft: 600, // 10 minut
      currentView: 'search',
      activeBookingToken: 'token_nowak_2908',
      activeOfferToken: 'token_offer_wlodarczyk',
      demoModeHoursBeforeVisit: 72, // domyślnie >24h (bezpieczne odwołanie)

      setView: (view) => set({ currentView: view }),
      setActiveBookingToken: (token) => set({ activeBookingToken: token, currentView: 'manage_visit' }),
      setActiveOfferToken: (token) => set({ activeOfferToken: token, currentView: 'waitlist_offer' }),
      setDemoModeHours: (hours) => set({ demoModeHoursBeforeVisit: hours }),

      startHold: (slotId, patientName, patientPhone) => {
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
          // Wygaśnięcie blokady
          const updatedSlots = slots.map(s => 
            s.id === activeHoldSlotId && s.status === 'held' ? { ...s, status: 'free' as const, heldUntil: undefined } : s
          );
          const newLog: CoordinatorLogEntry = {
            id: generateId('log'),
            timestamp: new Date().toLocaleTimeString('pl-PL'),
            action: 'HOLD_EXPIRED',
            details: `Blokada 10-minutowa dla slotu #${activeHoldSlotId} wygasła. Termin powrócił do puli publicznej.`,
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

      confirmBooking: (slotId, patientName, patientPhone, paymentMethod = 'BLIK') => {
        const { slots, coordinatorLogs, simulatedSmsList } = get();
        const slot = slots.find(s => s.id === slotId);
        if (!slot) return null;

        const token = `token_${patientName.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substring(2, 6)}`;
        const nowFormatted = new Date().toLocaleString('pl-PL');

        const updatedSlots = slots.map(s => {
          if (s.id === slotId) {
            return {
              ...s,
              status: 'booked' as const,
              heldUntil: undefined,
              bookedBy: {
                patientName,
                patientPhone,
                bookingToken: token,
                bookedAt: nowFormatted,
                paymentMethod
              }
            };
          }
          return s;
        });

        // Dyskretna wiadomość SMS (BEZ słów o zdrowiu!)
        const smsMessage = `Termin: ${slot.date} godz. ${slot.time} został potwierdzony. Link: niepodzielni.pl/v/${token}`;
        const newSms: SimulatedSMS = {
          id: generateId('sms'),
          phone: patientPhone || '+48 501 ••• 412',
          message: smsMessage,
          timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          token,
          type: 'booking'
        };

        const newLog: CoordinatorLogEntry = {
          id: generateId('log'),
          timestamp: new Date().toLocaleTimeString('pl-PL'),
          action: 'BOOKING_CONFIRMED',
          details: `Opłacono i potwierdzono rezerwację slotu #${slotId} (${slot.specialistName}). Płatność: ${paymentMethod} ${slot.price} zł. Pacjent: ${patientName}.`,
          slotId,
          actor: 'Pacjent (BLIK)'
        };

        set({
          slots: updatedSlots,
          activeHoldSlotId: null,
          activeBookingToken: token,
          coordinatorLogs: [newLog, ...coordinatorLogs],
          simulatedSmsList: [newSms, ...simulatedSmsList]
        });

        return token;
      },

      cancelBooking: (slotId) => {
        const { slots, waitlist, coordinatorLogs, simulatedSmsList, demoModeHoursBeforeVisit } = get();
        const slot = slots.find(s => s.id === slotId);
        if (!slot || slot.status !== 'booked') {
          return { success: false, message: 'Nie znaleziono zarezerwowanej wizyty', refundedAmount: 0, waitlistTriggered: false };
        }

        // Sprawdzenie reguły 24h
        if (demoModeHoursBeforeVisit < 24) {
          return { 
            success: false, 
            message: 'Mniej niż 24h do terminu. Zgodnie z regulaminem prosimy o bezpośredni kontakt ze specjalistą.', 
            refundedAmount: 0, 
            waitlistTriggered: false 
          };
        }

        const refundedAmount = slot.price;
        const patientName = slot.bookedBy?.patientName || 'Pacjent';

        // 1. Zapis odwołania do rejestru koordynatora
        const cancelLog: CoordinatorLogEntry = {
          id: generateId('log'),
          timestamp: new Date().toLocaleTimeString('pl-PL'),
          action: 'VISIT_CANCELLED',
          details: `Wizyta #${slotId} odwołana przez pacjenta (${patientName}) z wyprzedzeniem ${demoModeHoursBeforeVisit}h. Kwota do zwrotu: ${refundedAmount} zł (do wykonania w panelu Stripe).`,
          slotId,
          actor: 'Pacjent (/v/:token)'
        };

        // 2. KASKADA LISTY REZERWOWEJ (MOMENT WOW)
        // Szukamy pierwszej osoby w kolejce FIFO pasującej do specjalisty i typu
        const candidateIndex = waitlist.findIndex(w => 
          w.status === 'waiting' && 
          (w.preferredSpecialistId === slot.specialistId || !w.preferredSpecialistId) &&
          w.preferredType === slot.type
        );

        if (candidateIndex !== -1) {
          const candidate = waitlist[candidateIndex];
          const offerToken = `token_offer_${Math.random().toString(36).substring(2, 8)}`;
          const offerExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minut na odpowiedź

          // Aktualizacja slotu do stanu 'offered'
          const updatedSlots = slots.map(s => {
            if (s.id === slotId) {
              return {
                ...s,
                status: 'offered' as const,
                bookedBy: undefined,
                heldUntil: offerExpiresAt,
                holdReason: 'waitlist_offer' as const,
                offer: {
                  token: offerToken,
                  waitlistEntryId: candidate.id,
                  offeredToName: candidate.patientName,
                  offeredToPhone: candidate.patientPhone,
                  expiresAt: offerExpiresAt
                }
              };
            }
            return s;
          });

          // Aktualizacja wpisu na liście rezerwowej
          const updatedWaitlist = waitlist.map((w, idx) => 
            idx === candidateIndex ? { ...w, status: 'offered' as const } : w
          );

          // DYSKRETNY SMS DLA OSOBY Z KOLEJKI (MOMENT WOW)
          const waitlistSmsText = `Rezerwacja: Termin ${slot.date} godz. ${slot.time} został zwolniony. Potwierdź: niepodzielni.pl/w/${offerToken}`;
          const newSms: SimulatedSMS = {
            id: generateId('sms'),
            phone: candidate.patientPhone,
            message: waitlistSmsText,
            timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
            token: offerToken,
            type: 'waitlist_offer'
          };

          const waitlistLog: CoordinatorLogEntry = {
            id: generateId('log'),
            timestamp: new Date().toLocaleTimeString('pl-PL'),
            action: 'WAITLIST_OFFER_SENT',
            details: `KASKADA: Zwolniony termin zaoferowany osobie #${candidateIndex + 1} z listy rezerwowej (${candidate.patientName}, tel. ${candidate.patientPhone}). Wysłano dyskretny SMS.`,
            slotId,
            actor: 'System (Kaskada FIFO)'
          };

          set({
            slots: updatedSlots,
            waitlist: updatedWaitlist,
            activeOfferToken: offerToken,
            coordinatorLogs: [waitlistLog, cancelLog, ...coordinatorLogs],
            simulatedSmsList: [newSms, ...simulatedSmsList]
          });

          return { 
            success: true, 
            message: `Wizyta odwołana pomyślnie. Zwrot ${refundedAmount} zł zostanie zrealizowany. Termin automatycznie przekazano osobie z listy rezerwowej!`, 
            refundedAmount, 
            waitlistTriggered: true 
          };
        } else {
          // Brak osób w kolejce -> powrót do wolnych
          const updatedSlots = slots.map(s => 
            s.id === slotId ? { ...s, status: 'free' as const, bookedBy: undefined, offer: undefined } : s
          );
          set({
            slots: updatedSlots,
            coordinatorLogs: [cancelLog, ...coordinatorLogs]
          });

          return { 
            success: true, 
            message: `Wizyta odwołana pomyślnie. Zwrot ${refundedAmount} zł zostanie zrealizowany. Termin wrócił do puli ogólnej.`, 
            refundedAmount, 
            waitlistTriggered: false 
          };
        }
      },

      acceptWaitlistOffer: (token, paymentMethod = 'BLIK') => {
        const { slots, waitlist, coordinatorLogs, simulatedSmsList } = get();
        const slot = slots.find(s => s.offer?.token === token && s.status === 'offered');
        if (!slot || !slot.offer) return false;

        const candidateName = slot.offer.offeredToName;
        const candidatePhone = slot.offer.offeredToPhone;
        const newBookingToken = `token_${candidateName.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substring(2, 6)}`;

        const updatedSlots = slots.map(s => {
          if (s.id === slot.id) {
            return {
              ...s,
              status: 'booked' as const,
              heldUntil: undefined,
              offer: undefined,
              bookedBy: {
                patientName: candidateName,
                patientPhone: candidatePhone,
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

        const newLog: CoordinatorLogEntry = {
          id: generateId('log'),
          timestamp: new Date().toLocaleTimeString('pl-PL'),
          action: 'WAITLIST_ACCEPTED',
          details: `Oferta z listy rezerwowej zaakceptowana przez ${candidateName}. Wizyta #${slot.id} opłacona ${paymentMethod} ${slot.price} zł.`,
          slotId: slot.id,
          actor: 'Pacjent z Waitlisty'
        };

        set({
          slots: updatedSlots,
          waitlist: updatedWaitlist,
          activeBookingToken: newBookingToken,
          coordinatorLogs: [newLog, ...coordinatorLogs],
          simulatedSmsList: [newSms, ...simulatedSmsList]
        });

        return true;
      },

      rejectWaitlistOffer: (token) => {
        const { slots, waitlist, coordinatorLogs } = get();
        const slot = slots.find(s => s.offer?.token === token);
        if (!slot) return;

        // Szukamy kolejnej osoby z listy
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
          // Brak kolejnych osób -> wolny slot
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

      addToWaitlist: (patientName, patientPhone, type, specialistId) => {
        const { waitlist, coordinatorLogs } = get();
        const newEntry: WaitlistEntry = {
          id: generateId('wait'),
          patientName,
          patientPhone,
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

      resetDemoData: () => {
        set({
          slots: INITIAL_SLOTS,
          specialists: INITIAL_SPECIALISTS,
          waitlist: INITIAL_WAITLIST,
          activeHoldSlotId: null,
          holdSecondsLeft: 600,
          currentView: 'search',
          activeBookingToken: 'token_nowak_2908',
          activeOfferToken: 'token_offer_wlodarczyk',
          demoModeHoursBeforeVisit: 72,
          coordinatorLogs: [
            {
              id: 'log_reset',
              timestamp: new Date().toLocaleTimeString('pl-PL'),
              action: 'BOOKING_CONFIRMED',
              details: 'Zresetowano stan systemu do domyślnych danych demonstracyjnych.',
              slotId: 'all',
              actor: 'Prezenter Demo'
            }
          ],
          simulatedSmsList: [
            {
              id: 'sms_init',
              phone: '+48 501 ••• 412',
              message: 'Termin: 29.08 godz. 14:00 został potwierdzony. Link: niepodzielni.pl/v/token_nowak_2908',
              timestamp: '08:30',
              token: 'token_nowak_2908',
              type: 'booking'
            }
          ]
        });
      },

      clearSmsHistory: () => set({ simulatedSmsList: [] })
    }),
    {
      name: 'niepodzielni-booking-storage',
      partialize: (state) => ({
        slots: state.slots,
        waitlist: state.waitlist,
        coordinatorLogs: state.coordinatorLogs,
        simulatedSmsList: state.simulatedSmsList,
        demoModeHoursBeforeVisit: state.demoModeHoursBeforeVisit
      })
    }
  )
);
