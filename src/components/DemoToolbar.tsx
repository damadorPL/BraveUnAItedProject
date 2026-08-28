import React from 'react';
import { RotateCcw, Smartphone, Zap, Mail } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';

export const DemoToolbar: React.FC<{ 
  onTogglePhone: () => void; 
  isPhoneOpen: boolean;
  onOpenEmail: () => void;
}> = ({ onTogglePhone, isPhoneOpen, onOpenEmail }) => {
  const { setRole, currentRole, setView, resetDemoData, setDemoModeHours, triggerWowCascade } = useBookingStore();

  const handleTriggerQuickWow = () => {
    // Open phone simulator if closed
    if (!isPhoneOpen) {
      onTogglePhone();
    }
    // Trigger the complete WOW cascade
    triggerWowCascade();
  };

  return (
    <aside aria-label="Pasek demonstracyjny" className="fixed bottom-0 inset-x-0 bg-brand-text text-white backdrop-blur-md border-t border-gray-800 z-40 py-2.5 px-4 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Pitch steps shortcut */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-brand-green uppercase tracking-wider hidden sm:inline">
            SCENARIUSZ DEMO:
          </span>
          <button
            onClick={() => {
              setRole('patient');
              setView('search');
            }}
            className={`px-2.5 py-1.5 rounded-lg transition-colors ${
              currentRole === 'patient' ? 'bg-brand-cobalt text-white font-bold' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            1. Rezerwacja
          </button>
          <button
            onClick={() => {
              setRole('patient');
              setDemoModeHours(72);
              setView('manage_visit');
            }}
            className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            2. Odwołanie (&gt;24h)
          </button>
          <button
            onClick={() => {
              setRole('specialist');
              setView('specialist_dashboard');
            }}
            className={`px-2.5 py-1.5 rounded-lg transition-colors ${
              currentRole === 'specialist' ? 'bg-brand-cobalt text-white font-bold' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            3. Specjalista
          </button>
          <button
            onClick={() => {
              setRole('coordinator');
              setView('coordinator_dashboard');
            }}
            className={`px-2.5 py-1.5 rounded-lg transition-colors ${
              currentRole === 'coordinator' ? 'bg-brand-cobalt text-white font-bold' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            4. Koordynator
          </button>
          
          {/* THE MOMENT WOW BUTTON */}
          <button
            onClick={handleTriggerQuickWow}
            className="px-3.5 py-1.5 rounded-xl bg-brand-green hover:bg-brand-green-dark font-black text-white transition-all flex items-center gap-1.5 shadow-lg active:scale-95 ring-2 ring-brand-green/40"
            title="Kliknij, aby odwołać wizytę i odpalić natychmiastową kaskadę SMS na telefonie!"
          >
            <Zap className="w-4 h-4 fill-current animate-bounce" />
            <span>⚡ ODPAL MOMENT WOW (Kaskada)</span>
          </button>
        </div>

        {/* Right: Launchers & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEmail}
            className="px-2.5 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 font-semibold flex items-center gap-1 transition-all"
          >
            <Mail className="w-3.5 h-3.5 text-brand-cobalt" />
            <span>Poczta E-mail</span>
          </button>

          <button
            onClick={onTogglePhone}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
              isPhoneOpen ? 'bg-brand-green text-white font-bold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isPhoneOpen ? 'Schowaj SMS' : 'Pokaż SMS'}</span>
          </button>

          <button
            onClick={resetDemoData}
            className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex items-center gap-1 font-mono"
            title="Zresetuj wszystkie dane do stanu początkowego"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

      </div>
    </aside>
  );
};
