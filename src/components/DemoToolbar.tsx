import React from 'react';
import { RotateCcw, Smartphone, Zap } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';

export const DemoToolbar: React.FC<{ onTogglePhone: () => void; isPhoneOpen: boolean }> = ({ onTogglePhone, isPhoneOpen }) => {
  const { setView, resetDemoData, setDemoModeHours, slots, cancelBooking } = useBookingStore();

  const handleTriggerQuickWow = () => {
    // 1. Zapewniamy, że slot_102 jest zarezerwowany
    const bookedSlot = slots.find(s => s.id === 'slot_102');
    if (bookedSlot && bookedSlot.status === 'booked') {
      setDemoModeHours(72); // >24h
      cancelBooking('slot_102'); // Odwołaj -> Kaskada FIFO
      setView('waitlist_offer');
    }
  };

  return (
    <aside aria-label="Pasek demonstracyjny" className="fixed bottom-0 inset-x-0 bg-brand-dark/95 text-white backdrop-blur-md border-t border-gray-800 z-40 py-2 px-4 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Pitch steps shortcut */}
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-brand-yellow uppercase tracking-wider hidden sm:inline">
            PITCH 60s:
          </span>
          <button
            onClick={() => setView('search')}
            className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
          >
            1. Rezerwacja
          </button>
          <button
            onClick={() => {
              setDemoModeHours(72);
              setView('manage_visit');
            }}
            className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
          >
            2. Odwołanie (&gt;24h)
          </button>
          <button
            onClick={() => {
              setDemoModeHours(4);
              setView('manage_visit');
            }}
            className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
          >
            2b. Blokada (&lt;24h)
          </button>
          <button
            onClick={handleTriggerQuickWow}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-white transition-all flex items-center gap-1 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>3. Moment WOW (Kaskada)</span>
          </button>
        </div>

        {/* Right: Reset & Phone toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePhone}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              isPhoneOpen ? 'bg-brand-red text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isPhoneOpen ? 'Schowaj telefon' : 'Pokaż telefon'}</span>
          </button>

          <button
            onClick={resetDemoData}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex items-center gap-1 font-mono"
            title="Zresetuj wszystkie dane do stanu początkowego"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>

      </div>
    </aside>
  );
};
