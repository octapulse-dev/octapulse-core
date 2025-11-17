'use client';

import { logger } from './logger';

// Activity types
export type ActivityType = 'single_analysis' | 'batch_analysis';

export interface ActivityRecord {
  id: string;
  type: ActivityType;
  timestamp: number;
  imageCount: number;
  success: boolean;
  metadata?: {
    batchId?: string;
    analysisId?: string;
    fileName?: string;
  };
}

export interface SessionStats {
  totalAnalyses: number;
  totalImages: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  batchAnalyses: number;
  singleAnalyses: number;
  lastActivity: number | null;
}

const STORAGE_KEY = 'octapulse_activity';
const STATS_KEY = 'octapulse_stats';
const MAX_RECENT_ACTIVITIES = 10;

// Safe localStorage wrapper
function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    logger.error('localStorage getItem error:', error);
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    logger.error('localStorage setItem error:', error);
  }
}

/**
 * Track a new analysis activity
 */
export function trackActivity(activity: Omit<ActivityRecord, 'id' | 'timestamp'>): void {
  const record: ActivityRecord = {
    ...activity,
    id: generateId(),
    timestamp: Date.now()
  };

  // Get existing activities
  const activities = getRecentActivities();

  // Add new activity to the front
  activities.unshift(record);

  // Keep only the most recent
  const trimmedActivities = activities.slice(0, MAX_RECENT_ACTIVITIES);

  // Save
  safeSetItem(STORAGE_KEY, JSON.stringify(trimmedActivities));

  // Update stats
  updateStats(record);

  logger.debug('Activity tracked:', record);
}

/**
 * Get recent activities
 */
export function getRecentActivities(): ActivityRecord[] {
  const data = safeGetItem(STORAGE_KEY);
  if (!data) return [];

  try {
    const activities = JSON.parse(data) as ActivityRecord[];
    return activities;
  } catch (error) {
    logger.error('Error parsing activities:', error);
    return [];
  }
}

/**
 * Get session statistics
 */
export function getSessionStats(): SessionStats {
  const data = safeGetItem(STATS_KEY);
  if (!data) {
    return {
      totalAnalyses: 0,
      totalImages: 0,
      successfulAnalyses: 0,
      failedAnalyses: 0,
      batchAnalyses: 0,
      singleAnalyses: 0,
      lastActivity: null
    };
  }

  try {
    return JSON.parse(data) as SessionStats;
  } catch (error) {
    logger.error('Error parsing stats:', error);
    return {
      totalAnalyses: 0,
      totalImages: 0,
      successfulAnalyses: 0,
      failedAnalyses: 0,
      batchAnalyses: 0,
      singleAnalyses: 0,
      lastActivity: null
    };
  }
}

/**
 * Update session statistics
 */
function updateStats(activity: ActivityRecord): void {
  const stats = getSessionStats();

  stats.totalAnalyses += 1;
  stats.totalImages += activity.imageCount;
  stats.lastActivity = activity.timestamp;

  if (activity.success) {
    stats.successfulAnalyses += 1;
  } else {
    stats.failedAnalyses += 1;
  }

  if (activity.type === 'batch_analysis') {
    stats.batchAnalyses += 1;
  } else {
    stats.singleAnalyses += 1;
  }

  safeSetItem(STATS_KEY, JSON.stringify(stats));
}

/**
 * Clear all activity data
 */
export function clearActivityData(): void {
  safeSetItem(STORAGE_KEY, JSON.stringify([]));
  safeSetItem(STATS_KEY, JSON.stringify({
    totalAnalyses: 0,
    totalImages: 0,
    successfulAnalyses: 0,
    failedAnalyses: 0,
    batchAnalyses: 0,
    singleAnalyses: 0,
    lastActivity: null
  }));
  logger.debug('Activity data cleared');
}

/**
 * Generate a simple unique ID
 */
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}
