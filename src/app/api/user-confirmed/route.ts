import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Parse the webhook payload
    const payload = await request.json();
    
    // Validate the event type
    if (payload.type !== 'user.confirmed') {
      return NextResponse.json(
        { error: 'Invalid event type. Expected "user.confirmed".' },
        { status: 400 }
      );
    }

    // Extract user data from the payload
    const user = payload.user || payload.record;
    
    if (!user || !user.id || !user.email) {
      return NextResponse.json(
        { error: 'Invalid payload. Missing user data.' },
        { status: 400 }
      );
    }

    // Create Supabase admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Create user profile in the profiles table with numeric status
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        created_at: new Date().toISOString(),
        status: 1  // Using numeric value 1 for active status
      })
      .select();

    if (error) {
      console.error('Error creating user profile:', error);
      return NextResponse.json(
        { error: 'Failed to create user profile: ' + error.message },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Profile created successfully', 
        profile: data[0] 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle all other HTTP methods
export async function GET() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

function methodNotAllowed() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
} 