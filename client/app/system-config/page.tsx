'use client';

import React from 'react';
import Link from 'next/link';

export default function SystemConfigPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mono-bold">System Configuration</h1>
          <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900 underline">Home</Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: 'Image Processing', items: ['Resolution', 'Frame Rate', 'Exposure', 'Contrast', 'Brightness'] },
            { title: 'AI Model', items: ['Active Model', 'Confidence Threshold', 'Batch Size', 'Precision'] },
            { title: 'Detection Parameters', items: ['Size Range', 'Overlap Threshold', 'Tracking Persistence'] },
            { title: 'System Resources', items: ['GPU Limit', 'CPU Threads', 'Memory Limit', 'Buffer Size'] },
          ].map((section, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 bg-white">
              <div className="p-4 border-b border-neutral-200">
                <div className="text-sm font-semibold text-neutral-900 mono-bold">{section.title}</div>
              </div>
              <div className="p-4 space-y-3">
                {section.items.map((item) => (
                  <div key={item} className="flex items-center justify-between text-sm">
                    <div className="text-neutral-700">{item}</div>
                    <div className="text-neutral-900 mono">—</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <button className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-neutral-800">Save</button>
          <button className="px-4 py-2 border border-neutral-300 rounded-md text-sm text-neutral-900 hover:bg-neutral-50">Reset</button>
        </div>
      </div>
    </div>
  );
}


