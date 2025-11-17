/**
 * VirtualizedFileList Component
 *
 * High-performance virtualized list for displaying large numbers of files.
 * Only renders visible items in the viewport for optimal performance.
 */

'use client';

import React, { useRef, useEffect, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { X, FileImage, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/lib/utils';
import type { UploadedFile } from './ImageUpload';

interface VirtualizedFileListProps {
  files: UploadedFile[];
  onRemove: (fileId: string) => void;
  thumbnails?: Map<string, string>;
  className?: string;
}

// Memoized file preview component for better performance
const FilePreviewItem = memo(({
  uploadedFile,
  onRemove,
  thumbnail,
  style,
}: {
  uploadedFile: UploadedFile;
  onRemove: (fileId: string) => void;
  thumbnail?: string;
  style: React.CSSProperties;
}) => {
  const { file, id, error } = uploadedFile;

  return (
    <div style={style} className="px-2">
      <div className="flex items-center space-x-4 p-3 bg-slate-800/20 border border-slate-700/30 rounded-lg hover:bg-slate-700/20 transition-all duration-200">
        {/* Thumbnail */}
        {thumbnail && (
          <div className="flex-shrink-0 w-12 h-12 bg-slate-700/50 rounded-lg overflow-hidden border border-slate-600/30">
            <img
              src={thumbnail}
              alt={file.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {!thumbnail && (
          <div className="flex-shrink-0 w-12 h-12 bg-slate-700/50 rounded-lg overflow-hidden border border-slate-600/30 flex items-center justify-center">
            <FileImage className="w-6 h-6 text-slate-400" />
          </div>
        )}

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {file.name}
          </p>

          <p className="text-xs text-slate-400">
            {formatFileSize(file.size)}
          </p>

          {error && (
            <div className="flex items-center mt-1 text-red-400">
              <AlertTriangle className="w-3 h-3 mr-1" />
              <span className="text-xs">{error}</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <Badge variant={error ? 'destructive' : 'success'} className="text-xs">
          {error ? 'Error' : 'Ready'}
        </Badge>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(id)}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors duration-200 rounded"
          aria-label={`Remove ${file.name}`}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
});

FilePreviewItem.displayName = 'FilePreviewItem';

export default function VirtualizedFileList({
  files,
  onRemove,
  thumbnails,
  className = '',
}: VirtualizedFileListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Setup virtualizer
  const virtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated height of each item
    overscan: 5, // Number of items to render outside viewport
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={`max-h-[400px] overflow-auto ${className}`}
      style={{
        contain: 'strict',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {items.map((virtualItem) => {
          const file = files[virtualItem.index];
          const thumbnail = thumbnails?.get(file.id) || file.preview;

          return (
            <FilePreviewItem
              key={file.id}
              uploadedFile={file}
              onRemove={onRemove}
              thumbnail={thumbnail}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
