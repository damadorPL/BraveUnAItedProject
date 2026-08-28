import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, User, Phone, Zap, ArrowRight, X } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { CONSULTATION_TYPES } from '../data/mockData';
import { ConsultationType } from '../types';
import confetti from 'canvas-confetti';

export const SearchAndBooking: React.FC<{ onSelectVisitToken: (token: string) => void }> = ({ onSelectVisitToken }) => {
  const { slots, specialists, activeHoldSlotId, holdSecondsLeft, startHold, tickHoldTimer, cancelHold, confirmBooking, setActiveBookingToken } = useBookingStore();

  const [selectedType, setSelectedType] = useState<ConsultationType | 'all'>('low_cost');
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>('all');
  const [bookingModalSlotId, setBookingModalSlotId] = useState<string | null>(null);

  const [patientName, setPatientName] = useState('Anna Kowalska');
  const [patientPhone, setPatientPhone] = useState('+48 501 234 567');
  const [bookingSuccessToken, setBookingSuccessToken] = useState<string | null>(null);

  // Timer interval for 10-minute hold
  useEffect(() => {
    if (!activeHoldSlotId) return;
    const interval = setInterval(() => {
      tickHoldTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [activeHoldSlotId, tickHoldTimer]);

  const filteredSlots = slots.filter(slot => {
    if (selectedType !== 'all' && slot.type !== selectedType) return false;
    if (selectedSpecialistId !== 'all' && slot.specialistId !== selectedSpecialistId) return false;
    return true;
  });

  const handleSelectSlot = (slotId: string) => {
    const success = startHold(slotId, patientName, patientPhone);
    if (success) {
      setBookingModalSlotId(slotId);
    }
  };

  const handlePayBlik = () => {
    if (!bookingModalSlotId) return;
    const token = confirmBooking(bookingModalSlotId, patientName, patientPhone, 'BLIK');
    if (token) {
      setBookingSuccessToken(token);
      setBookingModalSlotId(null);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const activeSlot = slots.find(s => s.id === bookingModalSlotId);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8">
      
      {/* Hero Intro */}
      <div className="bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white rounded-2xl p-6 sm:p-8 shadow-brand">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-mono font-medium mb-3 backdrop-blur-sm">
            <span>EKRAN 1 / 3 · SZYBKA REZERWACJA</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Znajdź pomoc psychologiczną bez barier
          </h1>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            Rezerwacja w 60 sekund. Wybierz termin, a my natychmiast zablokujemy go dla Ciebie na 10 minut. 
            Bez rejestracji konta, bez dzwonienia, dyskretne potwierdzenie SMS.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-sm space-y-4">
        <div>
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-brand-muted block mb-2">
            Wybierz rodzaj konsultacji:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {Object.values(CONSULTATION_TYPES).map(ct => {
              const isSelected = selectedType === ct.id;
              return (
                <button
                  key={ct.id}
                  onClick={() => setSelectedType(ct.id)}
                  className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-brand-blue bg-brand-blue-light/50 ring-2 ring-brand-blue shadow-sm'
                      : 'border-brand-border bg-brand-card hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-semibold text-xs sm:text-sm text-brand-text line-clamp-1">{ct.label}</span>
                    <span className="font-mono font-bold text-brand-blue text-sm whitespace-nowrap">
                      {ct.price === 0 ? 'Bezpłatnie' : `${ct.price} zł`}
                    </span>
                  </div>
                  {ct.limitRule && (
                    <span className="text-[11px] text-amber-700 font-medium mt-1 line-clamp-1">
                      {ct.limitRule}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Specialist Selector */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-brand-border/60">
          <span className="text-xs font-mono text-brand-muted uppercase font-semibold">Specjalista:</span>
          <button
            onClick={() => setSelectedSpecialistId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedSpecialistId === 'all'
                ? 'bg-brand-text text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-brand-muted'
            }`}
          >
            Wszyscy (111)
          </button>
          {specialists.map(sp => (
            <button
              key={sp.id}
              onClick={() => setSelectedSpecialistId(sp.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedSpecialistId === sp.id
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-brand-muted'
              }`}
            >
              {sp.name}
            </button>
          ))}
        </div>
      </div>

      {/* Available Slots Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display font-bold text-xl text-brand-text flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-blue" />
            Dostępne terminy ({filteredSlots.filter(s => s.status === 'free').length})
          </h2>
          <span className="text-xs text-brand-muted">
            Pokazywanie najbliższych slotów
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlots.map(slot => {
            const spec = specialists.find(s => s.id === slot.specialistId);
            const isHeld = slot.status === 'held';
            const isBooked = slot.status === 'booked';
            const isOffered = slot.status === 'offered';
            const isFree = slot.status === 'free';

            const typeConfig = CONSULTATION_TYPES[slot.type] || CONSULTATION_TYPES.standard;

            return (
              <div
                key={slot.id}
                className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  isHeld
                    ? 'border-amber-300 bg-amber-50/40 shadow-sm'
                    : isBooked
                    ? 'border-gray-200 bg-gray-50 opacity-70'
                    : isOffered
                    ? 'border-purple-300 bg-purple-50/40'
                    : 'border-brand-border hover:border-brand-blue/60 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Bar: Specialist info */}
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={spec?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                      alt={slot.specialistName}
                      className="w-11 h-11 rounded-full object-cover border border-brand-border"
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-brand-text truncate">{slot.specialistName}</h3>
                      <p className="text-xs text-brand-muted truncate">{slot.specialistRole}</p>
                    </div>
                  </div>

                  {/* Consultation Type Badge & Price */}
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-md font-medium border ${typeConfig.badgeColor}`}>
                      {typeConfig.label}
                    </span>
                    <span className="font-mono font-bold text-base text-brand-text">
                      {slot.price === 0 ? 'Bezpłatnie' : `${slot.price} zł`}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-2 bg-brand-card p-2.5 rounded-xl border border-brand-border/60 text-sm font-medium mb-4">
                    <Calendar className="w-4 h-4 text-brand-blue" />
                    <span>{slot.date}</span>
                    <span className="text-brand-muted">·</span>
                    <Clock className="w-4 h-4 text-brand-blue" />
                    <span className="font-mono font-bold">{slot.time}</span>
                  </div>
                </div>

                {/* Bottom Action Button / Status */}
                <div>
                  {isFree && (
                    <button
                      onClick={() => handleSelectSlot(slot.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Wybierz termin</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {isHeld && (
                    <div className="bg-amber-100 text-amber-900 border border-amber-300 p-2.5 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                      <span>Tymczasowa blokada (10 min)</span>
                    </div>
                  )}

                  {isBooked && (
                    <div className="bg-gray-100 text-gray-500 p-2.5 rounded-xl text-center text-xs font-medium">
                      Zarezerwowany ({slot.bookedBy?.patientName})
                    </div>
                  )}

                  {isOffered && (
                    <div className="bg-purple-100 text-purple-800 border border-purple-300 p-2.5 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Zap className="w-4 h-4 text-purple-600 animate-bounce" />
                      <span>Zaoferowany z listy rezerwowej</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Modal (with 10-min hold timer & 1-click BLIK) */}
      {bookingModalSlotId && activeSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-brand-border shadow-2xl space-y-6 relative">
            
            <button
              onClick={() => {
                cancelHold(activeSlot.id);
                setBookingModalSlotId(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-brand-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Hold Timer Alert Header */}
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-mono font-bold text-sm">
                <Clock className="w-5 h-5 text-amber-800" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-mono font-bold uppercase text-amber-900">
                    Termin zablokowany dla Ciebie
                  </span>
                  <span className="font-mono font-extrabold text-brand-red text-base">
                    {formatCountdown(holdSecondsLeft)}
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-0.5">
                  Nikt inny nie zarezerwuje tego terminu przez najbliższe 10 minut.
                </p>
              </div>
            </div>

            {/* Visit Details */}
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-xl text-brand-text">
                Dokończ rezerwację
              </h3>
              <p className="text-xs text-brand-muted">
                {activeSlot.specialistName} · {activeSlot.date}, godz. {activeSlot.time}
              </p>
            </div>

            {/* Simple Form (No password/account needed) */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Imię i nazwisko pacjenta
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                    placeholder="np. Anna Kowalska"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Numer telefonu do dyskretnego SMS z linkiem
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={e => setPatientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none font-mono"
                    placeholder="+48 501 234 567"
                  />
                </div>
              </div>
            </div>

            {/* Total & 1-Click BLIK Payment */}
            <div className="border-t border-brand-border pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-muted">Do zapłaty:</span>
                <span className="font-mono font-bold text-2xl text-brand-blue">
                  {activeSlot.price === 0 ? '0 zł' : `${activeSlot.price} zł`}
                </span>
              </div>

              <button
                onClick={handlePayBlik}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white font-bold text-base transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>Zapłać BLIK-iem (1 kliknięcie)</span>
              </button>

              <p className="text-[11px] text-center text-brand-muted">
                Dyskretne potwierdzenie SMS zostanie natychmiast wysłane na podany telefon.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Booking Success View */}
      {bookingSuccessToken && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm animate-fade-in">
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-emerald-900">
            Rezerwacja potwierdzona!
          </h2>
          <p className="text-sm text-emerald-800 max-w-md mx-auto">
            Wysłaliśmy dyskretny SMS z linkiem do zarządzania wizytą na numer <span className="font-mono font-semibold">{patientPhone}</span>.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setActiveBookingToken(bookingSuccessToken);
                onSelectVisitToken(bookingSuccessToken);
              }}
              className="px-5 py-2.5 rounded-xl bg-brand-blue text-white font-semibold text-sm hover:bg-brand-blue-dark transition-colors flex items-center gap-2"
            >
              <span>Przejdź do Ekranu 2 (Zarządzanie wizytą)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setBookingSuccessToken(null)}
              className="px-5 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-semibold text-sm hover:bg-emerald-100 transition-colors"
            >
              Nowa rezerwacja
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
