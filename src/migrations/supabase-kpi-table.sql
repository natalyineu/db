-- Create set_updated_at() function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Campaign KPIs Table
CREATE TABLE public.kpi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Budget metrics
  budget_plan DECIMAL(12, 2) NOT NULL DEFAULT 0,
  budget_fact DECIMAL(12, 2) NOT NULL DEFAULT 0,
  budget_percentage DECIMAL(7, 2) NOT NULL DEFAULT 0,
  
  -- Impressions metrics
  impressions_plan BIGINT NOT NULL DEFAULT 0,
  impressions_fact BIGINT NOT NULL DEFAULT 0,
  impressions_percentage DECIMAL(7, 2) NOT NULL DEFAULT 0,
  
  -- Clicks metrics
  clicks_plan BIGINT NOT NULL DEFAULT 0,
  clicks_fact BIGINT NOT NULL DEFAULT 0,
  clicks_percentage DECIMAL(7, 2) NOT NULL DEFAULT 0,
  
  -- Reach metrics
  reach_plan BIGINT NOT NULL DEFAULT 0,
  reach_fact BIGINT NOT NULL DEFAULT 0,
  reach_percentage DECIMAL(7, 2) NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_budget_percentage CHECK (budget_percentage >= 0 AND budget_percentage <= 100),
  CONSTRAINT valid_impressions_percentage CHECK (impressions_percentage >= 0 AND impressions_percentage <= 100),
  CONSTRAINT valid_clicks_percentage CHECK (clicks_percentage >= 0 AND clicks_percentage <= 100),
  CONSTRAINT valid_reach_percentage CHECK (reach_percentage >= 0 AND reach_percentage <= 100)
);

-- Indexes
CREATE INDEX kpi_campaign_id_idx ON public.kpi (campaign_id);
CREATE INDEX kpi_date_idx ON public.kpi (date);

-- RLS Policy: Enable Row Level Security
ALTER TABLE public.kpi ENABLE ROW LEVEL SECURITY;

-- Automatic updated_at updates
CREATE TRIGGER set_kpi_updated_at
BEFORE UPDATE ON public.kpi
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Add RLS policies
-- 1. Policy for viewing KPIs (must have access to the campaign via user_id)
CREATE POLICY "Users can view their own campaign KPIs" ON public.kpi
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id
      AND c.user_id = auth.uid()
    )
  );

-- 2. Policy for inserting KPIs (must have access to the campaign via user_id)
CREATE POLICY "Users can insert KPIs for their own campaigns" ON public.kpi
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id
      AND c.user_id = auth.uid()
    )
  );

-- 3. Policy for updating KPIs (must have access to the campaign via user_id)
CREATE POLICY "Users can update their own campaign KPIs" ON public.kpi
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id
      AND c.user_id = auth.uid()
    )
  );

-- 4. Policy for deleting KPIs (must have access to the campaign via user_id)
CREATE POLICY "Users can delete their own campaign KPIs" ON public.kpi
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id
      AND c.user_id = auth.uid()
    )
  ); 