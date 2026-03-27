
-- Table for manual business entries (payments, meetings, expenses, income)
CREATE TABLE public.business_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  entry_type TEXT NOT NULL DEFAULT 'income', -- income, expense, meeting, payment
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  amount_cents INTEGER NOT NULL DEFAULT 0,
  client_id UUID,
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.business_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage business entries"
  ON public.business_entries FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team members can view business entries"
  ON public.business_entries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'team_member'::app_role));

-- Table for business plans
CREATE TABLE public.business_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  shared_with_team BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, completed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage business plans"
  ON public.business_plans FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team members can view shared plans"
  ON public.business_plans FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'team_member'::app_role) AND shared_with_team = true);
