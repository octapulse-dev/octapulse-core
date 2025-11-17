'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Fish, BarChart3, Cpu, Settings as SettingsIcon, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    description: 'Preferences'
  }
];

export default function Sidebar({ isCollapsed, onToggle, activeTab, onTabChange }: SidebarProps) {
  return (
    <div className={cn(
      "fixed left-0 top-0 h-full backdrop-blur-md border-r transition-all duration-300 z-40",
      "bg-gradient-to-b from-[#1a1a1a]/98 to-[#1e1e1e]/95 border-white/10",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* Header */}
      <div className="h-20 border-b border-white/10 flex items-center px-6">
        <div className={cn(
          "flex items-center space-x-3 transition-opacity duration-200",
          isCollapsed && "opacity-0 pointer-events-none"
        )}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 flex items-center justify-center overflow-hidden border border-white/10 backdrop-blur-sm">
            <img src="/octapulse_logo.png" alt="OctaPulse" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white mono-bold">OctaPulse</h1>
            <p className="text-xs text-gray-400 tech-mono">Dashboard</p>
          </div>
        </div>
        
        {isCollapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 flex items-center justify-center overflow-hidden border border-white/10 mx-auto">
            <img src="/octapulse_logo.png" alt="OctaPulse" className="w-6 h-6 object-contain" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-24 w-7 h-7 bg-[#1e1e1e] border border-white/15 rounded-full flex items-center justify-center hover:bg-[#2a2a2a] hover:border-white/25 transition-all shadow-lg backdrop-blur-sm z-50"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Navigation */}
      <nav className="mt-6 px-3 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-left group relative overflow-hidden",
                isActive 
                  ? "bg-gradient-to-r from-sky-500/15 to-cyan-500/15 text-white border border-sky-500/30 shadow-lg shadow-sky-500/10" 
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-300 border border-transparent hover:border-white/10"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-cyan-500/5"></div>
              )}
              
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0 relative z-10 transition-transform group-hover:scale-110",
                isActive ? "text-sky-400" : "text-gray-500 group-hover:text-gray-400"
              )} />
              
              <div className={cn(
                "transition-opacity duration-200 relative z-10 flex-1",
                isCollapsed && "opacity-0 pointer-events-none"
              )}>
                <div className={cn(
                  "font-medium text-sm mono-bold",
                  isActive ? "text-white" : "text-gray-300"
                )}>
                  {tab.label}
                </div>
                {!isCollapsed && (
                  <div className={cn(
                    "text-xs mt-0.5 tech-mono",
                    isActive ? "text-gray-300" : "text-gray-500"
                  )}>
                    {tab.description}
                  </div>
                )}
              </div>
              
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-400 to-cyan-400 rounded-l-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 border-t border-white/10",
        "bg-gradient-to-t from-[#1a1a1a]/95 to-transparent"
      )}>
        {!isCollapsed && (
          <div className="dark-card p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs text-gray-400 tech-mono">System Online</span>
            </div>
            <div className="text-xs text-gray-500 tech-mono">
              v1.0.0
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
