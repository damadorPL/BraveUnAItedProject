import React from 'react';
import { HeartHandshake, ShieldCheck, Clock, FileText, Smartphone, Mail, User, Stethoscope, Briefcase } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { UserRole } from '../types';

export const Header: React.FC<{ 
  onOpenPhone: () => void; 
  isPhoneOpen: boolean;
  onOpenEmail: () => void;
}> = ({ onOpenPhone, isPhoneOpen, onOpenEmail }) => {
  const { 
    currentRole, 
    setRole, 
    currentView, 
    setView, 
    activeHoldSlotId, 
    holdSecondsLeft, 
    coordinatorLogs, 
    simulatedSmsList, 
    simulatedEmails 
  } = useBookingStore();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const unreadEmailsCount = simulatedEmails.filter(e => !e.read).length;

  return (
    <header className="bg-white border-b border-brand-border sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setRole('patient')}>
            <div className="w-10 h-10 rounded-xl bg-brand-cobalt flex items-center justify-center text-white shadow-md">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-brand-cobalt">
                  niepodzielni
                </span>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-green-light text-brand-green-dark border border-brand-green-border">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-green" /> 111 specjalistów
                </span>
              </div>
              <p className="text-xs text-brand-muted hidden sm:block">
                Fundacja Niepodzielni · System Rezerwacji Wizyt
              </p>
            </div>
          </div>

          {/* Active Hold Countdown Banner (if holding) */}
          {activeHoldSlotId && currentRole === 'patient' && (
            <div className="flex items-center gap-2 bg-brand-cream border border-amber-300 text-amber-950 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium animate-pulse-subtle shadow-sm">
              <Clock className="w-4 h-4 text-amber-700 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Blokada terminu:</span>
              <span className="font-mono font-bold text-brand-error text-base">{formatTime(holdSecondsLeft)}</span>
            </div>
          )}

          {/* Role Switcher in Header */}
          <div className="flex items-center bg-brand-bg p-1 rounded-2xl border border-brand-border shadow-inner">
            <button
              onClick={() => setRole('patient')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentRole === 'patient'
                  ? 'bg-brand-cobalt text-white shadow-sm'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Pacjent</span>
            </button>

            <button
              onClick={() => setRole('specialist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentRole === 'specialist'
                  ? 'bg-brand-cobalt text-white shadow-sm'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Specjalista</span>
            </button>

            <button
              onClick={() => setRole('coordinator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentRole === 'coordinator'
                  ? 'bg-brand-cobalt text-white shadow-sm'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Koordynator</span>
            </button>
          </div>

          {/* Notification Launchers (SMS & Email) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPhone}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all relative ${
                isPhoneOpen 
                  ? 'bg-brand-green text-white shadow-sm font-semibold' 
                  : 'bg-gray-100 hover:bg-gray-200 text-brand-text'
              }`}
              title="Pokaż symulator telefonu pacjenta (SMS)"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">SMS</span>
              {simulatedSmsList.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-brand-green animate-ping" />
              )}
            </button>

            <button
              onClick={onOpenEmail}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-gray-100 hover:bg-gray-200 text-brand-text transition-all relative"
              title="Pokaż symulator poczty e-mail"
            >
              <Mail className="w-4 h-4 text-brand-cobalt" />
              <span className="hidden md:inline">E-mail</span>
              {unreadEmailsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand-cobalt text-white font-mono font-bold">
                  {unreadEmailsCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
