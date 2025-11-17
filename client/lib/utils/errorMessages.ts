/**
 * Centralized error message handling for OctaPulse
 * Transforms technical error messages into user-friendly language
 */

export interface ErrorContext {
  operation?: string;
  detail?: string;
  statusCode?: number;
}

/**
 * HTTP status code to user-friendly message mapping
 */
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  // Client errors (4xx)
  400: 'Please check your input and try again.',
  401: 'You need to be logged in to perform this action.',
  403: 'You don\'t have permission to perform this action.',
  404: 'The requested resource could not be found.',
  408: 'The request took too long. Please try again.',
  413: 'The file is too large. Please upload a smaller file.',
  429: 'Too many requests. Please wait a moment and try again.',

  // Server errors (5xx)
  500: 'Something went wrong on our end. Please try again in a moment.',
  502: 'The server is temporarily unavailable. Please try again.',
  503: 'The service is temporarily unavailable. Please try again in a few minutes.',
  504: 'The request timed out. Please try again.',
};

/**
 * Common error patterns and their user-friendly messages
 */
const ERROR_PATTERNS: Array<{ pattern: RegExp; message: string; suggestion?: string }> = [
  {
    pattern: /network|fetch|connection/i,
    message: 'Unable to connect to the server.',
    suggestion: 'Please check your internet connection and try again.',
  },
  {
    pattern: /timeout/i,
    message: 'The request took too long to complete.',
    suggestion: 'The server might be busy. Please try again in a moment.',
  },
  {
    pattern: /file.*too.*large|payload.*too.*large/i,
    message: 'The file is too large to upload.',
    suggestion: 'Please try uploading a smaller file or fewer files at once.',
  },
  {
    pattern: /invalid.*format|unsupported.*format/i,
    message: 'The file format is not supported.',
    suggestion: 'Please upload a JPEG, PNG, or BMP image.',
  },
  {
    pattern: /no.*fish.*detected|fish.*not.*found/i,
    message: 'No fish could be detected in the image.',
    suggestion: 'Please ensure the image clearly shows the fish and try again.',
  },
  {
    pattern: /model.*not.*loaded|model.*unavailable/i,
    message: 'The analysis model is not ready.',
    suggestion: 'Please wait a moment and try again.',
  },
  {
    pattern: /batch.*not.*found/i,
    message: 'The analysis session could not be found.',
    suggestion: 'The session may have expired. Please start a new analysis.',
  },
  {
    pattern: /unauthorized|authentication.*failed/i,
    message: 'Authentication failed.',
    suggestion: 'Please log in and try again.',
  },
];

/**
 * Get user-friendly error message based on status code
 */
export function getHttpErrorMessage(statusCode: number): string {
  return HTTP_ERROR_MESSAGES[statusCode] || 'An unexpected error occurred.';
}

/**
 * Get user-friendly suggestion for an HTTP error
 */
export function getHttpErrorSuggestion(statusCode: number): string | null {
  if (statusCode >= 500) {
    return 'Our team has been notified. Please try again later.';
  }

  if (statusCode === 429) {
    return 'Please wait a few moments before trying again.';
  }

  if (statusCode === 413) {
    return 'Try uploading fewer images or smaller files.';
  }

  return null;
}

/**
 * Match error message against known patterns
 */
function matchErrorPattern(errorMessage: string): { message: string; suggestion?: string } | null {
  for (const pattern of ERROR_PATTERNS) {
    if (pattern.pattern.test(errorMessage)) {
      return {
        message: pattern.message,
        suggestion: pattern.suggestion,
      };
    }
  }
  return null;
}

/**
 * Format a user-friendly error message with optional suggestion
 */
