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
 * Capture and process an error 
 * Can be expanded to send errors to a monitoring service
 */
export function captureError(error: unknown, context: string): Error {
  const errorMessage = formatError(error);
  const contextualError = new Error(`${context}: ${errorMessage}`);
  
  // Log error in development
  if (DEBUG) {
    console.error(`Error in ${context}:`, error);
  }
  
  // Here you could add error reporting to a service like Sentry
  
  return contextualError;
} 