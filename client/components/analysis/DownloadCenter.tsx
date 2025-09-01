'use client';

import { useState } from 'react';
import { Download, FileText, Archive, Image, Database, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { downloadBatchResults } from '@/lib/api';
import { toast } from 'sonner';

interface DownloadCenterProps {
  batchId: string;
  downloadUrls?: {
    full_dataset_csv: string;
    population_report_pdf: string;
    all_visualizations_zip: string;
    individual_results_json: string;
  };
  isVisible: boolean;
}

type DownloadFormat = 'csv' | 'json' | 'pdf' | 'zip';

interface DownloadOption {
  format: DownloadFormat;
  title: string;
  description: string;
  icon: React.ReactNode;
  size?: string;
  recommended?: boolean;
}

export function DownloadCenter({ batchId, downloadUrls, isVisible }: DownloadCenterProps) {
  const [downloading, setDownloading] = useState<Set<DownloadFormat>>(new Set());

  if (!isVisible) return null;

  const downloadOptions: DownloadOption[] = [
    {
      format: 'csv',
      title: 'Full Dataset (CSV)',
      description: 'Complete analysis data in spreadsheet format with all measurements and statistics',
      icon: <FileText className="h-5 w-5" />,
      size: '~50-500KB',
      recommended: true
    },
    {
      format: 'pdf',
      title: 'Population Report (PDF)',
      description: 'Comprehensive report with visualizations, statistics, and insights',
      icon: <FileText className="h-5 w-5" />,
      size: '~2-10MB'
    },
    {
      format: 'zip',
      title: 'All Visualizations (ZIP)',
      description: 'Archive containing all processed images and visualization plots',
      icon: <Archive className="h-5 w-5" />,
      size: '~10-100MB'
    },
    {
      format: 'json',
      title: 'Raw Data (JSON)',
      description: 'Machine-readable format for developers and advanced analysis',
      icon: <Database className="h-5 w-5" />,
      size: '~100-1000KB'
    }
  ];

  const handleDownload = async (format: DownloadFormat) => {
    setDownloading(prev => new Set([...prev, format]));

    try {
      const blob = await downloadBatchResults(batchId, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch-${batchId}-results.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`${format.toUpperCase()} file downloaded successfully`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(`Failed to download ${format.toUpperCase()} file`);
    } finally {
      setDownloading(prev => {
        const next = new Set(prev);
        next.delete(format);
        return next;
      });
    }
  };

  const handleDirectDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Download className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mono-bold">Download Center</h3>
          <p className="text-sm text-gray-600">
            Export your analysis results in various formats
          </p>
        </div>
      </div>

      {/* Download Options */}
      <div className="space-y-4">
        {downloadOptions.map((option) => (
          <div
            key={option.format}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                {option.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 mono-bold">
                    {option.title}
                  </h4>
                  {option.recommended && (
                    <Badge variant="secondary" className="text-xs">
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {option.description}
                </p>
                {option.size && (
                  <p className="text-xs text-gray-500 mono">
                    Estimated size: {option.size}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDownload(option.format)}
                  disabled={downloading.has(option.format)}
                  className="min-w-[80px]"
                >
                  {downloading.has(option.format) ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Downloading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download className="h-3 w-3" />
                      <span className="text-xs">Download</span>
                    </div>
                  )}
                </Button>

                {/* Direct download link if available */}
                {downloadUrls && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const urlKey = `${option.format === 'csv' ? 'full_dataset_csv' : 
                                     option.format === 'pdf' ? 'population_report_pdf' :
                                     option.format === 'zip' ? 'all_visualizations_zip' :
                                     'individual_results_json'}` as keyof typeof downloadUrls;
                      const url = downloadUrls[urlKey];
                      if (url) {
                        handleDirectDownload(url, `batch-${batchId}-results.${option.format}`);
                      }
                    }}
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Direct
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Download Tips */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Download Tips</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• CSV files are best for data analysis in Excel or other spreadsheet tools</li>
              <li>• PDF reports provide human-readable summaries with visualizations</li>
              <li>• ZIP archives contain all processed images and can be large files</li>
              <li>• JSON format is ideal for programmatic access or API integration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Batch Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>
            Batch ID: <span className="mono font-medium">{batchId}</span>
          </span>
        </div>
      </div>
    </div>
  );
}