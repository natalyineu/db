-- Migration to fix Row Level Security policies for profiles and briefs tables

-- Profiles table RLS
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table (if they don't exist)
DO $$
BEGIN
    -- Allow users to view their own profile
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" 
        ON profiles FOR SELECT 
        USING (auth.uid() = id);
    END IF;

    -- Allow users to insert their own profile
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" 
        ON profiles FOR INSERT 
        WITH CHECK (auth.uid() = id);
    END IF;

    -- Allow users to update their own profile
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" 
        ON profiles FOR UPDATE 
        USING (auth.uid() = id);
    END IF;
END
$$;

-- Briefs table RLS
ALTER TABLE IF EXISTS briefs ENABLE ROW LEVEL SECURITY;

-- Create policies for briefs table (if they don't exist)
DO $$
BEGIN
    -- Allow users to view their own briefs
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'briefs' AND policyname = 'Users can view own briefs'
    ) THEN
        CREATE POLICY "Users can view own briefs" 
        ON briefs FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    -- Allow users to insert their own briefs
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'briefs' AND policyname = 'Users can insert own briefs'
    ) THEN
        CREATE POLICY "Users can insert own briefs" 
        ON briefs FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Allow users to update their own briefs
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'briefs' AND policyname = 'Users can update own briefs'
    ) THEN
        CREATE POLICY "Users can update own briefs" 
        ON briefs FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;

    -- Allow users to delete their own briefs
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'briefs' AND policyname = 'Users can delete own briefs'
    ) THEN
        CREATE POLICY "Users can delete own briefs" 
        ON briefs FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Allow admins to view all briefs and profiles
DO $$
BEGIN
    -- Admin policy for profiles
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles'
    ) THEN
        CREATE POLICY "Admins can view all profiles" 
        ON profiles FOR SELECT 
        USING (auth.jwt() ? 'app_metadata' AND auth.jwt()->'app_metadata' ? 'role' AND auth.jwt()->'app_metadata'->>'role' = 'admin');
    END IF;

    -- Admin policy for briefs
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'briefs' AND policyname = 'Admins can view all briefs'
    ) THEN
        CREATE POLICY "Admins can view all briefs" 
        ON briefs FOR SELECT 
        USING (auth.jwt() ? 'app_metadata' AND auth.jwt()->'app_metadata' ? 'role' AND auth.jwt()->'app_metadata'->>'role' = 'admin');
    END IF;
END
$$; 