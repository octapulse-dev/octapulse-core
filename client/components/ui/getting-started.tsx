'use client';

import React from 'react';
import { Fish, Upload, Settings, BarChart3 } from 'lucide-react';

interface GettingStartedProps {
  onStartClick?: () => void;
}

export default function GettingStarted({ onStartClick }: GettingStartedProps) {
  const steps = [
    {
      icon: Upload,
      title: 'Upload Image',
      description: 'Select a high-quality fish image with visible grid pattern for calibration',
      color: 'text-sky-600 bg-sky-100'
    },
    {
      icon: Settings,
      title: 'Configure Analysis',
      description: 'Set grid square size and choose analysis parameters for accurate measurements',
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      icon: BarChart3,
      title: 'Get Results',
      description: 'Receive detailed morphological measurements and visualizations within minutes',
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
      <div className="text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <Fish className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mono-bold mb-2">
              Get Started with Fish Analysis
            </h2>
            <p className="text-lg text-gray-600 sans-clean max-w-2xl mx-auto">
              Upload your first fish image to begin comprehensive AI-powered morphological analysis
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="space-y-4">
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mono-bold mb-2">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm sans-clean leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="pt-8">
          <p className="text-sm text-gray-500 sans-clean mb-4">
            Ready to analyze your fish? Start by uploading an image above.
          </p>
          {onStartClick && (
            <button
              onClick={onStartClick}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-lg hover:from-sky-600 hover:to-emerald-600 transition-colors mono-bold"
            >
              Upload Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}