import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with admin privileges (server-side only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    
    // Fetch the profile from the database
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile directly:', error);
      
      // If the profile doesn't exist (PGRST116 is "No rows returned"), create it
      if (error.code === 'PGRST116') {
        // Get the user to retrieve email
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (userError) {
          console.error('Error fetching user:', userError);
          return NextResponse.json(
            { error: 'Failed to fetch user data' },
            { status: 500 }
          );
        }
        
        if (!userData.user || !userData.user.email) {
          return NextResponse.json(
            { error: 'User not found or missing email' },
            { status: 404 }
          );
        }
        
        // Create the missing profile
        const { data: newProfile, error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: userId,
            email: userData.user.email,
            created_at: new Date().toISOString(),
            status: 'active'
          })
          .select();
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return NextResponse.json(
            { error: 'Failed to create profile' },
            { status: 500 }
          );
        }
        
        // Return the newly created profile
        return NextResponse.json({
          profile: {
            id: newProfile[0].id,
            email: newProfile[0].email,
            created_at: newProfile[0].created_at,
            updated_at: newProfile[0].updated_at,
            status: newProfile[0].status ? String(newProfile[0].status) : undefined
          }
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      // For other errors, return error response
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    if (!data) {
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
    
    // Return the profile
    return NextResponse.json({
      profile: {
        id: data.id,
        email: data.email,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status ? String(data.status) : undefined
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in get-profile-direct:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 