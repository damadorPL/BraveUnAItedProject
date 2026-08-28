import { useState } from 'react';
import { Header } from './components/Header';
import { SearchAndBooking } from './components/SearchAndBooking';
import { VisitManagement } from './components/VisitManagement';
import { WaitlistOffer } from './components/WaitlistOffer';
import { PhoneNotification } from './components/PhoneNotification';
import { EmailNotification } from './components/EmailNotification';
import { SpecialistDashboard } from './components/SpecialistDashboard';
import { CoordinatorDashboard } from './components/CoordinatorDashboard';
import { CoordinatorDrawer } from './components/CoordinatorDrawer';
import { DemoToolbar } from './components/DemoToolbar';
import { useBookingStore } from './store/bookingStore';

export function App() {
  const { currentRole, currentView, activeOfferToken } = useBookingStore();
  const [isPhoneOpen, setIsPhoneOpen] = useState(true);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-brand-bg text-brand-text">
      
      {/* Top Header with Role Switcher & Badges */}
      <Header
        onOpenPhone={() => setIsPhoneOpen(prev => !prev)}
        isPhoneOpen={isPhoneOpen}
        onOpenEmail={() => setIsEmailOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Patient Role Views */}
        {currentRole === 'patient' && (
          <>
            {currentView === 'search' && (
              <SearchAndBooking
                onSelectVisitToken={() => {
                  setIsPhoneOpen(true);
                }}
              />
            )}

            {currentView === 'manage_visit' && (
              <VisitManagement
                onVisitCancelled={() => {
                  setIsPhoneOpen(true);
                  setIsEmailOpen(true);
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
          </>
        )}

        {/* Specialist Role View */}
        {currentRole === 'specialist' && (
          <SpecialistDashboard />
        )}

        {/* Coordinator Role View */}
        {currentRole === 'coordinator' && (
          <CoordinatorDashboard />
        )}

      </main>

      {/* Simulated Phone on Lock Screen (SMS & Moment WOW) */}
      <PhoneNotification
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
      />

      {/* Simulated Email Inbox Modal */}
      <EmailNotification
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
      />

      {/* Presenter Demo Bar */}
      <DemoToolbar
        onTogglePhone={() => setIsPhoneOpen(prev => !prev)}
        isPhoneOpen={isPhoneOpen}
        onOpenEmail={() => setIsEmailOpen(true)}
      />

    </div>
  );
}

export default App;
