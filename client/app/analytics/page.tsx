'use client';

import React from 'react';
import Link from 'next/link';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mono-bold">Analytics</h1>
          <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900 underline">Home</Link>
        </div>

        {/* At a Glance */}
        <section className="space-y-4 mb-10">
          <h2 className="text-lg font-semibold text-neutral-900 mono-bold">At a Glance</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Alerts', value: '—', desc: 'Recent system alerts' },
              { label: 'Throughput', value: '—/hr', desc: 'Processing rate' },
              { label: 'Avg Time', value: '— s', desc: 'Per item avg time' },
              { label: 'Uptime', value: '—', desc: 'System uptime' },
            ].map((c, i) => (
              <div key={i} className="rounded-lg border border-neutral-200 p-4 bg-white">
                <div className="text-xs text-neutral-500 uppercase mono-bold">{c.label}</div>
                <div className="text-2xl font-bold text-neutral-900 mono-bold mt-1">{c.value}</div>
                <div className="text-xs text-neutral-600 mt-1">{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Advanced View */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 mono-bold">Advanced View</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[1,2,3,4,5,6].map((n) => (
              <div key={n} className="rounded-lg border border-neutral-200 bg-white">
                <div className="p-4 border-b border-neutral-200">
                  <div className="text-sm font-semibold text-neutral-900 mono-bold">Chart {n}</div>
                </div>
                <div className="p-4">
                  <div className="w-full h-40 bg-neutral-100 border border-neutral-200 rounded" />
                  <div className="text-xs text-neutral-500 mt-2">Placeholder chart</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}


