-- Create a function to set a user's role to admin
CREATE OR REPLACE FUNCTION set_admin_role(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  -- Update the user's metadata to include the admin role
  UPDATE auth.users
  SET raw_app_meta_data = 
    CASE 
      WHEN raw_app_meta_data IS NULL THEN '{"role": "admin"}'::jsonb
      ELSE jsonb_set(raw_app_meta_data, '{role}', '"admin"')
    END
  WHERE id = user_id;
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  
  -- Return true if a row was updated
  RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 