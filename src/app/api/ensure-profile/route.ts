import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to ensure a user profile exists
async function ensureUserProfile(userId: string, email: string) {
  // First check if profile already exists
  const { data: existingProfile, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') {
    // Real error (not just "no rows returned")
    console.error('Error checking for existing profile:', fetchError);
    return { success: false, error: fetchError.message };
  }
  
  // If profile already exists, no need to create it
  if (existingProfile) {
    return { success: true, created: false };
  }
  
  // Create new profile if it doesn't exist
  const { data, error: insertError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      email: email,
      created_at: new Date().toISOString(),
    })
    .select();
    
  if (insertError) {
    console.error('Error creating profile:', insertError);
    return { success: false, error: insertError.message };
  }
  
  return { success: true, created: true, profile: data[0] };
}

export async function POST(request: NextRequest) {
  try {
    // Get a Supabase client with admin privileges to validate tokens
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token and get user data
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid token.' },
        { status: 401 }
      );
    }
    
    // Ensure the user profile exists
    const result = await ensureUserProfile(user.id, user.email!);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle all other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
} 