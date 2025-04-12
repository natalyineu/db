// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Formats an error for display
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Custom error type that includes the original error
 */
export class ContextualError extends Error {
  originalError: unknown;
  
  constructor(message: string, originalError: unknown) {
    super(message);
    this.name = 'ContextualError';
    this.originalError = originalError;
    
    // Preserve the original stack if possible
    if (originalError instanceof Error && originalError.stack) {
      this.stack = originalError.stack;
    }
  }
}

/**
 * Capture and process an error 
 * Can be expanded to send errors to a monitoring service
 */
export function captureError(error: unknown, context: string): Error {
  const errorMessage = formatError(error);
  const contextualError = new ContextualError(`${context}: ${errorMessage}`, error);
  
  // Log error in development
  if (DEBUG) {
    console.error(`Error in ${context}:`, error);
  }
  
  // Here you could add error reporting to a service like Sentry
  
  return contextualError;
} 