import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with admin privileges (server-side only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    if (DEBUG) console.log('[get-profile-direct] Fetching profile for user:', userId);
    
    try {
      // First, check if the user exists in auth system
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
        userId
      );
      
      if (userError) {
        console.error('[get-profile-direct] Error fetching user from auth:', userError);
        return NextResponse.json(
          { error: `User not found in auth system: ${userError.message}` },
          { status: 404 }
        );
      }
      
      if (!userData || !userData.user) {
        console.error('[get-profile-direct] No user data returned from auth');
        return NextResponse.json(
          { error: 'User not found in auth system' },
          { status: 404 }
        );
      }
      
      if (DEBUG) console.log('[get-profile-direct] User found in auth system, email:', userData.user.email);
      
      // Now fetch the profile
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('[get-profile-direct] Error fetching profile:', error);
        
        // If the profile doesn't exist (PGRST116 is "No rows returned"), create it
        if (error.code === 'PGRST116') {
          if (DEBUG) console.log('[get-profile-direct] Profile not found, attempting to create');
          
          try {
            if (!userData.user.email) {
              return NextResponse.json(
                { error: 'User missing email' },
                { status: 404 }
              );
            }
            
            // Create the missing profile with numeric status (1 for active)
            const insertResult = await supabaseAdmin
              .from('profiles')
              .insert({
                id: userId,
                email: userData.user.email,
                created_at: new Date().toISOString(),
                status: 1  // Using numeric value 1 for active status
              });
            
            if (insertResult.error) {
              console.error('[get-profile-direct] Error creating profile:', insertResult.error);
              return NextResponse.json(
                { error: 'Failed to create profile: ' + insertResult.error.message },
                { status: 500 }
              );
            }
            
            if (DEBUG) console.log('[get-profile-direct] Profile created successfully, fetching it');
            
            // Fetch the newly created profile
            const { data: newProfile, error: fetchError } = await supabaseAdmin
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            
            if (fetchError) {
              console.error('[get-profile-direct] Error fetching new profile:', fetchError);
              return NextResponse.json(
                { error: 'Profile created but could not be fetched: ' + fetchError.message },
                { status: 500 }
              );
            }
            
            if (!newProfile) {
              console.error('[get-profile-direct] Profile created but not found in fetch');
              return NextResponse.json(
                { error: 'Profile created but not found in database' },
                { status: 500 }
              );
            }
            
            if (DEBUG) console.log('[get-profile-direct] Successfully created and fetched profile');
            
            // Return the newly created profile
            return NextResponse.json({
              profile: {
                id: newProfile.id,
                email: newProfile.email,
                created_at: newProfile.created_at,
                updated_at: newProfile.updated_at,
                status: newProfile.status !== null ? String(newProfile.status) : undefined
              }
            }, {
              headers: {
                'Content-Type': 'application/json'
              }
            });
          } catch (createError) {
            console.error('[get-profile-direct] Error in profile creation process:', createError);
            return NextResponse.json(
              { error: 'Failed to create profile: ' + (createError instanceof Error ? createError.message : 'Unknown error') },
              { status: 500 }
            );
          }
        }
        
        // For other errors, return error response
        return NextResponse.json(
          { error: 'Failed to fetch profile: ' + error.message },
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      if (!data) {
        if (DEBUG) console.log('[get-profile-direct] No profile data returned');
        return NextResponse.json(
          { profile: null },
          { 
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      if (DEBUG) console.log('[get-profile-direct] Profile found, returning data');
      
      // Return the profile
      return NextResponse.json({
        profile: {
          id: data.id,
          email: data.email,
          created_at: data.created_at,
          updated_at: data.updated_at,
          status: data.status !== null ? String(data.status) : undefined
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (innerError) {
      console.error('[get-profile-direct] Unexpected error:', innerError);
      return NextResponse.json(
        { error: 'Unexpected error: ' + (innerError instanceof Error ? innerError.message : 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[get-profile-direct] Top-level error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 