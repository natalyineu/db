export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { ProfileService } from '@/services/profile-service';
import { ApiErrorHandler } from '@/utils/api-error-handler';

/**
 * Force update a user profile with admin privileges
 * Use with caution - bypasses normal auth checks
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { userId, plan } = body;
    
    if (!userId) {
      return ApiErrorHandler.badRequest('Missing userId parameter');
    }
    
    console.log('Force updating profile for user:', userId);
    
    try {
      // Get existing profile first
      const existingProfile = await ProfileService.getProfile(userId);
      
      if (!existingProfile) {
        return ApiErrorHandler.notFound('Profile not found');
      }
      
      // Force update the profile
      const updatedProfile = await ProfileService.updateProfile(userId, {
        plan: plan || 'Starter'
      });
      
      return ApiErrorHandler.success({
        success: true,
        profile: updatedProfile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      return ApiErrorHandler.serverError(error, 'force-update-profile');
    }
  } catch (error) {
    console.error('Error in force-update-profile API:', error);
    return ApiErrorHandler.serverError(error, 'force-update-profile.top');
  }
}

// Handle all other HTTP methods
export function GET() {
  return ApiErrorHandler.methodNotAllowed('POST');
} 