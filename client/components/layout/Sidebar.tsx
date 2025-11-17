'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Fish, BarChart3, Cpu, Settings as SettingsIcon, SlidersHorizontal, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  {
    id: 'single-analysis',
    label: 'Single Analysis',
    icon: Fish,
    description: 'Individual fish analysis'
  },
  {
    id: 'batch-analysis',
    label: 'Batch Analysis',
    icon: BarChart3,
    description: 'Population analysis & stats'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Overview & charts'
  },
  {
    id: 'hardware',
    label: 'Hardware',
    icon: Cpu,
    description: 'Devices & performance'
  },
  {
    id: 'system-config',
    label: 'System Config',
    icon: SlidersHorizontal,
    description: 'Processing & models'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: UserIcon,
    description: 'Account & settings'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    description: 'Preferences'
  }
];

export default function Sidebar({ isCollapsed, onToggle, activeTab, onTabChange }: SidebarProps) {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white/95 backdrop-blur-sm border-r border-gray-200 transition-all duration-300 z-40 shadow-sm",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center px-4 bg-white">
        <div className={cn(
          "flex items-center space-x-3 transition-opacity duration-200",
          isCollapsed && "opacity-0 pointer-events-none"
        )}>
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center overflow-hidden">
            <img src="/octapulse_logo.png" alt="OctaPulse" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 mono-bold">OctaPulse</h1>
            <p className="text-xs text-gray-600 sans-clean">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-600" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-600" />
        )}
      </button>

      {/* Navigation */}
      <nav className="mt-4 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left",
                isActive
                  ? "bg-neutral-50 text-black border border-neutral-200"
                  : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive ? "text-black" : "text-gray-500"
              )} />
              <div className={cn(
                "transition-opacity duration-200",
                isCollapsed && "opacity-0 pointer-events-none"
              )}>
                <div className="font-medium text-sm mono-bold">{tab.label}</div>
                {!isCollapsed && (
                  <div className="text-xs text-gray-600 mt-0.5 sans-clean">{tab.description}</div>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white"
      )}>
        {!isCollapsed && (
          <div className="space-y-3">
            {/* User Info */}
            {isAuthenticated && user ? (
              <div className="bg-neutral-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-gray-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate mono-bold">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-600 truncate sans-clean">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 sans-clean truncate">
                    {user.farm.name}
                  </span>
                  <div className="px-2 py-0.5 bg-sky-100 border border-sky-200 rounded text-sky-700 sans-clean uppercase font-medium">
                    {user.role}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs text-gray-600 sans-clean">System Online</span>
                </div>
              </div>
            )}

            {/* Version */}
            <div className="text-xs text-gray-500 sans-clean text-center">
              v1.0.0
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
