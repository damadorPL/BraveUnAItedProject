import React from 'react';
import { MessageSquare, ArrowUpRight, X, Wifi, Battery, Signal, Zap } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';

export const PhoneNotification: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { simulatedSmsList, setView, setRole, setActiveOfferToken, setActiveBookingToken } = useBookingStore();

  if (!isOpen) return null;

  const latestSms = simulatedSmsList[0];

  const handleSmsClick = (sms: typeof latestSms) => {
    if (!sms?.token) return;
    setRole('patient');
    if (sms.type === 'waitlist_offer') {
      setActiveOfferToken(sms.token);
      setView('waitlist_offer');
    } else {
      setActiveBookingToken(sms.token);
      setView('manage_visit');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-88 animate-slide-phone">
      
      {/* iPhone Device Frame */}
      <div className="bg-black rounded-[42px] p-3 shadow-phone border-4 border-gray-800 text-white overflow-hidden relative">
        
        {/* Dynamic Island / Camera Notch */}
        <div className="w-28 h-5 bg-black rounded-full mx-auto mb-2 flex items-center justify-between px-3 border border-gray-900">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
          <div className="w-2 h-2 rounded-full bg-blue-900" />
        </div>

        {/* Close Phone Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition-colors z-20"
          title="Schowaj telefon"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Status Bar */}
        <div className="flex justify-between items-center px-4 text-[11px] font-semibold text-gray-300 mb-6">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-4 h-4 fill-current text-brand-green" />
          </div>
        </div>

        {/* Lock Screen Clock */}
        <div className="text-center my-4 space-y-1">
          <div className="text-4xl font-extralight tracking-tight font-sans">
            09:41
          </div>
          <div className="text-xs text-gray-400 font-medium">
            Czwartek, 28 sierpnia
          </div>
        </div>

        {/* SMS Notifications Container */}
        <div className="space-y-2.5 my-6 min-h-[140px]">
          {latestSms ? (
            <div
              onClick={() => handleSmsClick(latestSms)}
              className={`p-3.5 rounded-2xl backdrop-blur-xl border cursor-pointer transition-all transform hover:scale-102 ${
                latestSms.type === 'waitlist_offer'
                  ? 'bg-gray-900/95 border-brand-green text-white shadow-2xl ring-2 ring-brand-green/60 animate-pulse-subtle'
                  : 'bg-gray-900/85 border-gray-700/60 text-gray-100'
              }`}
            >
              {/* Notification Header */}
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded-md flex items-center justify-center ${
                    latestSms.type === 'waitlist_offer' ? 'bg-brand-green text-white' : 'bg-brand-cobalt text-white'
                  }`}>
                    <MessageSquare className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-gray-200">WIADOMOŚCI</span>
                </div>
                <span className="text-brand-green font-mono font-bold">TERAZ</span>
              </div>

              {/* Discreet SMS Content */}
              <p className="text-xs font-medium text-gray-100 leading-snug">
                {latestSms.message}
              </p>

              {/* Interactive Callout Button inside SMS */}
              <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-brand-green font-bold bg-brand-green/10 px-2.5 py-1.5 rounded-xl">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Kliknij, aby przejąć termin</span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-gray-500 font-mono">
              Brak nowych powiadomień
            </div>
          )}
        </div>

        {/* Lock Screen Bottom Bar */}
        <div className="text-center text-[10px] text-gray-400 font-mono pt-2 border-t border-gray-800/80 flex items-center justify-center gap-1">
          <span>📱 Telefon pacjenta · Kaskada FIFO</span>
        </div>
        <div className="w-24 h-1 bg-gray-600 rounded-full mx-auto mt-2" />

      </div>

    </div>
  );
};
