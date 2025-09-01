'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Download, Eye } from 'lucide-react';
import { FishAnalysisResult, AnalysisStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PaginatedResultsProps {
  results: FishAnalysisResult[];
  isLoading?: boolean;
  onViewResult?: (result: FishAnalysisResult) => void;
  onDownloadResult?: (result: FishAnalysisResult) => void;
}

const ITEMS_PER_PAGE = 12;

export function PaginatedResults({ 
  results, 
  isLoading = false, 
  onViewResult,
  onDownloadResult 
}: PaginatedResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AnalysisStatus | 'all'>('all');

  // Filter and search results
  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const matchesSearch = result.image_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           result.analysis_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || result.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [results, searchTerm, statusFilter]);

  // Paginate results
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredResults, currentPage]);

  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: AnalysisStatus | 'all') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const getStatusBadgeVariant = (status: AnalysisStatus) => {
    switch (status) {
      case AnalysisStatus.COMPLETED:
        return 'success';
      case AnalysisStatus.FAILED:
        return 'destructive';
      case AnalysisStatus.PROCESSING:
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header with search and filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mono-bold">
              Analysis Results
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredResults.length} of {results.length} results
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by filename or ID..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilterChange('all')}
                className="text-xs"
              >
                All
              </Button>
              <Button
                variant={statusFilter === AnalysisStatus.COMPLETED ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilterChange(AnalysisStatus.COMPLETED)}
                className="text-xs"
              >
                Completed
              </Button>
              <Button
                variant={statusFilter === AnalysisStatus.FAILED ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilterChange(AnalysisStatus.FAILED)}
                className="text-xs"
              >
                Failed
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="p-6">
        {paginatedResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mono-bold mb-2">
              No results found
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No analysis results available'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedResults.map((result) => (
              <div
                key={result.analysis_id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Result Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate mono-bold">
                      {result.image_path.split('/').pop() || 'Unknown'}
                    </h4>
                    <p className="text-xs text-gray-500 mono truncate">
                      {result.analysis_id}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(result.status)}>
                    {result.status}
                  </Badge>
                </div>

                {/* Key Metrics */}
                {result.status === AnalysisStatus.COMPLETED && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Fish Detected:</span>
                      <span className="font-medium mono">
                        {Object.values(result.detections).reduce((a, b) => a + b, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Measurements:</span>
                      <span className="font-medium mono">{result.measurements.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Processing Time:</span>
                      <span className="font-medium mono">
                        {result.processing_metadata.processing_time_seconds.toFixed(1)}s
                      </span>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {result.status === AnalysisStatus.FAILED && result.error_message && (
                  <div className="mb-4">
                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded border">
                      {result.error_message}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {result.status === AnalysisStatus.COMPLETED && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewResult?.(result)}
                        className="flex-1 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownloadResult?.(result)}
                        className="flex-1 text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </>
                  )}
                  {result.status === AnalysisStatus.PROCESSING && (
                    <div className="w-full bg-sky-50 text-sky-700 text-xs py-2 px-3 rounded border border-sky-200 text-center">
                      Processing...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0 text-xs"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-600 mono">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}