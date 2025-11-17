'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Clock, Activity, AlertCircle, BarChart3, PieChart, LineChart } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mono-bold mb-2">Analytics</h1>
            <p className="text-gray-400 sans-clean">Comprehensive insights and performance metrics</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all tech-mono text-sm"
          >
            Back to Home
          </Link>
        </div>

        {/* At a Glance */}
        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white mono-bold mb-6">At a Glance</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                label: 'Alerts',
                value: '2',
                desc: 'Recent system alerts',
                icon: AlertCircle,
                color: 'from-red-500/10 to-pink-500/10',
                borderColor: 'border-red-500/20',
                iconColor: 'text-red-400',
              },
              {
                label: 'Throughput',
                value: '42/hr',
                desc: 'Processing rate',
                icon: TrendingUp,
                color: 'from-sky-500/10 to-cyan-500/10',
                borderColor: 'border-sky-500/20',
                iconColor: 'text-sky-400',
              },
              {
                label: 'Avg Time',
                value: '28s',
                desc: 'Per item avg time',
                icon: Clock,
                color: 'from-emerald-500/10 to-cyan-500/10',
                borderColor: 'border-emerald-500/20',
                iconColor: 'text-emerald-400',
              },
              {
                label: 'Uptime',
                value: '99.8%',
                desc: 'System uptime',
                icon: Activity,
                color: 'from-violet-500/10 to-purple-500/10',
                borderColor: 'border-violet-500/20',
                iconColor: 'text-violet-400',
              },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border ${c.borderColor} p-6 bg-gradient-to-br ${c.color} backdrop-blur-md`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-gray-400 uppercase tech-mono">{c.label}</div>
                    <Icon className={`w-5 h-5 ${c.iconColor}`} />
                  </div>
                  <div className="text-3xl font-bold text-white mono-bold mb-1">{c.value}</div>
                  <div className="text-xs text-gray-400 sans-clean">{c.desc}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Advanced View */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white mono-bold">Advanced View</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: 'Processing Trends', icon: LineChart, color: 'sky' },
              { name: 'Category Distribution', icon: PieChart, color: 'emerald' },
              { name: 'Performance Metrics', icon: BarChart3, color: 'violet' },
              { name: 'Quality Analysis', icon: TrendingUp, color: 'amber' },
              { name: 'Historical Data', icon: Activity, color: 'rose' },
              { name: 'System Health', icon: AlertCircle, color: 'cyan' },
            ].map((chart, n) => {
              const ChartIcon = chart.icon;
              return (
                <div
                  key={n}
                  className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-white/20 transition-all"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-br from-${chart.color}-500/20 to-${chart.color}-500/10 rounded-lg flex items-center justify-center border border-white/10`}>
                        <ChartIcon className={`w-5 h-5 text-${chart.color}-400`} />
                      </div>
                      <div className="text-base font-semibold text-white mono-bold">
                        {chart.name}
                      </div>
                    </div>
                  </div>

                  {/* Chart Placeholder */}
                  <div className="p-6">
                    <div className="w-full h-48 bg-[#0a0a0a] border border-white/5 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {/* Grid pattern background */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                          {Array.from({ length: 48 }).map((_, i) => (
                            <div key={i} className="border border-white/5" />
                          ))}
                        </div>
                      </div>

                      {/* Chart icon */}
                      <div className="relative z-10 flex flex-col items-center space-y-2">
                        <ChartIcon className={`w-12 h-12 text-${chart.color}-400/30`} />
                        <span className="text-xs text-gray-500 tech-mono">
                          Chart visualization placeholder
                        </span>
                      </div>
                    </div>

                    {/* Chart Info */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-500 tech-mono">
                        Last updated: Just now
                      </div>
                      <button className="text-xs text-sky-400 hover:text-sky-300 tech-mono transition-colors">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
