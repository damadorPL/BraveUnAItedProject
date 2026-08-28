import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, User, Phone, Mail, Zap, ArrowRight, X, Filter } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { CONSULTATION_TYPES } from '../data/mockData';
import { ConsultationType } from '../types';
import confetti from 'canvas-confetti';

export const SearchAndBooking: React.FC<{ onSelectVisitToken: (token: string) => void }> = ({ onSelectVisitToken }) => {
  const { slots, specialists, activeHoldSlotId, holdSecondsLeft, startHold, tickHoldTimer, cancelHold, confirmBooking, setActiveBookingToken } = useBookingStore();

  const [selectedType, setSelectedType] = useState<ConsultationType | 'all'>('low_cost');
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [bookingModalSlotId, setBookingModalSlotId] = useState<string | null>(null);

  const [patientName, setPatientName] = useState('Anna Kowalska');
  const [patientPhone, setPatientPhone] = useState('+48 501 234 567');
  const [patientEmail, setPatientEmail] = useState('anna.kowalska@gmail.com');
  const [bookingSuccessToken, setBookingSuccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (!activeHoldSlotId) return;
    const interval = setInterval(() => {
      tickHoldTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [activeHoldSlotId, tickHoldTimer]);

  const uniqueDates = [...new Set(slots.map(s => s.date))].sort();

  const filteredSlots = slots.filter(slot => {
    if (selectedType !== 'all' && slot.type !== selectedType) return false;
    if (selectedSpecialistId !== 'all' && slot.specialistId !== selectedSpecialistId) return false;
    if (selectedDateFilter !== 'all' && slot.date !== selectedDateFilter) return false;
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
    const token = confirmBooking(bookingModalSlotId, patientName, patientPhone, patientEmail, 'BLIK');
    if (token) {
      setBookingSuccessToken(token);
      setBookingModalSlotId(null);
      confetti({
        particleCount: 90,
        spread: 70,
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
      <div className="bg-gradient-to-r from-[#1500bb] to-[#0f008c] text-white rounded-3xl p-6 sm:p-8 shadow-brand">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-mono font-medium mb-3 backdrop-blur-sm">
            <span>EKRAN 1 / 3 · SZYBKA REZERWACJA</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Znajdź pomoc psychologiczną bez barier
          </h1>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            Rezerwacja w 60 sekund. Wybierz termin, a my natychmiast zablokujemy go dla Ciebie na 10 minut. 
            Bez konieczności logowania, powiadomienia SMS i E-mail, dyskretne linki do zarządzania.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-sm space-y-4">
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
                  className={`flex flex-col p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-brand-cobalt bg-brand-cobalt-light ring-2 ring-brand-cobalt shadow-sm'
                      : 'border-brand-border bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-semibold text-xs sm:text-sm text-brand-text line-clamp-1">{ct.label}</span>
                    <span className="font-mono font-bold text-brand-cobalt text-sm whitespace-nowrap">
                      {ct.price === 0 ? 'Bezpłatnie' : `${ct.price} zł`}
                    </span>
                  </div>
                  {ct.limitRule && (
                    <span className="text-[11px] text-emerald-800 font-medium mt-1 line-clamp-1">
                      {ct.limitRule}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-border/60">
          <span className="text-xs font-mono text-brand-muted uppercase font-semibold">Dzień:</span>
          <button
            onClick={() => setSelectedDateFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              selectedDateFilter === 'all'
                ? 'bg-brand-text text-white font-semibold'
                : 'bg-gray-100 hover:bg-gray-200 text-brand-muted'
            }`}
          >
            Wszystkie dni
          </button>
          {uniqueDates.map(date => (
            <button
              key={date}
              onClick={() => setSelectedDateFilter(date)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-colors ${
                selectedDateFilter === date
                  ? 'bg-brand-cobalt text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-brand-muted'
              }`}
            >
              {date}
            </button>
          ))}
        </div>

        {/* Specialist Selector */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-border/60">
          <span className="text-xs font-mono text-brand-muted uppercase font-semibold">Specjalista:</span>
          <button
            onClick={() => setSelectedSpecialistId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              selectedSpecialistId === 'all'
                ? 'bg-brand-text text-white font-semibold'
                : 'bg-gray-100 hover:bg-gray-200 text-brand-muted'
            }`}
          >
            Wszyscy (111)
          </button>
          {specialists.map(sp => (
            <button
              key={sp.id}
              onClick={() => setSelectedSpecialistId(sp.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                selectedSpecialistId === sp.id
                  ? 'bg-brand-cobalt text-white font-semibold shadow-sm'
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
            <Calendar className="w-5 h-5 text-brand-cobalt" />
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
                className={`bg-white rounded-3xl border p-5 transition-all flex flex-col justify-between ${
                  isHeld
                    ? 'border-amber-300 bg-amber-50/50 shadow-sm'
                    : isBooked
                    ? 'border-gray-200 bg-gray-50/70 opacity-70'
                    : isOffered
                    ? 'border-purple-300 bg-purple-50/40'
                    : 'border-brand-border hover:border-brand-cobalt/50 hover:shadow-md'
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
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${typeConfig.badgeColor}`}>
                      {typeConfig.label}
                    </span>
                    <span className="font-mono font-bold text-base text-brand-text">
                      {slot.price === 0 ? 'Bezpłatnie' : `${slot.price} zł`}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-2 bg-brand-bg p-2.5 rounded-2xl border border-brand-border text-sm font-medium mb-4">
                    <Calendar className="w-4 h-4 text-brand-cobalt" />
                    <span>{slot.date}</span>
                    <span className="text-brand-muted">·</span>
                    <Clock className="w-4 h-4 text-brand-cobalt" />
                    <span className="font-mono font-bold">{slot.time}</span>
                  </div>
                </div>

                {/* Bottom Action Button / Status */}
                <div>
                  {isFree && (
                    <button
                      onClick={() => handleSelectSlot(slot.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-brand-cobalt hover:bg-brand-cobalt-dark text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                    >
                      <span>Wybierz termin</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {isHeld && (
                    <div className="bg-brand-cream text-amber-950 border border-amber-300 p-2.5 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5">
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

      {/* Booking Modal (with 10-min hold timer, email input & 1-click BLIK) */}
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
            <div className="bg-brand-cream border border-amber-300 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                <Clock className="w-5 h-5 text-amber-800" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-mono font-bold uppercase text-amber-950">
                    Termin zablokowany dla Ciebie
                  </span>
                  <span className="font-mono font-extrabold text-brand-error text-base">
                    {formatCountdown(holdSecondsLeft)}
                  </span>
                </div>
                <p className="text-xs text-amber-900 mt-0.5">
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

            {/* Simple Form (With Email & Phone, No password needed) */}
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
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-cobalt outline-none"
                    placeholder="np. Anna Kowalska"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Numer telefonu do dyskretnego SMS
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={e => setPatientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-cobalt outline-none font-mono"
                    placeholder="+48 501 234 567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Adres e-mail do potwierdzenia i linku
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={e => setPatientEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-cobalt outline-none"
                    placeholder="anna.kowalska@gmail.com"
                  />
                </div>
              </div>
            </div>

            {/* Total & 1-Click BLIK Payment */}
            <div className="border-t border-brand-border pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-muted">Do zapłaty:</span>
                <span className="font-mono font-bold text-2xl text-brand-cobalt">
                  {activeSlot.price === 0 ? '0 zł' : `${activeSlot.price} zł`}
                </span>
              </div>

              <button
                onClick={handlePayBlik}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white font-bold text-base transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>Zapłać BLIK-iem (1 kliknięcie)</span>
              </button>

              <p className="text-[11px] text-center text-brand-muted">
                Dyskretne potwierdzenie SMS i E-mail zostanie natychmiast wysłane.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Booking Success View */}
      {bookingSuccessToken && (
        <div className="bg-brand-green-light border-2 border-brand-green rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm animate-fade-in">
          <div className="w-14 h-14 bg-brand-green text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-emerald-950">
            Rezerwacja potwierdzona!
          </h2>
          <p className="text-sm text-emerald-900 max-w-md mx-auto">
            Wysłaliśmy dyskretne powiadomienie SMS na numer <span className="font-mono font-semibold">{patientPhone}</span> oraz e-mail na <span className="font-semibold">{patientEmail}</span>.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setActiveBookingToken(bookingSuccessToken);
                onSelectVisitToken(bookingSuccessToken);
              }}
              className="px-5 py-2.5 rounded-xl bg-brand-cobalt text-white font-semibold text-sm hover:bg-brand-cobalt-dark transition-colors flex items-center gap-2 shadow-sm"
            >
              <span>Przejdź do Ekranu 2 (Zarządzanie wizytą)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setBookingSuccessToken(null)}
              className="px-5 py-2.5 rounded-xl bg-white border border-brand-green-border text-emerald-900 font-semibold text-sm hover:bg-emerald-50 transition-colors"
            >
              Nowa rezerwacja
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
