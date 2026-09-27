import React from 'react';
import { WhoopDataProvider, useWhoopData } from './context/WhoopDataContext';
import { AchievementsProvider } from './context/AchievementsContext';

// Cyber UI Components
import CyberHeader from './components/cyber/CyberHeader';
import CyberBottomNav from './components/cyber/CyberBottomNav';
import HomeScreen from './components/cyber/HomeScreen';
import GuardianScreen from './components/cyber/GuardianScreen';
import ActionsScreen from './components/cyber/ActionsScreen';
import ProfileScreen from './components/cyber/ProfileScreen';

// Interactive Popups & Modals
import SleepDetailsModal from './components/cyber/modals/SleepDetailsModal';
import RespiratoryDetailsModal from './components/cyber/modals/RespiratoryDetailsModal';
import WalkingPlanModal from './components/cyber/modals/WalkingPlanModal';
import InhalerLogModal from './components/cyber/modals/InhalerLogModal';
import GuardianAlertsModal from './components/cyber/modals/GuardianAlertsModal';
import AlarmRingingOverlay from './components/cyber/modals/AlarmRingingOverlay';
import OvernightReportModal from './components/cyber/modals/OvernightReportModal';
import BadgeUnlockModal from './components/cyber/modals/BadgeUnlockModal';
import BadgeDetailModal from './components/cyber/modals/BadgeDetailModal';

function AppContent() {
  const { activeTab } = useWhoopData();

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black antialiased relative">
      
      {/* Ambient Cyber Lighting Effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-emerald-500/5 blur-3xl pointer-events-none z-0" />

      {/* Top Header Matching Image 1 */}
      <CyberHeader />

      {/* Main Screen Container */}
      <main className="flex-1 max-w-lg w-full mx-auto p-3 sm:p-4 z-10">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'guardian' && <GuardianScreen />}
        {activeTab === 'actions' && <ActionsScreen />}
        {activeTab === 'you' && <ProfileScreen />}
      </main>

      {/* Interactive Modals */}
      <SleepDetailsModal />
      <RespiratoryDetailsModal />
      <WalkingPlanModal />
      <InhalerLogModal />
      <GuardianAlertsModal />
      <AlarmRingingOverlay />
      <OvernightReportModal />
      <BadgeUnlockModal />
      <BadgeDetailModal />

      {/* Bottom Floating Navigation Matching Images 1-4 */}
      <CyberBottomNav />

    </div>
  );
}

export default function App() {
  return (
    <WhoopDataProvider>
      <AchievementsProvider>
        <AppContent />
      </AchievementsProvider>
    </WhoopDataProvider>
  );
}

