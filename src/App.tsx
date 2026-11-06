/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BaseballProvider, useBaseball } from './context/BaseballContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { HomeDashboard } from './components/home/HomeDashboard';
import { RecordList } from './components/records/RecordList';
import { StatsDashboard } from './components/stats/StatsDashboard';
import { ScheduleTickets } from './components/schedule/ScheduleTickets';
import { SettingsMaster } from './components/settings/SettingsMaster';
import { RecordFormModal } from './components/records/RecordFormModal';
import { LoginScreen } from './components/auth/LoginScreen';

const AppContent: React.FC = () => {
  const { activeTab, isFormModalOpen, setIsFormModalOpen, editingRecord, setEditingRecord } = useBaseball();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased">
      {/* PC Collapsible Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 md:pb-8">
        {/* Sticky Header */}
        <Header />

        {/* Content Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] w-full mx-auto">
          {activeTab === 'home' && <HomeDashboard />}
          {activeTab === 'records' && <RecordList />}
          {activeTab === 'stats' && <StatsDashboard />}
          {activeTab === 'schedule' && <ScheduleTickets />}
          {activeTab === 'settings' && <SettingsMaster />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Record Form Modal (Create & Edit) */}
      <RecordFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingRecord(null);
        }}
        initialRecord={editingRecord}
      />
    </div>
  );
};

export default function App() {
  return (
    <BaseballProvider>
      <AuthenticatedApp />
    </BaseballProvider>
  );
}

const AuthenticatedApp: React.FC = () => {
  const { authLoading, isAuthenticated, isAuthorized } = useBaseball();
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-sm text-slate-500">認証状態を確認しています...</div>;
  }
  if (!isAuthenticated || !isAuthorized) {
    return <LoginScreen />;
  }
  return <AppContent />;
};
