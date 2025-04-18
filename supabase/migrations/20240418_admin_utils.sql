-- Migration for admin utilities

-- Create a function to set a user's role to admin
CREATE OR REPLACE FUNCTION public.set_admin_role(user_id UUID)
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

-- Create a function to get table information
CREATE OR REPLACE FUNCTION public.get_table_info(table_name TEXT)
RETURNS JSONB AS $$
DECLARE
  columns_info JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'column_name', column_name,
      'data_type', data_type,
      'is_nullable', is_nullable
    )
  ) INTO columns_info
  FROM information_schema.columns
  WHERE table_name = $1 AND table_schema = 'public';
  
  RETURN columns_info;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on these functions
GRANT EXECUTE ON FUNCTION public.set_admin_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_info TO authenticated; 