export function formatErrorMessage(
  error: any,
  context?: ErrorContext
): { message: string; suggestion?: string } {
  // Handle different error types
  let errorMessage = '';
  let statusCode: number | undefined;

  // Extract error details
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.detail) {
    errorMessage = error.detail;
    statusCode = error.status_code;
  } else if (error?.message) {
    errorMessage = error.message;
    statusCode = error.status_code || error.statusCode;
  } else {
    errorMessage = 'An unexpected error occurred';
  }

  // Use status code from context if not in error
  statusCode = statusCode || context?.statusCode;

  // Check for HTTP status code errors first
  if (statusCode) {
    const httpMessage = getHttpErrorMessage(statusCode);
    const httpSuggestion = getHttpErrorSuggestion(statusCode);

    return {
      message: httpMessage,
      suggestion: httpSuggestion || undefined,
    };
  }

  // Check for known error patterns
  const patternMatch = matchErrorPattern(errorMessage);
  if (patternMatch) {
    return patternMatch;
  }

  // If we have a context detail, use it
  if (context?.detail) {
    return {
      message: context.detail,
      suggestion: 'Please try again or contact support if the problem persists.',
    };
  }

  // Return the error message as-is with a generic suggestion
  return {
    message: errorMessage,
    suggestion: 'Please try again. If the problem persists, contact support.',
  };
}

/**
 * Get a complete formatted error for display
 */
export function getDisplayError(
  error: any,
  context?: ErrorContext
): string {
  const formatted = formatErrorMessage(error, context);

  if (formatted.suggestion) {
    return `${formatted.message} ${formatted.suggestion}`;
  }

  return formatted.message;
}

/**
 * Get error recovery suggestions based on error type
 */
export function getRecoverySuggestions(error: any): string[] {
  const suggestions: string[] = [];

  const statusCode = error?.status_code || error?.statusCode;
  const errorMessage = error?.detail || error?.message || '';

  // Network/connection errors
  if (/network|fetch|connection/i.test(errorMessage) || statusCode === 502 || statusCode === 503) {
    suggestions.push('Check your internet connection');
    suggestions.push('Try refreshing the page');
    suggestions.push('Wait a few moments and try again');
  }

  // Timeout errors
  if (/timeout/i.test(errorMessage) || statusCode === 504 || statusCode === 408) {
    suggestions.push('The server might be processing other requests');
    suggestions.push('Try again in a few moments');
    suggestions.push('If this persists, try uploading fewer images');
  }

  // File size errors
  if (/file.*too.*large|payload.*too.*large/i.test(errorMessage) || statusCode === 413) {
    suggestions.push('Try uploading smaller images');
    suggestions.push('Upload fewer images at once');
    suggestions.push('Compress your images before uploading');
  }

  // Analysis errors
  if (/no.*fish.*detected|fish.*not.*found/i.test(errorMessage)) {
    suggestions.push('Ensure the fish is clearly visible in the image');
    suggestions.push('Use good lighting and contrast');
    suggestions.push('Try a different photo angle');
  }

  // Default suggestions if none matched
  if (suggestions.length === 0) {
    suggestions.push('Refresh the page and try again');
    suggestions.push('Check that your input is correct');
    suggestions.push('Contact support if the problem continues');
  }

  return suggestions;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  const statusCode = error?.status_code || error?.statusCode;
  const errorMessage = error?.detail || error?.message || '';

  // Retryable status codes (server errors and rate limits)
  if ([500, 502, 503, 504, 408, 429].includes(statusCode)) {
    return true;
  }

  // Network/connection errors
  if (/network|fetch|connection|timeout/i.test(errorMessage)) {
    return true;
  }

  return false;
}

/**
 * Get suggested retry delay in milliseconds
 */
export function getRetryDelay(error: any, attemptNumber: number = 1): number {
  const statusCode = error?.status_code || error?.statusCode;

  // Rate limit - wait longer
  if (statusCode === 429) {
    return Math.min(30000, 5000 * attemptNumber); // 5s, 10s, 15s, max 30s
  }

  // Server errors - exponential backoff
  if (statusCode >= 500) {
    return Math.min(10000, 1000 * Math.pow(2, attemptNumber - 1)); // 1s, 2s, 4s, 8s, max 10s
  }

  // Default exponential backoff
  return Math.min(5000, 500 * Math.pow(2, attemptNumber - 1)); // 500ms, 1s, 2s, 4s, max 5s
}
