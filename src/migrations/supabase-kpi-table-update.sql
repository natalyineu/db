-- Update KPI table to include user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'kpi'
        AND column_name = 'user_id'
    ) THEN
        -- Add user_id column
        ALTER TABLE public.kpi ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Add comment for documentation
        COMMENT ON COLUMN public.kpi.user_id IS 'Reference to the user who owns this KPI data';
        
        -- Update existing records based on campaign user_id
        UPDATE public.kpi
        SET user_id = campaigns.user_id
        FROM public.campaigns
        WHERE kpi.campaign_id = campaigns.id;
        
        -- Create an index for performance
        CREATE INDEX kpi_user_id_idx ON public.kpi (user_id);
        
        -- Add RLS policy for the new column
        CREATE POLICY "Users can view their own KPIs directly" ON public.kpi
          FOR SELECT
          USING (auth.uid() = user_id);
    END IF;
END $$; 