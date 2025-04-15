-- Check if location column exists and add it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'campaigns'
        AND column_name = 'location'
    ) THEN
        ALTER TABLE public.campaigns ADD COLUMN location TEXT;
        
        -- Add comment for documentation
        COMMENT ON COLUMN public.campaigns.location IS 'Geographic target location for the campaign';
    END IF;
END $$; 