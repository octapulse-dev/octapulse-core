'use client';

import React from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary 
      showErrorDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        console.error('Application error:', error);
        // TODO: Send to error monitoring service in production
      }}
    >
      {children}
    </ErrorBoundary>
  );
}