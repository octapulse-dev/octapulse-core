'use client';

import React from 'react';
import Link from 'next/link';

export default function HardwarePage() {
  const devices = [
    { name: 'Processing Unit A1', status: 'Online', temp: '—°C', uptime: '—', processed: '—', storage: '—' },
    { name: 'Camera System B2', status: 'Calibrating', temp: '—°C', uptime: '—', processed: '—', storage: '—' },
    { name: 'Processing Unit A2', status: 'Maintenance', temp: '—°C', uptime: '—', processed: '—', storage: '—' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mono-bold">Hardware</h1>
          <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900 underline">Home</Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {devices.map((d, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 bg-white">
              <div className="p-4">
                <div className="text-sm font-semibold text-neutral-900 mono-bold">{d.name}</div>
                <div className="text-xs text-neutral-600 mt-1">Status: {d.status}</div>
              </div>
              <div className="p-4 border-t border-neutral-200 grid grid-cols-2 gap-4 text-sm">
                <div className="text-neutral-600">Temp: <span className="text-neutral-900 mono">{d.temp}</span></div>
                <div className="text-neutral-600">Uptime: <span className="text-neutral-900 mono">{d.uptime}</span></div>
                <div className="text-neutral-600">Processed: <span className="text-neutral-900 mono">{d.processed}</span></div>
                <div className="text-neutral-600">Storage: <span className="text-neutral-900 mono">{d.storage}</span></div>
              </div>
              <div className="p-4 border-t border-neutral-200 flex gap-2">
                <button className="px-3 py-1.5 border border-neutral-300 rounded-md text-xs text-neutral-900 hover:bg-neutral-50">Refresh</button>
                <button className="px-3 py-1.5 border border-neutral-300 rounded-md text-xs text-neutral-900 hover:bg-neutral-50">Settings</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


