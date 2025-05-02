export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { ProfileService } from '@/services/profile-service';
import { ApiErrorHandler } from '@/utils/api-error-handler';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Webhook endpoint for Supabase user.confirmed event
 * Creates a user profile automatically when a user confirms their email
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the webhook payload
    const payload = await request.json();
    
    // Validate the event type
    if (payload.type !== 'user.confirmed') {
      return ApiErrorHandler.badRequest('Invalid event type. Expected "user.confirmed".');
    }

    // Extract user data from the payload
    const user = payload.user || payload.record;
    
    if (!user || !user.id || !user.email) {
      return ApiErrorHandler.badRequest('Invalid payload. Missing user data.');
    }

    if (DEBUG) console.log('[user-confirmed] Creating profile for:', user.email);
    
    try {
      // Use ProfileService to create the user profile
      const profile = await ProfileService.createProfile(user.id, user.email);
      
      // Return success response
      return ApiErrorHandler.success({ 
        success: true, 
        message: 'Profile created successfully', 
        profile 
      });
    } catch (profileError) {
      console.error('[user-confirmed] Error creating profile:', profileError);
      return ApiErrorHandler.serverError(profileError, 'user-confirmed');
    }
  } catch (error) {
    console.error('[user-confirmed] Error processing webhook:', error);
    return ApiErrorHandler.serverError(error, 'user-confirmed.top');
  }
}

// Handle all other HTTP methods
export function GET() {
  return ApiErrorHandler.methodNotAllowed('POST');
}

export function PUT() {
  return ApiErrorHandler.methodNotAllowed('POST');
}

export function DELETE() {
  return ApiErrorHandler.methodNotAllowed('POST');
}

export function PATCH() {
  return ApiErrorHandler.methodNotAllowed('POST');
} 