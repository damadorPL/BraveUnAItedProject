import React from 'react';
import { HeartHandshake, ShieldCheck, Clock, FileText, Smartphone } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';

export const Header: React.FC<{ onOpenPhone: () => void; isPhoneOpen: boolean }> = ({ onOpenPhone, isPhoneOpen }) => {
  const { currentView, setView, activeHoldSlotId, holdSecondsLeft, coordinatorLogs, simulatedSmsList } = useBookingStore();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="bg-white border-b border-brand-border sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('search')}>
            <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-md">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-brand-text">
                  Fundacja Niepodzielni
                </span>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" /> 111 specjalistów
                </span>
              </div>
              <p className="text-xs text-brand-muted hidden sm:block">
                System Rezerwacji Wizyt · Bez konta · Dyskrecja · Zero barier
              </p>
            </div>
          </div>

          {/* Active Hold Countdown Banner (if holding) */}
          {activeHoldSlotId && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium animate-pulse-subtle">
              <Clock className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Blokada terminu:</span>
              <span className="font-mono font-bold text-brand-red text-base">{formatTime(holdSecondsLeft)}</span>
            </div>
          )}

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setView('search')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'search' 
                  ? 'bg-brand-blue-light text-brand-blue font-semibold' 
                  : 'text-brand-muted hover:text-brand-text hover:bg-gray-100'
              }`}
            >
              Wyszukiwarka
            </button>

            <button
              onClick={() => setView('manage_visit')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                currentView === 'manage_visit' 
                  ? 'bg-brand-blue-light text-brand-blue font-semibold' 
                  : 'text-brand-muted hover:text-brand-text hover:bg-gray-100'
              }`}
            >
              Zarządzaj wizytą
            </button>

            <button
              onClick={onOpenPhone}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isPhoneOpen 
                  ? 'bg-brand-red text-white shadow-sm' 
                  : 'bg-gray-100 hover:bg-gray-200 text-brand-text'
              }`}
              title="Pokaż symulator telefonu pacjenta"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">Telefon SMS</span>
              {simulatedSmsList.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
              )}
            </button>

            <button
              onClick={() => setView('coordinator_log')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'coordinator_log' 
                  ? 'bg-brand-blue-light text-brand-blue font-semibold' 
                  : 'text-brand-muted hover:text-brand-text hover:bg-gray-100'
              }`}
              title="Dziennik audytowy koordynatora"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">Dziennik ({coordinatorLogs.length})</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
