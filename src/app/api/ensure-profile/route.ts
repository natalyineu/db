export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/client';
import { ProfileService } from '@/services/profile-service';
import { ApiErrorHandler } from '@/utils/api-error-handler';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiErrorHandler.unauthorized('Missing or invalid authorization header');
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Initialize admin client
    const supabase = createAdminClient();
    
    // Verify the token and get user data
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return ApiErrorHandler.unauthorized('Invalid token');
    }
    
    if (!user.email) {
      return ApiErrorHandler.badRequest('User has no email address');
    }
    
    // Use ProfileService to ensure profile exists
    try {
      const profile = await ProfileService.ensureProfile(user.id, user.email);
      
      return ApiErrorHandler.success({
        success: true,
        profile
      });
    } catch (profileError) {
      if (DEBUG) console.error('[ensure-profile] Error ensuring profile:', profileError);
      return ApiErrorHandler.serverError(profileError, 'ensure-profile');
    }
  } catch (error) {
    return ApiErrorHandler.serverError(error, 'ensure-profile');
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