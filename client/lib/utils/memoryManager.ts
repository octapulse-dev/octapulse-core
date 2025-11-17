/**
 * Memory Management Utilities
 *
 * Provides utilities for monitoring memory usage, managing resources,
 * and preventing memory leaks in the application.
 */

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ResourceHandle {
  id: string;
  type: 'object-url' | 'image' | 'other';
  resource: any;
  createdAt: number;
  size?: number;
}

class MemoryManager {
  private resources: Map<string, ResourceHandle> = new Map();
  private memoryWarningThreshold = 0.85; // 85% of heap limit
  private memoryListeners: Set<(info: MemoryInfo) => void> = new Set();

  /**
   * Get current memory information if available
   */
  getMemoryInfo(): MemoryInfo | null {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * Check if memory usage is approaching the limit
   */
  isMemoryPressureHigh(): boolean {
    const info = this.getMemoryInfo();
    if (!info) return false;

    const usageRatio = info.usedJSHeapSize / info.jsHeapSizeLimit;
    return usageRatio > this.memoryWarningThreshold;
  }

  /**
   * Get memory usage as a percentage
   */
  getMemoryUsagePercent(): number {
    const info = this.getMemoryInfo();
    if (!info) return 0;

    return (info.usedJSHeapSize / info.jsHeapSizeLimit) * 100;
  }

  /**
   * Register a resource for tracking
   */
  registerResource(id: string, type: ResourceHandle['type'], resource: any, size?: number): void {
    this.resources.set(id, {
      id,
      type,
      resource,
      createdAt: Date.now(),
      size,
    });
  }

  /**
   * Unregister and cleanup a resource
   */
  unregisterResource(id: string): void {
    const handle = this.resources.get(id);
    if (!handle) return;

    // Cleanup based on type
    if (handle.type === 'object-url' && typeof handle.resource === 'string') {
      try {
        URL.revokeObjectURL(handle.resource);
      } catch (error) {
        console.warn('Failed to revoke object URL:', error);
      }
    }

    this.resources.delete(id);
  }

  /**
   * Cleanup old resources (older than maxAge milliseconds)
   */
  cleanupOldResources(maxAge: number = 5 * 60 * 1000): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [id, handle] of this.resources.entries()) {
      if (now - handle.createdAt > maxAge) {
        this.unregisterResource(id);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Cleanup all registered resources
   */
  cleanupAll(): void {
    for (const id of this.resources.keys()) {
      this.unregisterResource(id);
    }
  }

  /**
   * Get statistics about registered resources
   */
  getResourceStats() {
    const stats = {
      total: this.resources.size,
      byType: {} as Record<string, number>,
      totalSize: 0,
      oldestResource: null as number | null,
    };

    let oldestTime = Date.now();

    for (const handle of this.resources.values()) {
      stats.byType[handle.type] = (stats.byType[handle.type] || 0) + 1;
      if (handle.size) {
        stats.totalSize += handle.size;
      }
      if (handle.createdAt < oldestTime) {
        oldestTime = handle.createdAt;
      }
    }

    if (this.resources.size > 0) {
      stats.oldestResource = oldestTime;
    }

    return stats;
  }

  /**
   * Add a listener for memory updates
   */
  addMemoryListener(listener: (info: MemoryInfo) => void): () => void {
    this.memoryListeners.add(listener);
    return () => this.memoryListeners.delete(listener);
  }

  /**
   * Notify all memory listeners
   */
  private notifyMemoryListeners(): void {
    const info = this.getMemoryInfo();
    if (info) {
      this.memoryListeners.forEach(listener => listener(info));
    }
  }

  /**
   * Start periodic memory monitoring
   */
  startMonitoring(interval: number = 5000): () => void {
    const intervalId = setInterval(() => {
      this.notifyMemoryListeners();

      // Auto-cleanup if memory pressure is high
      if (this.isMemoryPressureHigh()) {
        console.warn('High memory pressure detected, cleaning up old resources');
        const cleaned = this.cleanupOldResources(2 * 60 * 1000); // Clean resources older than 2 minutes
        console.log(`Cleaned ${cleaned} old resources`);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }
}

// Singleton instance
export const memoryManager = new MemoryManager();

// Utility functions for common operations

/**
 * Create an object URL and register it for automatic cleanup
 */
export function createManagedObjectURL(blob: Blob, id: string): string {
  const url = URL.createObjectURL(blob);
  memoryManager.registerResource(id, 'object-url', url, blob.size);
  return url;
}

/**
 * Revoke an object URL and unregister it
 */
export function revokeManagedObjectURL(id: string): void {
  memoryManager.unregisterResource(id);
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get memory status with human-readable information
 */
export function getMemoryStatus() {
  const info = memoryManager.getMemoryInfo();
  const stats = memoryManager.getResourceStats();
  const usagePercent = memoryManager.getMemoryUsagePercent();
  const isHighPressure = memoryManager.isMemoryPressureHigh();

  return {
    available: info !== null,
    usage: info ? {
      used: formatBytes(info.usedJSHeapSize),
      total: formatBytes(info.totalJSHeapSize),
      limit: formatBytes(info.jsHeapSizeLimit),
      percent: usagePercent.toFixed(1) + '%',
    } : null,
    resources: {
      ...stats,
      totalSize: formatBytes(stats.totalSize),
    },
    isHighPressure,
  };
}
