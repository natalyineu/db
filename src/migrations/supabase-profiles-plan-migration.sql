-- Add plan JSON data to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan JSONB;

-- Create plans table to store plan information
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  impressions_limit INTEGER NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for plans table
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Create policies for plans table
-- Allow all authenticated users to view plans (read-only)
CREATE POLICY "Users can view all plans" 
  ON plans FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Only allow users with admin role to insert, update, delete plans
CREATE POLICY "Only admins can insert plans" 
  ON plans FOR INSERT 
  WITH CHECK (auth.jwt() ? 'app_metadata' AND auth.jwt()->'app_metadata' ? 'role' AND auth.jwt()->'app_metadata'->>'role' = 'admin');

CREATE POLICY "Only admins can update plans" 
  ON plans FOR UPDATE 
  USING (auth.jwt() ? 'app_metadata' AND auth.jwt()->'app_metadata' ? 'role' AND auth.jwt()->'app_metadata'->>'role' = 'admin');

CREATE POLICY "Only admins can delete plans" 
  ON plans FOR DELETE 
  USING (auth.jwt() ? 'app_metadata' AND auth.jwt()->'app_metadata' ? 'role' AND auth.jwt()->'app_metadata'->>'role' = 'admin');

-- Create initial plan tiers
INSERT INTO plans (name, impressions_limit, description, price)
VALUES 
  ('Starter', 16500, 'Basic analytics and campaign management', 99.00),
  ('Growth', 46500, 'Advanced analytics and optimization tools', 249.00),
  ('Impact', 96500, 'Full suite of analytics and AI recommendations', 579.00),
  ('Tailored', 100000, 'Custom solution for enterprise needs with unlimited support', 600.00)
ON CONFLICT (name) DO NOTHING;

-- Add default Starter plan to all existing profiles
UPDATE profiles 
SET plan = jsonb_build_object(
  'name', 'Starter',
  'impressions_limit', 16500,
  'payment_status', 'active',
  'renewal_date', (CURRENT_DATE + INTERVAL '30 days')::text
)
WHERE plan IS NULL;

-- Create a function to automatically set a default plan for new users
CREATE OR REPLACE FUNCTION set_default_plan()
RETURNS TRIGGER AS $$
BEGIN
  NEW.plan = jsonb_build_object(
    'name', 'Starter',
    'impressions_limit', 16500,
    'payment_status', 'active',
    'renewal_date', (CURRENT_DATE + INTERVAL '30 days')::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to set the default plan on new profile creation
DROP TRIGGER IF EXISTS set_default_plan_trigger ON profiles;
CREATE TRIGGER set_default_plan_trigger
BEFORE INSERT ON profiles
FOR EACH ROW
WHEN (NEW.plan IS NULL)
EXECUTE FUNCTION set_default_plan();

-- Add comment to explain the plan column
COMMENT ON COLUMN profiles.plan IS 'User subscription plan details including name, impressions limit, payment status, and renewal date';

-- Add index on plan->name for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_plan_name ON profiles ((plan->>'name')); 