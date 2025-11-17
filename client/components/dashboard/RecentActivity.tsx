'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Fish, Users, CheckCircle, XCircle, TrendingUp, BarChart3 } from 'lucide-react';
import {
  getRecentActivities,
  getSessionStats,
  formatRelativeTime,
  ActivityRecord,
  SessionStats
} from '@/lib/utils/activityTracking';

interface RecentActivityProps {
  className?: string;
}

export function RecentActivity({ className = '' }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);

  useEffect(() => {
    // Load activities and stats
    setActivities(getRecentActivities());
    setStats(getSessionStats());

    // Refresh every 30 seconds to update relative times
    const interval = setInterval(() => {
      setActivities(getRecentActivities());
      setStats(getSessionStats());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (activity: ActivityRecord) => {
    if (activity.type === 'batch_analysis') {
      return <Users className="w-4 h-4 text-gray-700" />;
    }
    return <Fish className="w-4 h-4 text-gray-700" />;
  };

  const getActivityLabel = (activity: ActivityRecord) => {
    if (activity.type === 'batch_analysis') {
      return `Batch Analysis (${activity.imageCount} images)`;
    }
    return 'Single Fish Analysis';
  };

  if (!stats || stats.totalAnalyses === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mono-bold mb-2">
          No Recent Activity
        </h3>
        <p className="text-sm text-gray-600 sans-clean">
          Your analysis history will appear here once you start processing images
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      {/* Stats Overview */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-black" />
          <h2 className="text-lg font-bold text-gray-900 mono-bold">
            Session Statistics
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900 mono-bold">
              {stats.totalAnalyses}
            </div>
            <div className="text-xs text-gray-600 mt-1 sans-clean">
              Total Analyses
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900 mono-bold">
              {stats.totalImages}
            </div>
            <div className="text-xs text-gray-600 mt-1 sans-clean">
              Images Processed
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900 mono-bold">
              {stats.successfulAnalyses}
            </div>
            <div className="text-xs text-gray-600 mt-1 sans-clean">
              Successful
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900 mono-bold">
              {stats.batchAnalyses}
            </div>
            <div className="text-xs text-gray-600 mt-1 sans-clean">
              Batch Analyses
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities List */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900 mono-bold">
            Recent Activity
          </h3>
        </div>
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0"
            >
              <div className="mt-0.5 flex-shrink-0">
                {getActivityIcon(activity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 mono">
                    {getActivityLabel(activity)}
                  </span>
                  {activity.success ? (
                    <CheckCircle className="w-3 h-3 text-black" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-600" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatRelativeTime(activity.timestamp)}</span>
                  {activity.metadata?.batchId && (
                    <span className="mono text-gray-400">
                      • ID: {activity.metadata.batchId.slice(0, 8)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {activities.length > 5 && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <span className="text-xs text-gray-500 sans-clean">
              Showing 5 of {activities.length} recent activities
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
