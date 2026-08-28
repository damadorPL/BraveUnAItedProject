import React, { useState } from 'react';
import { Zap, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import confetti from 'canvas-confetti';

export const WaitlistOffer: React.FC<{ token: string; onAccepted: () => void }> = ({ token, onAccepted }) => {
  const { slots, specialists, acceptWaitlistOffer, setView } = useBookingStore();

  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  const slot = slots.find(s => s.offer?.token === token && s.status === 'offered')
    || slots.find(s => s.status === 'offered'); // fallback for demo

  const specialist = specialists.find(s => s.id === slot?.specialistId);

  const handleAccept = () => {
    if (!slot?.offer?.token) return;
    const ok = acceptWaitlistOffer(slot.offer.token, 'BLIK');
    if (ok) {
      setAcceptedSuccess(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      onAccepted();
    }
  };

  if (!slot || !slot.offer) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-brand-border text-center space-y-4">
        <h2 className="text-xl font-bold text-brand-text">Oferta wygasła lub została już wykorzystana</h2>
        <p className="text-sm text-brand-muted">Ten termin został już przypisany lub powrócił do puli ogólnej.</p>
        <button
          onClick={() => setView('search')}
          className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-semibold"
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
          <span>PROPOZYCJA Z LISTY REZERWOWEJ</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight">
          Zwolniony termin dla Ciebie!
        </h1>
        <p className="text-white/90 text-sm">
          Jesteś na 1. miejscu listy rezerwowej. Inny pacjent odwołał wizytę — termin został tymczasowo zarezerwowany dla Ciebie.
        </p>
      </div>

      {acceptedSuccess ? (
        <div className="bg-brand-green-light border-2 border-brand-green rounded-3xl p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-brand-green text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-emerald-950">
            Termin pomyślnie zarezerwowany!
          </h2>
          <p className="text-sm text-emerald-900">
            Żaden termin się nie zmarnował. Potwierdzenie wysłano SMS-em na Twój numer telefonu.
          </p>
          <button
            onClick={() => setView('manage_visit')}
            className="px-6 py-3 bg-brand-cobalt text-white font-bold rounded-xl text-sm hover:bg-brand-cobalt-dark transition-colors shadow-sm"
          >
            Przejdź do szczegółów wizyty
          </button>
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
              <span className="inline-block mt-2 text-xs font-mono px-2.5 py-0.5 rounded-full bg-brand-cobalt-light text-brand-cobalt border border-brand-cobalt-border font-semibold">
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
              <span className="text-xs font-mono text-brand-muted uppercase block mb-1">Cena wizyty</span>
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

          <p className="text-[11px] text-center text-brand-muted">
            W przypadku braku potwierdzenia w ciągu 15 minut termin zostanie przekazany kolejnej osobie z listy.
          </p>

        </div>
      )}

    </div>
  );
};
