'use client';

import { useState, useEffect, useCallback } from 'react';
import { healthCheck } from '@/lib/api';
import { logger } from '@/lib/utils/logger';

export interface SystemStatus {
  isOnline: boolean;
  isChecking: boolean;
  modelLoaded: boolean;
  modelName: string;
  lastChecked: Date | null;
  error: string | null;
}

interface UseSystemStatusOptions {
  checkInterval?: number; // milliseconds
  checkOnMount?: boolean;
  autoRefresh?: boolean;
}

export function useSystemStatus(options: UseSystemStatusOptions = {}) {
  const {
    checkInterval = 30000, // 30 seconds default
    checkOnMount = true,
    autoRefresh = false
  } = options;

  const [status, setStatus] = useState<SystemStatus>({
    isOnline: false,
    isChecking: false,
    modelLoaded: false,
    modelName: 'Unknown',
    lastChecked: null,
    error: null
  });

  const checkStatus = useCallback(async () => {
    setStatus(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      const health = await healthCheck();

      setStatus({
        isOnline: health.status === 'healthy',
        isChecking: false,
        modelLoaded: health.model_loaded,
        modelName: health.model_info?.name || 'YOLOv8',
        lastChecked: new Date(),
        error: null
      });

      logger.debug('System status check completed:', health);
    } catch (error: any) {
      logger.error('System status check failed:', error);

      setStatus({
        isOnline: false,
        isChecking: false,
        modelLoaded: false,
        modelName: 'Unknown',
        lastChecked: new Date(),
        error: error.detail || 'Unable to connect to backend'
      });
    }
  }, []);

  // Check on mount
  useEffect(() => {
    if (checkOnMount) {
      checkStatus();
    }
  }, [checkOnMount, checkStatus]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      checkStatus();
    }, checkInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, checkInterval, checkStatus]);

  return {
    status,
    checkStatus,
    refresh: checkStatus
  };
}
