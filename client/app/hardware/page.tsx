'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, Thermometer, Clock, Database, HardDrive, Camera, Cpu } from 'lucide-react';

export default function HardwarePage() {
  const devices = [
    {
      name: 'Processing Unit A1',
      status: 'Online',
      temp: '45°C',
      uptime: '247h',
      processed: '1.2k',
      storage: '45%',
      type: 'processor'
    },
    {
      name: 'Camera System B2',
      status: 'Calibrating',
      temp: '38°C',
      uptime: '89h',
      processed: '856',
      storage: '23%',
      type: 'camera'
    },
    {
      name: 'Processing Unit A2',
      status: 'Maintenance',
      temp: '—°C',
      uptime: '—',
      processed: '—',
      storage: '—',
      type: 'processor'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
      case 'Calibrating':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      case 'Maintenance':
        return 'bg-red-500/15 border-red-500/30 text-red-400';
      default:
        return 'bg-gray-500/15 border-gray-500/30 text-gray-400';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'processor':
        return <Cpu className="w-5 h-5 text-sky-400" />;
      case 'camera':
        return <Camera className="w-5 h-5 text-emerald-400" />;
      default:
        return <HardDrive className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mono-bold mb-2">Hardware</h1>
            <p className="text-gray-400 sans-clean">Monitor and manage your devices</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all tech-mono text-sm"
          >
            Back to Home
          </Link>
        </div>

        {/* System Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm tech-mono">Total Devices</p>
              <HardDrive className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-3xl font-bold text-white mono-bold">3</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-emerald-400 text-sm tech-mono">Online</p>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-white mono-bold">1</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-amber-400 text-sm tech-mono">Calibrating</p>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-white mono-bold">1</p>
          </div>
          <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-red-400 text-sm tech-mono">Maintenance</p>
              <Thermometer className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-white mono-bold">1</p>
          </div>
        </div>

        {/* Device Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {devices.map((d, i) => (
            <div
              key={i}
              className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-white/20 transition-all"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-white/10">
                    {getDeviceIcon(d.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-white mono-bold">{d.name}</div>
                  </div>
                </div>
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(d.status)}`}>
                  <div className={`w-2 h-2 rounded-full ${d.status === 'Online' ? 'bg-emerald-400 animate-pulse' : d.status === 'Calibrating' ? 'bg-amber-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs tech-mono uppercase">{d.status}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="p-6 border-b border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                    <div className="flex items-center space-x-2 mb-2">
                      <Thermometer className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-500 tech-mono">Temperature</p>
                    </div>
                    <p className="text-lg font-bold text-white mono-bold">{d.temp}</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-500 tech-mono">Uptime</p>
                    </div>
                    <p className="text-lg font-bold text-white mono-bold">{d.uptime}</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-500 tech-mono">Processed</p>
                    </div>
                    <p className="text-lg font-bold text-white mono-bold">{d.processed}</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                    <div className="flex items-center space-x-2 mb-2">
                      <Database className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-500 tech-mono">Storage</p>
                    </div>
                    <p className="text-lg font-bold text-white mono-bold">{d.storage}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 flex gap-2">
                <button className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all tech-mono">
                  Refresh
                </button>
                <button className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all tech-mono">
                  Settings
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
