import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';

export const CoordinatorDrawer: React.FC = () => {
  const { coordinatorLogs, setView } = useBookingStore();

  const getBadgeColor = (action: string) => {
    switch (action) {
      case 'HOLD_CREATED': return 'bg-brand-cream text-amber-950 border-amber-300';
      case 'BOOKING_CONFIRMED': return 'bg-brand-green-light text-emerald-950 border-brand-green-border';
      case 'VISIT_CANCELLED': return 'bg-brand-error-light text-brand-error border-brand-error-border';
      case 'WAITLIST_OFFER_SENT': return 'bg-brand-cobalt-light text-brand-cobalt border-brand-cobalt-border';
      case 'WAITLIST_ACCEPTED': return 'bg-brand-green-light text-emerald-950 border-brand-green-border';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm flex justify-between items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cobalt-light text-brand-cobalt text-xs font-mono font-semibold mb-2 border border-brand-cobalt-border">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>REJESTR AUDYTOWY KOORDYNATORA</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-brand-text">
            Dziennik Zdarzeń (Append-Only Log)
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Zgodnie z regułami fundacji: tylko dopisywanie zdarzeń, bez możliwości edycji ani usuwania wpisów.
          </p>
        </div>

        <button
          onClick={() => setView('search')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-brand-text rounded-xl text-sm font-semibold transition-colors"
        >
          Zamknij
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-4 bg-brand-card border-b border-brand-border flex justify-between items-center text-xs font-mono font-bold text-brand-muted uppercase">
          <span>Ostatnie zdarzenia ({coordinatorLogs.length})</span>
          <span>Status audytu: SPÓJNY ✓</span>
        </div>

        <div className="divide-y divide-brand-border">
          {coordinatorLogs.map(log => (
            <div key={log.id} className="p-4 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${getBadgeColor(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="font-mono text-xs text-brand-muted">{log.timestamp}</span>
                  <span className="text-brand-muted">·</span>
                  <span className="text-xs text-brand-muted">Aktor: <strong>{log.actor}</strong></span>
                </div>
                <p className="text-brand-text font-medium">
                  {log.details}
                </p>
              </div>

              <div className="text-right font-mono text-xs text-brand-muted shrink-0">
                Slot: <span className="font-bold text-brand-text">{log.slotId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
