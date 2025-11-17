'use client';

import React from 'react';
import { Fish, Users, BarChart3, HelpCircle, ArrowRight } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  action: () => void;
  badge?: string;
  recommended?: boolean;
}

interface QuickActionsProps {
  onNavigateToPhenotyping: () => void;
  onNavigateToBatch: () => void;
  className?: string;
}

export function QuickActions({
  onNavigateToPhenotyping,
  onNavigateToBatch,
  className = ''
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'single-analysis',
      title: 'Single Fish Analysis',
      description: 'Analyze individual fish images with detailed measurements and visualizations',
      icon: Fish,
      iconBg: 'bg-black',
      action: onNavigateToPhenotyping,
      badge: 'Quick Start',
      recommended: true
    },
    {
      id: 'batch-analysis',
      title: 'Batch Population Analysis',
      description: 'Process multiple images for comprehensive population statistics',
      icon: Users,
      iconBg: 'bg-gray-800',
      action: onNavigateToBatch
    },
    {
      id: 'view-guide',
      title: 'Analysis Guidelines',
      description: 'Best practices for image capture and analysis accuracy',
      icon: HelpCircle,
      iconBg: 'bg-gray-700',
      action: () => {
        // Could open a modal or navigate to docs
        window.open('/docs/guidelines', '_blank');
      }
    }
  ];

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mono-bold mb-2">
          Quick Actions
        </h2>
        <p className="text-gray-600 sans-clean">
          Choose your analysis workflow to get started
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              className="group relative bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              {action.recommended && (
                <div className="absolute -top-2 -right-2">
                  <span className="inline-block px-2 py-1 bg-black text-white text-xs font-bold rounded-md mono-bold">
                    Recommended
                  </span>
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 ${action.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 mono-bold">
                      {action.title}
                    </h3>
                    {action.badge && !action.recommended && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded mono">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 sans-clean leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end text-sm text-gray-500 group-hover:text-black transition-colors">
                <span className="mono-bold">Start</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Workflow Comparison */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mono-bold mb-4">
          Which analysis type should I choose?
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Fish className="w-4 h-4 text-black" />
              <span className="text-sm font-semibold text-gray-900 mono-bold">Single Fish Analysis</span>
            </div>
            <ul className="space-y-1 text-sm text-gray-700 sans-clean">
              <li className="flex items-start gap-2">
                <span className="text-black mt-0.5">•</span>
                <span>Best for: Individual fish measurement and detailed phenotyping</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-0.5">•</span>
                <span>Output: Detailed measurements, visualizations, and morphometrics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-0.5">•</span>
                <span>Fastest way to analyze a single specimen</span>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-black" />
              <span className="text-sm font-semibold text-gray-900 mono-bold">Batch Population Analysis</span>
            </div>
            <ul className="space-y-1 text-sm text-gray-700 sans-clean">
              <li className="flex items-start gap-2">
                <span className="text-black mt-0.5">•</span>
                <span>Best for: Population studies, size distributions, and statistical analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-0.5">•</span>
                <span>Output: Population statistics, distributions, charts, and individual results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-0.5">•</span>
                <span>Process 2-100 images in a single batch</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
