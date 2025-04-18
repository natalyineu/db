-- SQL to specifically update plans with the structure:
-- {"name": "Starter", "renewal_date": "2025-05-18 00:00:00", "payment_status": "active", "impressions_limit": 16500}

-- First check what we have 
SELECT id, plan 
FROM profiles 
WHERE 
  plan IS NOT NULL 
  AND plan->>'name' IS NOT NULL 
  AND plan->>'renewal_date' IS NOT NULL
  AND plan->>'payment_status' IS NOT NULL
  AND plan->>'impressions_limit' IS NOT NULL
LIMIT 10;

-- Then update to keep only the name
UPDATE profiles
SET plan = to_jsonb(plan->>'name')  -- Convert the extracted name to JSONB
WHERE 
  plan IS NOT NULL 
  AND plan->>'name' IS NOT NULL 
  AND plan->>'renewal_date' IS NOT NULL
  AND plan->>'payment_status' IS NOT NULL
  AND plan->>'impressions_limit' IS NOT NULL;

-- Check the results after the update
SELECT id, plan 
FROM profiles 
WHERE id IN (
  -- The same IDs we found in the first query
  SELECT id 
  FROM profiles 
  WHERE 
    plan IS NOT NULL 
    AND plan->>'name' IS NOT NULL 
    AND plan->>'renewal_date' IS NOT NULL
    AND plan->>'payment_status' IS NOT NULL
    AND plan->>'impressions_limit' IS NOT NULL
  LIMIT 10
); 