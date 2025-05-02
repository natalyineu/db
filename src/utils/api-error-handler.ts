import { NextResponse } from 'next/server';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Standardized API error handler
 * Ensures consistent error responses across all API routes
 */
export class ApiErrorHandler {
  /**
   * Handle authentication errors
   */
  static unauthorized(message = 'Unauthorized. Please sign in.'): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      { error: message },
      { status: 401 }
    );
  }
  
  /**
   * Handle bad request errors
   */
  static badRequest(message: string): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
  
  /**
   * Handle forbidden errors
   */
  static forbidden(message = 'You do not have permission to access this resource.'): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      { error: message },
      { status: 403 }
    );
  }
  
  /**
   * Handle not found errors
   */
  static notFound(message = 'Resource not found.'): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      { error: message },
      { status: 404 }
    );
  }
  
  /**
   * Handle method not allowed errors
   */
  static methodNotAllowed(allowedMethod: string): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      { error: `Method not allowed. Use ${allowedMethod}.` },
      { status: 405 }
    );
  }
  
  /**
   * Handle internal server errors
   */
  static serverError(error: unknown, context?: string): NextResponse<ApiErrorResponse> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const contextPrefix = context ? `[${context}] ` : '';
    
    if (DEBUG) {
      console.error(`${contextPrefix}Server error:`, error);
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: DEBUG ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
  
  /**
   * Create success response
   */
  static success<T>(data: T): NextResponse<T> {
    return NextResponse.json(data, { status: 200 });
  }
} 