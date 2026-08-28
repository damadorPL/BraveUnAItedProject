import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, ShieldCheck, PhoneCall, XCircle, UserCheck } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';

export const VisitManagement: React.FC<{ onVisitCancelled: () => void }> = ({ onVisitCancelled }) => {
  const { slots, specialists, activeBookingToken, cancelBooking, demoModeHoursBeforeVisit, setDemoModeHours, setView } = useBookingStore();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Find slot corresponding to active token
  const bookedSlot = slots.find(s => s.bookedBy?.bookingToken === activeBookingToken && s.status === 'booked') 
    || slots.find(s => s.id === 'slot_102'); // fallback for demo

  const specialist = specialists.find(s => s.id === bookedSlot?.specialistId);

  const isMoreThan24h = demoModeHoursBeforeVisit >= 24;

  const handleCancelClick = () => {
    if (!bookedSlot) return;
    const result = cancelBooking(bookedSlot.id);
    if (result.success) {
      setNotification({
        type: 'success',
        message: result.message
      });
      onVisitCancelled();
    } else {
      setNotification({
        type: 'error',
        message: result.message
      });
    }
  };

  if (!bookedSlot) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-brand-border text-center space-y-4">
        <h2 className="text-xl font-bold text-brand-text">Brak aktywnej wizyty</h2>
        <p className="text-sm text-brand-muted">Zarezerwuj termin w wyszukiwarce lub wybierz z listy demonstracyjnej.</p>
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
    <div className="space-y-6">
      
      {/* Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cobalt-light text-brand-cobalt text-xs font-mono font-semibold mb-2 border border-brand-cobalt-border">
              <span>EKRAN 2 / 3 · ZARZĄDZANIE Z LINKU SMS</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-brand-text">
              Twoja wizyta psychologiczna
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-1 font-mono">
              Token bezpiecznego dostępu: <span className="font-semibold text-brand-cobalt">{bookedSlot.bookedBy?.bookingToken || 'token_nowak_2908'}</span>
            </p>
          </div>

          {/* DEMO MODE TOGGLE (>24h vs <24h) */}
          <div className="bg-brand-bg p-3 rounded-2xl border border-brand-border text-xs space-y-2">
            <span className="font-mono font-bold text-brand-muted uppercase block">
              Przełącznik demonstracyjny (Reguła 24h):
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setDemoModeHours(72)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  isMoreThan24h
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Stan A: Wizyta za 3 dni (&gt;24h)
              </button>
              <button
                onClick={() => setDemoModeHours(4)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  !isMoreThan24h
                    ? 'bg-brand-error text-white shadow-sm'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Stan B: Wizyta za 4h (&lt;24h)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast if cancelled */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-sm font-medium flex items-start gap-3 ${
          notification.type === 'success'
            ? 'bg-brand-green-light border-brand-green text-emerald-950'
            : 'bg-brand-error-light border-brand-error text-brand-error'
        }`}>
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{notification.message}</div>
        </div>
      )}

      {/* Visit Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Details */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-brand-border space-y-6 shadow-sm">
          <div className="flex items-start gap-4 pb-6 border-b border-brand-border">
            <img
              src={specialist?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
              alt={bookedSlot.specialistName}
              className="w-16 h-16 rounded-2xl object-cover border border-brand-border"
            />
            <div>
              <h2 className="font-display font-bold text-lg text-brand-text">
                {bookedSlot.specialistName}
              </h2>
              <p className="text-xs text-brand-muted">{bookedSlot.specialistRole}</p>
              <p className="text-xs text-brand-muted mt-1">{specialist?.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-bg p-4 rounded-2xl border border-brand-border">
              <span className="text-xs font-mono text-brand-muted uppercase block mb-1">Data i godzina</span>
              <div className="flex items-center gap-2 text-brand-text font-bold text-base">
                <Calendar className="w-4 h-4 text-brand-cobalt" />
                <span>{bookedSlot.date}</span>
                <span>·</span>
                <Clock className="w-4 h-4 text-brand-cobalt" />
                <span>{bookedSlot.time}</span>
              </div>
            </div>

            <div className="bg-brand-bg p-4 rounded-2xl border border-brand-border">
              <span className="text-xs font-mono text-brand-muted uppercase block mb-1">Status rezerwacji</span>
              <div className="flex items-center gap-1.5 text-brand-green-dark font-bold text-sm">
                <UserCheck className="w-4 h-4 text-brand-green" />
                <span>Potwierdzona ({bookedSlot.price} zł)</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-brand-muted space-y-1">
            <p><strong>Pacjent:</strong> {bookedSlot.bookedBy?.patientName}</p>
            <p><strong>Telefon:</strong> {bookedSlot.bookedBy?.patientPhone}</p>
            <p><strong>Płatność:</strong> {bookedSlot.bookedBy?.paymentMethod} (Fundacja Niepodzielni)</p>
          </div>
        </div>

        {/* Right Col: Cancellation or Contact Actions (Reguła 24h) */}
        <div className="bg-white rounded-3xl p-6 border border-brand-border flex flex-col justify-between space-y-4 shadow-sm">
          
          <div>
            <h3 className="font-display font-bold text-base text-brand-text mb-2">
              Zarządzanie terminem
            </h3>

            {isMoreThan24h ? (
              <div className="space-y-3">
                <div className="bg-brand-green-light border border-brand-green-border p-3.5 rounded-2xl text-xs text-emerald-950 leading-relaxed">
                  <p className="font-semibold mb-1">Bezpłatne odwołanie aktywne</p>
                  Do wizyty zostało <strong>{demoModeHoursBeforeVisit} godzin</strong> (&gt;24h). Możesz odwołać wizytę jednym kliknięciem i otrzymać pełny zwrot kwoty <strong>{bookedSlot.price} zł</strong>.
                </div>

                <button
                  onClick={handleCancelClick}
                  className="w-full py-3 px-4 rounded-xl bg-brand-error hover:bg-brand-error/90 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Odwołaj wizytę ({bookedSlot.price} zł zwrotu)</span>
                </button>
                <p className="text-[11px] text-brand-muted text-center">
                  Zwolniony termin natychmiast trafi do pierwszej osoby z listy rezerwowej.
                </p>
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                <div className="bg-brand-cream border border-amber-300 p-3.5 rounded-2xl text-xs text-amber-950 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Mniej niż 24h do wizyty ({demoModeHoursBeforeVisit}h)</span>
                  </div>
                  Zgodnie z regulaminem fundacji przycisk odwołania online został ukryty, aby chronić czas dyżurującego specjalisty.
                </div>

                <div className="p-4 bg-brand-bg rounded-2xl border border-brand-border space-y-2">
                  <span className="text-xs text-brand-muted font-semibold block">Bezpośredni kontakt do specjalisty:</span>
                  <div className="flex items-center gap-2 font-mono font-bold text-sm text-brand-cobalt">
                    <PhoneCall className="w-4 h-4 text-brand-cobalt" />
                    <span>{specialist?.phone || '+48 22 123 45 67'}</span>
                  </div>
                  <p className="text-[11px] text-brand-muted">
                    Prosimy o pilny kontakt telefoniczny w razie nagłej niemożności uczestnictwa.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-brand-border pt-3">
            <span className="text-[11px] text-brand-muted block text-center">
              Maksymalnie 2 przełożenia terminu na wizytę
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
