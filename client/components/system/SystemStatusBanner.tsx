'use client';

import React from 'react';
import { CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { SystemStatus } from '@/lib/hooks/useSystemStatus';

interface SystemStatusBannerProps {
  status: SystemStatus;
  onRefresh?: () => void;
  variant?: 'full' | 'compact' | 'minimal';
  className?: string;
}

export function SystemStatusBanner({
  status,
  onRefresh,
  variant = 'full',
  className = ''
}: SystemStatusBannerProps) {
  const getStatusColor = () => {
    if (status.isChecking) return 'border-gray-300 bg-gray-50';
    if (status.isOnline && status.modelLoaded) return 'border-gray-200 bg-white';
    if (status.isOnline && !status.modelLoaded) return 'border-gray-300 bg-gray-50';
    return 'border-red-200 bg-red-50';
  };

  const getStatusIcon = () => {
    if (status.isChecking) {
      return <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />;
    }
    if (status.isOnline && status.modelLoaded) {
      return <CheckCircle className="w-4 h-4 text-black" />;
    }
    if (status.isOnline && !status.modelLoaded) {
      return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusText = () => {
    if (status.isChecking) return 'Checking system status...';
    if (status.isOnline && status.modelLoaded) return 'System Online';
    if (status.isOnline && !status.modelLoaded) return 'Model Loading';
    return 'System Offline';
  };

  const getStatusDetails = () => {
    if (status.error) return status.error;
    if (status.isOnline && status.modelLoaded) {
      return `${status.modelName} ready for analysis`;
    }
    if (status.isOnline && !status.modelLoaded) {
      return 'Waiting for AI model to load...';
    }
    return 'Unable to connect to backend service';
  };

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {getStatusIcon()}
        <span className="text-sm text-gray-700">{getStatusText()}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusColor()} ${className}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium text-gray-900">{getStatusText()}</span>
        {onRefresh && !status.isChecking && (
          <button
            onClick={onRefresh}
            className="ml-1 p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Refresh status"
          >
            <RefreshCw className="w-3 h-3 text-gray-600" />
          </button>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={`rounded-xl border p-4 ${getStatusColor()} ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="mt-0.5">
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 mono-bold">
                {getStatusText()}
              </h3>
              {status.lastChecked && (
                <span className="text-xs text-gray-500">
                  Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 sans-clean">
              {getStatusDetails()}
            </p>
          </div>
        </div>
        {onRefresh && !status.isChecking && (
          <button
            onClick={onRefresh}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Refresh system status"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}
