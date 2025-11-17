/**
 * Skeleton Loaders Component
 *
 * Skeleton loading placeholders for various UI components.
 * Provides better perceived performance during data loading.
 */

'use client';

import React, { memo } from 'react';

/**
 * Base skeleton component with shimmer effect
 */
export const Skeleton = memo(({
  className = '',
  width = '100%',
  height = '20px',
  rounded = 'rounded',
}: {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}) => {
  return (
    <div
      className={`bg-gray-200 animate-pulse ${rounded} ${className}`}
      style={{ width, height }}
    />
  );
});

Skeleton.displayName = 'Skeleton';

/**
 * Skeleton for chart components
 */
export const ChartSkeleton = memo(({
  height = 300,
  className = '',
}: {
  height?: number;
  className?: string;
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="space-y-4">
        {/* Chart title skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton width="200px" height="24px" />
          <Skeleton width="100px" height="32px" rounded="rounded-lg" />
        </div>

        {/* Chart area skeleton */}
        <div className="relative" style={{ height: `${height}px` }}>
          <div className="absolute inset-0 bg-gray-100 rounded-lg animate-pulse">
            {/* Y-axis */}
            <div className="absolute left-0 top-0 bottom-12 w-12 space-y-4 pt-4 pb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} width="40px" height="12px" />
              ))}
            </div>

            {/* X-axis */}
            <div className="absolute bottom-0 left-12 right-0 h-12 flex space-x-4 px-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} width="60px" height="12px" />
              ))}
            </div>

            {/* Chart bars/lines */}
            <div className="absolute left-12 right-4 top-4 bottom-12 flex items-end space-x-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  width="100%"
                  height={`${Math.random() * 60 + 30}%`}
                  rounded="rounded-t"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Legend skeleton */}
        <div className="flex items-center space-x-6">
          <Skeleton width="120px" height="16px" />
          <Skeleton width="100px" height="16px" />
        </div>
      </div>
    </div>
  );
});

ChartSkeleton.displayName = 'ChartSkeleton';

/**
 * Skeleton for statistics cards
 */
export const StatCardSkeleton = memo(({
  className = '',
}: {
  className?: string;
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="space-y-3">
        <Skeleton width="120px" height="20px" />
        <Skeleton width="80px" height="36px" />
        <Skeleton width="150px" height="14px" />
        <Skeleton width="100px" height="12px" />
      </div>
    </div>
  );
});

StatCardSkeleton.displayName = 'StatCardSkeleton';

/**
 * Skeleton for file list items
 */
export const FileListItemSkeleton = memo(() => {
  return (
    <div className="flex items-center space-x-4 p-3 bg-slate-800/20 border border-slate-700/30 rounded-lg">
      <Skeleton width="48px" height="48px" rounded="rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton width="200px" height="14px" />
        <Skeleton width="80px" height="12px" />
      </div>
      <Skeleton width="60px" height="24px" rounded="rounded-full" />
      <Skeleton width="24px" height="24px" rounded="rounded" />
    </div>
  );
});

FileListItemSkeleton.displayName = 'FileListItemSkeleton';

/**
 * Skeleton for file list
 */
export const FileListSkeleton = memo(({
  count = 5,
  className = '',
}: {
  count?: number;
  className?: string;
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <FileListItemSkeleton key={i} />
      ))}
    </div>
  );
});

FileListSkeleton.displayName = 'FileListSkeleton';

/**
 * Skeleton for table rows
 */
export const TableRowSkeleton = memo(({
  columns = 4,
}: {
  columns?: number;
}) => {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton width="100%" height="16px" />
        </td>
      ))}
    </tr>
  );
});

TableRowSkeleton.displayName = 'TableRowSkeleton';

/**
 * Skeleton for table
 */
export const TableSkeleton = memo(({
  rows = 5,
  columns = 4,
  className = '',
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton width="100px" height="16px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

TableSkeleton.displayName = 'TableSkeleton';

/**
 * Skeleton for analysis result card
 */
export const AnalysisResultSkeleton = memo(() => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Skeleton width="200px" height="20px" />
          <Skeleton width="80px" height="24px" rounded="rounded-full" />
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton width="100%" height="200px" rounded="rounded-lg" />
          <Skeleton width="100%" height="200px" rounded="rounded-lg" />
        </div>
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Skeleton width="100px" height="32px" rounded="rounded-lg" />
          <Skeleton width="100px" height="32px" rounded="rounded-lg" />
        </div>
      </div>
    </div>
  );
});

AnalysisResultSkeleton.displayName = 'AnalysisResultSkeleton';

/**
 * Skeleton for distribution card
 */
export const DistributionSkeleton = memo(() => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <Skeleton width="180px" height="20px" />
          <div className="flex space-x-4">
            <Skeleton width="80px" height="14px" />
            <Skeleton width="80px" height="14px" />
            <Skeleton width="60px" height="14px" />
          </div>
        </div>
      </div>
    </div>
  );
});

DistributionSkeleton.displayName = 'DistributionSkeleton';

/**
 * Pulse effect wrapper for any content
 */
export const PulseLoader = memo(({
  children,
  isLoading,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      <div className="opacity-50">{children}</div>
      <div className="absolute inset-0 bg-white/50 animate-pulse" />
    </div>
  );
});

PulseLoader.displayName = 'PulseLoader';

/**
 * Shimmer effect wrapper
 */
export const ShimmerWrapper = memo(({
  className = '',
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
});

ShimmerWrapper.displayName = 'ShimmerWrapper';

// Add shimmer animation to global styles if needed
// In your tailwind.config.js:
// animation: {
//   shimmer: 'shimmer 2s infinite',
// },
// keyframes: {
//   shimmer: {
//     '100%': { transform: 'translateX(100%)' },
//   },
// },
