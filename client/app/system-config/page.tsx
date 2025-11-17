'use client';

import React from 'react';
import Link from 'next/link';
import { Image, Brain, Target, Server, Settings, Sliders } from 'lucide-react';

export default function SystemConfigPage() {
  const sections = [
    {
      title: 'Image Processing',
      icon: Image,
      color: 'sky',
      items: [
        { label: 'Resolution', value: '1920x1080' },
        { label: 'Frame Rate', value: '30 FPS' },
        { label: 'Exposure', value: 'Auto' },
        { label: 'Contrast', value: '1.2' },
        { label: 'Brightness', value: '0.8' },
      ],
    },
    {
      title: 'AI Model',
      icon: Brain,
      color: 'emerald',
      items: [
        { label: 'Active Model', value: 'OctaPulse-v2.1' },
        { label: 'Confidence Threshold', value: '0.85' },
        { label: 'Batch Size', value: '16' },
        { label: 'Precision', value: 'FP16' },
      ],
    },
    {
      title: 'Detection Parameters',
      icon: Target,
      color: 'violet',
      items: [
        { label: 'Size Range', value: '10-500mm' },
        { label: 'Overlap Threshold', value: '0.45' },
        { label: 'Tracking Persistence', value: '5 frames' },
      ],
    },
    {
      title: 'System Resources',
      icon: Server,
      color: 'amber',
      items: [
        { label: 'GPU Limit', value: '80%' },
        { label: 'CPU Threads', value: '8' },
        { label: 'Memory Limit', value: '16 GB' },
        { label: 'Buffer Size', value: '256 MB' },
      ],
    },
  ];

  const getIconComponent = (Icon: any, color: string) => {
    const colorMap: { [key: string]: string } = {
      sky: 'text-sky-400',
      emerald: 'text-emerald-400',
      violet: 'text-violet-400',
      amber: 'text-amber-400',
    };
    return <Icon className={`w-5 h-5 ${colorMap[color]}`} />;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mono-bold mb-2">
              System Configuration
            </h1>
            <p className="text-gray-400 sans-clean">
              Configure processing parameters and AI models
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all tech-mono text-sm"
          >
            Back to Home
          </Link>
        </div>

        {/* Configuration Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {sections.map((section, i) => {
            const IconComponent = section.icon;
            return (
              <div
                key={i}
                className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-white/20 transition-all"
              >
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br from-${section.color}-500/20 to-${section.color}-500/10 rounded-lg flex items-center justify-center border border-white/10`}>
                      {getIconComponent(IconComponent, section.color)}
                    </div>
                    <div className="text-base font-semibold text-white mono-bold">
                      {section.title}
                    </div>
                  </div>
                </div>

                {/* Configuration Items */}
                <div className="p-6 space-y-3">
                  {section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg border border-white/5 hover:border-white/10 transition-all group"
                    >
                      <div className="flex items-center space-x-2">
                        <Sliders className="w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
                        <span className="text-sm text-gray-400 sans-clean">
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-white font-semibold mono-bold">
                          {item.value}
                        </span>
                        <Settings className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Advanced Settings Section */}
        <div className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mono-bold mb-4">
            Advanced Settings
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Enable Debug Mode', checked: false },
              { label: 'Auto Calibration', checked: true },
              { label: 'Performance Monitoring', checked: true },
            ].map((setting, i) => (
              <label
                key={i}
                className="flex items-center space-x-3 p-4 bg-[#0a0a0a] rounded-lg border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              >
                <input
                  type="checkbox"
                  defaultChecked={setting.checked}
                  className="w-4 h-4 rounded bg-white/5 border-white/10 text-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
                <span className="text-sm text-gray-300 sans-clean">
                  {setting.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-sky-400 hover:to-cyan-400 transition-all duration-300 shadow-lg hover:shadow-sky-500/50 mono-bold">
            Save Configuration
          </button>
          <button className="px-6 py-3 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all tech-mono">
            Reset to Defaults
          </button>
          <button className="px-6 py-3 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all tech-mono">
            Export Config
          </button>
        </div>
      </div>
    </div>
  );
}
