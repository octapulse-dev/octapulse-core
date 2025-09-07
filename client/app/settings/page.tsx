'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const tabs = ['Hardware', 'Notifications', 'Data', 'Security', 'API'];

export default function SettingsPage() {
  const [active, setActive] = useState('Hardware');

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mono-bold">Settings</h1>
          <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900 underline">Home</Link>
        </div>

        <div className="flex gap-2 border-b border-neutral-200 mb-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-3 py-2 text-sm rounded-t-md ${active === t ? 'bg-white border-l border-r border-t border-neutral-200 text-black' : 'text-neutral-600 hover:bg-neutral-50'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <div className="text-sm text-neutral-600 mb-4">{active} Preferences</div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="text-neutral-700">Setting {i}</div>
                <div className="text-neutral-900 mono">—</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-neutral-800">Save</button>
            <button className="px-4 py-2 border border-neutral-300 rounded-md text-sm text-neutral-900 hover:bg-neutral-50">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}


