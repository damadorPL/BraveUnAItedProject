import React from 'react';
import { Mail, ArrowUpRight, X, Inbox, CheckCircle2, User, Clock } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';

export const EmailNotification: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { simulatedEmails, setView, setActiveOfferToken, setActiveBookingToken, markEmailRead } = useBookingStore();

  if (!isOpen) return null;

  const handleOpenLink = (token?: string, type?: string, emailId?: string) => {
    if (emailId) markEmailRead(emailId);
    if (!token) return;
    if (type === 'waitlist_offer') {
      setActiveOfferToken(token);
      setView('waitlist_offer');
    } else {
      setActiveBookingToken(token);
      setView('manage_visit');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-brand-border shadow-2xl space-y-6 relative max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-cobalt-light text-brand-cobalt flex items-center justify-center border border-brand-cobalt-border">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-brand-text">
                Poczta E-mail Pacjenta (Symulator)
              </h2>
              <p className="text-xs text-brand-muted">
                Powiadomienia i bezpośrednie linki do zarządzania wizytą bez logowania
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-brand-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {simulatedEmails.length === 0 ? (
            <div className="text-center py-12 text-brand-muted space-y-2">
              <Inbox className="w-12 h-12 mx-auto text-gray-300" />
              <p className="text-sm font-medium">Brak odebranych wiadomości e-mail</p>
              <p className="text-xs">Zarezerwuj wizytę lub odwołaj termin, aby otrzymać powiadomienie.</p>
            </div>
          ) : (
            simulatedEmails.map(email => (
              <div
                key={email.id}
                className="bg-brand-bg rounded-2xl p-5 border border-brand-border space-y-3 hover:border-brand-cobalt/40 transition-all shadow-sm"
              >
                {/* Email Meta */}
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-brand-cobalt block font-mono">
                      Od: powiadomienia@niepodzielni.com
                    </span>
                    <span className="text-xs text-brand-muted">
                      Do: <strong>{email.to}</strong> · {email.timestamp}
                    </span>
                  </div>

                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    email.type === 'waitlist_offer'
                      ? 'bg-brand-green-light text-emerald-900 border-brand-green-border'
                      : email.type === 'cancellation'
                      ? 'bg-brand-error-light text-brand-error border-brand-error-border'
                      : 'bg-brand-cobalt-light text-brand-cobalt border-brand-cobalt-border'
                  }`}>
                    {email.type === 'waitlist_offer' ? 'Oferta z kolejki' : email.type === 'cancellation' ? 'Odwołanie' : 'Potwierdzenie'}
                  </span>
                </div>

                {/* Subject */}
                <h3 className="font-display font-bold text-base text-brand-text">
                  {email.subject}
                </h3>

                {/* Content Box */}
                <div className="bg-white p-4 rounded-xl border border-brand-border text-xs sm:text-sm text-brand-text whitespace-pre-line leading-relaxed font-sans">
                  {email.content}
                </div>

                {/* Action Link inside Email */}
                {email.token && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleOpenLink(email.token, email.type, email.id)}
                      className="px-4 py-2.5 rounded-xl bg-brand-cobalt hover:bg-brand-cobalt-dark text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <span>
                        {email.type === 'waitlist_offer' ? 'Przejdź do potwierdzenia oferty' : 'Zarządzaj swoją wizytą'}
                      </span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-brand-border flex justify-between items-center text-xs text-brand-muted">
          <span>Wiadomości generowane w oparciu o szablony HTML Fundacji Niepodzielni</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-brand-text rounded-xl font-semibold transition-colors"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
