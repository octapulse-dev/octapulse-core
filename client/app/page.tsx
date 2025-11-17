'use client';

import '@/lib/setup';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import HomePage from '@/components/pages/HomePage';
import PhenotypingPage from '@/components/pages/PhenotypingPage';
import BatchAnalysisPage from '@/components/pages/BatchAnalysisPage';
import AnalyticsPage from '@/app/analytics/page';
import HardwarePage from '@/app/hardware/page';
import SystemConfigPage from '@/app/system-config/page';
import SettingsPage from '@/app/settings/page';
import ProfilePage from '@/app/profile/page';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'analysis'>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('single-analysis');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleNavigateToPhenotyping = () => {
    setCurrentPage('analysis');
    setActiveTab('single-analysis');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Handle profile navigation
    if (tab === 'profile') {
      router.push('/profile');
    } else {
      setCurrentPage('analysis');
    }
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

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