export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/client';
import { ProfileService } from '@/services/profile-service';
import { ApiErrorHandler } from '@/utils/api-error-handler';

// Only log in development or when debugging is needed
const DEBUG = process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true';

/**
 * Directly fetch a user profile from the database
 * This is a fallback method for when the client-side auth context is not loading properly
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return ApiErrorHandler.badRequest('Missing userId parameter');
    }
    
    if (DEBUG) console.log('[get-profile-direct] Fetching profile for user:', userId);
    
    try {
      // First, check if the user exists in auth system
      const supabase = createAdminClient();
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError) {
        console.error('[get-profile-direct] Error fetching user from auth:', userError);
        return ApiErrorHandler.notFound(`User not found in auth system: ${userError.message}`);
      }
      
      if (!userData || !userData.user) {
        console.error('[get-profile-direct] No user data returned from auth');
        return ApiErrorHandler.notFound('User not found in auth system');
      }
      
      if (DEBUG) console.log('[get-profile-direct] User found in auth system, email:', userData.user.email);
      
      // If user exists but has no email, return error
      if (!userData.user.email) {
        return ApiErrorHandler.badRequest('User has no email address');
      }
      
      // Try to get the profile using ProfileService
      let profile = await ProfileService.getProfile(userId);
      
      // If not found, create it
      if (!profile) {
        if (DEBUG) console.log('[get-profile-direct] Profile not found, creating it');
        try {
          profile = await ProfileService.createProfile(userId, userData.user.email);
          
          if (DEBUG) console.log('[get-profile-direct] Profile created successfully');
        } catch (createError) {
          console.error('[get-profile-direct] Error creating profile:', createError);
          return ApiErrorHandler.serverError(createError, 'get-profile-direct.create');
        }
      }
      
      return ApiErrorHandler.success({ profile });
      
    } catch (innerError) {
      console.error('[get-profile-direct] Unexpected error:', innerError);
      return ApiErrorHandler.serverError(innerError, 'get-profile-direct');
    }
  } catch (error) {
    console.error('[get-profile-direct] Top-level error:', error);
    return ApiErrorHandler.serverError(error, 'get-profile-direct.top');
  }
} 