/**
 * ChartExport Component
 *
 * Utilities for exporting charts as PNG, SVG, or PDF.
 */

'use client';

import React, { memo, useRef } from 'react';
import { Download, FileImage, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChartExportProps {
  chartRef: React.RefObject<HTMLDivElement>;
  chartName: string;
  className?: string;
}

export const ChartExport = memo(({
  chartRef,
  chartName,
  className = '',
}: ChartExportProps) => {
  const exportAsPNG = async () => {
    if (!chartRef.current) return;

    try {
      // Find the SVG element within the chart
      const svgElement = chartRef.current.querySelector('svg');
      if (!svgElement) {
        console.error('No SVG element found in chart');
        return;
      }

      // Get SVG data
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error('Failed to get canvas context');
        return;
      }

      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.download = `${chartName}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
          }
        });

        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error('Failed to export chart as PNG:', error);
    }
  };

  const exportAsSVG = () => {
    if (!chartRef.current) return;

    try {
      const svgElement = chartRef.current.querySelector('svg');
      if (!svgElement) {
        console.error('No SVG element found in chart');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const link = document.createElement('a');
      link.download = `${chartName}.svg`;
      link.href = url;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export chart as SVG:', error);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={exportAsPNG}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        title="Export as PNG"
      >
        <FileImage className="w-4 h-4" />
        <span>PNG</span>
      </button>

      <button
        onClick={exportAsSVG}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        title="Export as SVG"
      >
        <FileCode className="w-4 h-4" />
        <span>SVG</span>
      </button>
    </div>
  );
});

ChartExport.displayName = 'ChartExport';

/**
 * Hook for chart export functionality
 */
export function useChartExport() {
  const chartRef = useRef<HTMLDivElement>(null);

  const exportChart = (format: 'png' | 'svg', chartName: string) => {
    if (!chartRef.current) return;

    const svgElement = chartRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);

    if (format === 'svg') {
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.download = `${chartName}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'png') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.download = `${chartName}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
          }
        });

        URL.revokeObjectURL(url);
      };

      img.src = url;
    }
  };

  return { chartRef, exportChart };
}
