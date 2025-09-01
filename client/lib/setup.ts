/**
 * Application setup and initialization
 */

import { setupGlobalErrorHandling } from '@/components/ui/ErrorBoundary';

// Initialize global error handling
if (typeof window !== 'undefined') {
  setupGlobalErrorHandling();
  
  // Log performance information
  if (process.env.NODE_ENV === 'development') {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      console.log(`Page load time: ${pageLoadTime.toFixed(2)}ms`);
    });
  }
}