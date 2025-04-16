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

-- Check if status column exists and add it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'campaigns'
        AND column_name = 'status'
    ) THEN
        -- Add status column with a default value of 'offline'
        ALTER TABLE public.campaigns ADD COLUMN status TEXT DEFAULT 'offline' NOT NULL;
        
        -- Add a constraint to ensure status is only one of the allowed values
        ALTER TABLE public.campaigns ADD CONSTRAINT valid_status CHECK (status IN ('offline', 'in progress', 'online'));
        
        -- Add comment for documentation
        COMMENT ON COLUMN public.campaigns.status IS 'Current status of the campaign (offline, in progress, online)';
    END IF;
END $$; 