-- SQL query to convert plan objects to simple strings
-- Run this in your Supabase SQL editor

-- First, let's see what we're working with (uncomment to check)
-- SELECT id, plan FROM profiles WHERE plan IS NOT NULL LIMIT 10;

-- Update profiles where plan is a JSON object
UPDATE profiles
SET plan = to_jsonb(plan->>'name')
WHERE 
  plan IS NOT NULL 
  AND (jsonb_typeof(plan) = 'object')
  AND plan->>'name' IS NOT NULL;

-- Check the results after the update
-- SELECT id, plan FROM profiles WHERE plan IS NOT NULL LIMIT 10; 