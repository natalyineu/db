-- Update the trigger function to set a simple string as the plan
CREATE OR REPLACE FUNCTION set_default_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Set just the plan name as a JSON string
  NEW.plan = to_jsonb('Starter'::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- No need to recreate the trigger, just the function

-- Run this migration on existing accounts too
UPDATE profiles
SET plan = to_jsonb('Starter'::text)
WHERE 
  plan IS NOT NULL 
  AND jsonb_typeof(plan) = 'object'
  AND plan->>'name' = 'Starter';

-- Just to be safe, run this for the specific JSON structure mentioned
UPDATE profiles
SET plan = to_jsonb('Starter'::text)
WHERE 
  plan IS NOT NULL 
  AND jsonb_typeof(plan) = 'object'
  AND plan->>'name' = 'Starter'
  AND plan->>'renewal_date' IS NOT NULL
  AND plan->>'payment_status' IS NOT NULL
  AND plan->>'impressions_limit' IS NOT NULL; 