'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import HomePage from '@/components/pages/HomePage';
import PhenotypingPage from '@/components/pages/PhenotypingPage';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'home' | 'phenotyping'>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('phenotyping');

  const handleNavigateToPhenotyping = () => {
    setCurrentPage('phenotyping');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'phenotyping') {
      setCurrentPage('phenotyping');
    }
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
      {currentPage === 'phenotyping' && (
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
              {activeTab === 'phenotyping' && <PhenotypingPage />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}