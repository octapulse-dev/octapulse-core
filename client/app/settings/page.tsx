'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HardDrive, Bell, Database, Shield, Key, Globe, Palette, Zap } from 'lucide-react';

const tabs = [
  { id: 'Hardware', icon: HardDrive, color: 'sky' },
  { id: 'Notifications', icon: Bell, color: 'emerald' },
  { id: 'Data', icon: Database, color: 'violet' },
  { id: 'Security', icon: Shield, color: 'amber' },
  { id: 'API', icon: Key, color: 'rose' },
];

export default function SettingsPage() {
  const [active, setActive] = useState('Hardware');

  const settingsData: { [key: string]: { label: string; value: string }[] } = {
    Hardware: [
      { label: 'Auto-detect devices', value: 'Enabled' },
      { label: 'Device polling interval', value: '5 seconds' },
      { label: 'Hardware acceleration', value: 'GPU' },
      { label: 'Power management', value: 'Balanced' },
      { label: 'Temperature alerts', value: 'Enabled' },
      { label: 'Performance mode', value: 'High Performance' },
    ],
    Notifications: [
      { label: 'Email notifications', value: 'Enabled' },
      { label: 'Push notifications', value: 'Disabled' },
      { label: 'Alert threshold', value: 'Medium' },
      { label: 'Digest frequency', value: 'Daily' },
      { label: 'System alerts', value: 'Enabled' },
      { label: 'Error notifications', value: 'Enabled' },
    ],
    Data: [
      { label: 'Auto-backup', value: 'Enabled' },
      { label: 'Backup frequency', value: 'Weekly' },
      { label: 'Data retention', value: '90 days' },
      { label: 'Export format', value: 'CSV, JSON' },
      { label: 'Compression', value: 'Enabled' },
      { label: 'Cloud sync', value: 'Disabled' },
    ],
    Security: [
      { label: 'Two-factor auth', value: 'Enabled' },
      { label: 'Session timeout', value: '30 minutes' },
      { label: 'IP whitelist', value: 'Disabled' },
      { label: 'Audit logging', value: 'Enabled' },
      { label: 'Encryption', value: 'AES-256' },
      { label: 'Auto logout', value: 'Enabled' },
    ],
    API: [
      { label: 'API access', value: 'Enabled' },
      { label: 'Rate limit', value: '100/min' },
      { label: 'API version', value: 'v2.1' },
      { label: 'CORS', value: 'Enabled' },
      { label: 'Webhook support', value: 'Enabled' },
      { label: 'Authentication', value: 'OAuth 2.0' },
    ],
  };

  const getIconComponent = (Icon: any, color: string, isActive: boolean) => {
    const colorMap: { [key: string]: string } = {
      sky: isActive ? 'text-sky-400' : 'text-gray-400',
      emerald: isActive ? 'text-emerald-400' : 'text-gray-400',
      violet: isActive ? 'text-violet-400' : 'text-gray-400',
      amber: isActive ? 'text-amber-400' : 'text-gray-400',
      rose: isActive ? 'text-rose-400' : 'text-gray-400',
    };
    return <Icon className={`w-4 h-4 ${colorMap[color]}`} />;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mono-bold mb-2">Settings</h1>
            <p className="text-gray-400 sans-clean">Manage your application preferences</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all tech-mono text-sm"
          >
            Back to Home
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 text-sm rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white/10 border border-white/20 text-white shadow-lg'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/15 hover:text-gray-300'
                }`}
              >
                {getIconComponent(tab.icon, tab.color, isActive)}
                <span className="tech-mono">{tab.id}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {/* Section Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-white/10">
                {getIconComponent(
                  tabs.find((t) => t.id === active)?.icon || HardDrive,
                  tabs.find((t) => t.id === active)?.color || 'sky',
                  true
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mono-bold">
                  {active} Preferences
                </h2>
                <p className="text-xs text-gray-400 sans-clean">
                  Configure your {active.toLowerCase()} settings
                </p>
              </div>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {settingsData[active]?.map((setting, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <Zap className="w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
                    <span className="text-sm text-gray-300 sans-clean">{setting.label}</span>
                  </div>
                  <span className="text-sm text-white font-semibold mono-bold">
                    {setting.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-sky-400 hover:to-cyan-400 transition-all duration-300 shadow-lg hover:shadow-sky-500/50 mono-bold">
                Save Changes
              </button>
              <button className="px-6 py-3 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all tech-mono">
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <span className="text-xs text-gray-400 tech-mono">Version</span>
            </div>
            <p className="text-base font-semibold text-white mono-bold">v1.0.0</p>
          </div>
          <div className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Palette className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-gray-400 tech-mono">Theme</span>
            </div>
            <p className="text-base font-semibold text-white mono-bold">Dark Mode</p>
          </div>
          <div className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-gray-400 tech-mono">Performance</span>
            </div>
            <p className="text-base font-semibold text-white mono-bold">Optimized</p>
          </div>
        </div>
      </div>
    </div>
  );
}
