import { Header } from './components/Header';
import { SearchAndBooking } from './components/SearchAndBooking';
import { VisitManagement } from './components/VisitManagement';
import { WaitlistOffer } from './components/WaitlistOffer';
import { PhoneNotification } from './components/PhoneNotification';
import { CoordinatorDrawer } from './components/CoordinatorDrawer';
import { DemoToolbar } from './components/DemoToolbar';
import { useBookingStore } from './store/bookingStore';
import { useState } from 'react';

export function App() {
  const { currentView, activeOfferToken } = useBookingStore();
  const [isPhoneOpen, setIsPhoneOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col pb-16">
      
      {/* Top Header */}
      <Header
        onOpenPhone={() => setIsPhoneOpen(prev => !prev)}
        isPhoneOpen={isPhoneOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'search' && (
          <SearchAndBooking
            onSelectVisitToken={(token) => {
              // auto open phone when booked
              setIsPhoneOpen(true);
            }}
          />
        )}

        {currentView === 'manage_visit' && (
          <VisitManagement
            onVisitCancelled={() => {
              // Open phone immediately to show WOW notification
              setIsPhoneOpen(true);
            }}
          />
        )}

        {currentView === 'waitlist_offer' && (
          <WaitlistOffer
            token={activeOfferToken}
            onAccepted={() => {
              setIsPhoneOpen(true);
            }}
          />
        )}

        {currentView === 'coordinator_log' && (
          <CoordinatorDrawer />
        )}
      </main>

      {/* Simulated Phone on Lock Screen (Ekran 3 & WOW) */}
      <PhoneNotification
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
      />

      {/* Presenter Demo Bar */}
      <DemoToolbar
        onTogglePhone={() => setIsPhoneOpen(prev => !prev)}
        isPhoneOpen={isPhoneOpen}
      />

    </div>
  );
}

export default App;
