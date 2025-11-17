'use client';

import '@/lib/setup';
import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import HomePage from '@/components/pages/HomePage';
import PhenotypingPage from '@/components/pages/PhenotypingPage';
import BatchAnalysisPage from '@/components/pages/BatchAnalysisPage';
import AnalyticsPage from '@/app/analytics/page';
import HardwarePage from '@/app/hardware/page';
import SystemConfigPage from '@/app/system-config/page';
import SettingsPage from '@/app/settings/page';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'home' | 'analysis'>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('single-analysis');

  const handleNavigateToPhenotyping = () => {
    setCurrentPage('analysis');
    setActiveTab('single-analysis');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage('analysis');
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show home page */}
      {currentPage === 'home' && (
        <HomePage onNavigateToPhenotyping={handleNavigateToPhenotyping} />
      )}

      {/* Show dashboard with sidebar */}
      {currentPage === 'analysis' && (
        <div className="flex">
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={handleSidebarToggle}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          <main className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}>
            <div className="p-8">
              {activeTab === 'single-analysis' && <PhenotypingPage />}
              {activeTab === 'batch-analysis' && <BatchAnalysisPage />}
              {activeTab === 'analytics' && <AnalyticsPage />}
              {activeTab === 'hardware' && <HardwarePage />}
              {activeTab === 'system-config' && <SystemConfigPage />}
              {activeTab === 'settings' && <SettingsPage />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}