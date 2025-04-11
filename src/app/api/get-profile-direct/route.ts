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
        { status: 400 }
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
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { profile: null },
        { status: 200 }
      );
    }
    
    // Return the profile
    return NextResponse.json({
      profile: {
        id: data.id,
        email: data.email,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status
      }
    });
  } catch (error) {
    console.error('Error in get-profile-direct:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 