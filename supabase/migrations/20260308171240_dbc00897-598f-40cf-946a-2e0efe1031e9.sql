
-- Clinical entries table for all CBS data collection tools
CREATE TABLE public.clinical_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  filled_by uuid NOT NULL,
  tool_type text NOT NULL, -- 'abc', 'functional_assessment', 'values_bullseye', 'hexaflex', 'behaviour_log', 'case_formulation'
  entry_data jsonb NOT NULL DEFAULT '{}',
  notes text NOT NULL DEFAULT '',
  entry_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.clinical_entries ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins can manage clinical entries"
ON public.clinical_entries FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Assigned therapists can manage entries for their clients
CREATE POLICY "Therapists can manage assigned client entries"
ON public.clinical_entries FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.client_assignments ca
  WHERE ca.client_id = clinical_entries.client_id AND ca.assignee_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.client_assignments ca
  WHERE ca.client_id = clinical_entries.client_id AND ca.assignee_id = auth.uid()
));

-- Clients can view their own entries
CREATE POLICY "Clients can view own clinical entries"
ON public.clinical_entries FOR SELECT TO authenticated
USING (auth.uid() = client_id);
