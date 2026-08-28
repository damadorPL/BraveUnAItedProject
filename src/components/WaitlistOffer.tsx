import React, { useState } from 'react';
import { Zap, CheckCircle2, Clock, Calendar, ArrowRight, UserCheck, ShieldCheck, HeartHandshake, User } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import confetti from 'canvas-confetti';

export const WaitlistOffer: React.FC<{ token: string; onAccepted: () => void }> = ({ token, onAccepted }) => {
  const { slots, specialists, acceptWaitlistOffer, setView, setRole } = useBookingStore();

  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  // Look up slot by token or fallback to any offered slot
  const slot = slots.find(s => s.offer?.token === token && s.status === 'offered')
    || slots.find(s => s.status === 'offered');

  const specialist = specialists.find(s => s.id === slot?.specialistId);

  const handleAccept = () => {
    const offerTok = slot?.offer?.token || token;
    const ok = acceptWaitlistOffer(offerTok, 'BLIK');
    if (ok) {
      setAcceptedSuccess(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      onAccepted();
    }
  };

  if (!slot || !slot.offer) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-brand-border text-center space-y-4 shadow-sm max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-brand-text">Oferta wygasła lub została już wykorzystana</h2>
        <p className="text-sm text-brand-muted">Ten termin został już przypisany lub powrócił do puli ogólnej.</p>
        <button
          onClick={() => {
            setRole('patient');
            setView('search');
          }}
          className="px-5 py-2.5 bg-brand-cobalt text-white rounded-xl text-sm font-semibold hover:bg-brand-cobalt-dark transition-colors"
        >
          Wróć do wyszukiwarki
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      
      {/* Alert Banner */}
      <div className="bg-gradient-to-r from-[#1500bb] to-[#0f008c] text-white rounded-3xl p-6 sm:p-8 shadow-brand space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-mono font-bold">
          <Zap className="w-3.5 h-3.5 fill-current text-brand-green" />
          <span>PROPOZYCJA Z LISTY REZERWOWEJ · MOMENT WOW</span>
        </div>
        <h1 className="font-display text-2xl sm:text-4xl font-black tracking-tight">
          Zwolniony termin dla Ciebie!
        </h1>
        <p className="text-white/90 text-sm sm:text-base">
          Inny pacjent odwołał wizytę — system automatycznie zablokował ten termin dla Ciebie jako pierwszej osoby w kolejce FIFO.
        </p>
      </div>

      {acceptedSuccess ? (
        <div className="bg-brand-green-light border-2 border-brand-green rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-brand-green text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-950">
              Termin pomyślnie zarezerwowany!
            </h2>
            <p className="text-sm text-emerald-900 max-w-md mx-auto">
              Żaden termin się nie zmarnował. Wizyta u specjalisty <strong>{slot.specialistName}</strong> została potwierdzona.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setRole('patient');
                setView('manage_visit');
              }}
              className="px-6 py-3 bg-brand-cobalt text-white font-bold rounded-xl text-sm hover:bg-brand-cobalt-dark transition-colors shadow-sm flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Zobacz szczegóły swojej wizyty</span>
            </button>
            <button
              onClick={() => {
                setRole('coordinator');
                setView('coordinator_dashboard');
              }}
              className="px-6 py-3 bg-white border border-brand-green text-emerald-950 font-bold rounded-xl text-sm hover:bg-emerald-50 transition-colors"
            >
              <span>Sprawdź rejestr koordynatora</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border space-y-6 shadow-sm">
          
          <div className="flex items-start gap-4 pb-6 border-b border-brand-border">
            <img
              src={specialist?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
              alt={slot.specialistName}
              className="w-16 h-16 rounded-2xl object-cover border border-brand-border"
            />
            <div>
              <h3 className="font-display font-bold text-lg text-brand-text">
                {slot.specialistName}
              </h3>
              <p className="text-xs text-brand-muted">{slot.specialistRole}</p>
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-mono px-3 py-1 rounded-full bg-brand-green-light text-emerald-950 border border-brand-green-border font-bold">
                <User className="w-3 h-3 text-brand-green" />
                Dla: {slot.offer.offeredToName} ({slot.offer.offeredToPhone})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-bg p-4 rounded-2xl border border-brand-border">
              <span className="text-xs font-mono text-brand-muted uppercase block mb-1">Zwolniony Termin</span>
              <div className="flex items-center gap-2 text-brand-text font-bold text-sm sm:text-base">
                <Calendar className="w-4 h-4 text-brand-cobalt" />
                <span>{slot.date}</span>
                <span>·</span>
                <Clock className="w-4 h-4 text-brand-cobalt" />
                <span>{slot.time}</span>
              </div>
            </div>

            <div className="bg-brand-bg p-4 rounded-2xl border border-brand-border">
              <span className="text-xs font-mono text-brand-muted uppercase block mb-1">Cena konsultacji</span>
              <span className="font-mono font-bold text-xl text-brand-cobalt">
                {slot.price} zł
              </span>
            </div>
          </div>

          <button
            onClick={handleAccept}
            className="w-full py-4 px-6 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white font-bold text-base transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Potwierdzam i płacę BLIK-iem ({slot.price} zł)</span>
          </button>

          <p className="text-[11px] text-center text-brand-muted font-medium">
            ⏱ Masz 15 minut na potwierdzenie. W przypadku braku reakcji termin trafi do kolejnej osoby.
          </p>

        </div>
      )}

    </div>
  );
};
