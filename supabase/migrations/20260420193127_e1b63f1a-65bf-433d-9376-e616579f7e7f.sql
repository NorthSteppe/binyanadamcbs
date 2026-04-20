-- Client overview: stage, tags, risk, internal note (manual fields admin/staff fill in)
CREATE TABLE public.client_overview (
  client_id UUID PRIMARY KEY,
  stage TEXT NOT NULL DEFAULT 'new',
  tags TEXT[] NOT NULL DEFAULT '{}',
  risk_level TEXT NOT NULL DEFAULT 'low',
  risk_note TEXT NOT NULL DEFAULT '',
  internal_summary TEXT NOT NULL DEFAULT '',
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_overview ENABLE ROW LEVEL SECURITY;

-- Admins can manage all
CREATE POLICY "Admins manage client overview"
ON public.client_overview FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Assigned therapists can view + update for their assigned clients
CREATE POLICY "Assigned staff view client overview"
ON public.client_overview FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.client_assignments ca
  WHERE ca.client_id = client_overview.client_id
    AND ca.assignee_id = auth.uid()
));

CREATE POLICY "Assigned staff update client overview"
ON public.client_overview FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.client_assignments ca
  WHERE ca.client_id = client_overview.client_id
    AND ca.assignee_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.client_assignments ca
  WHERE ca.client_id = client_overview.client_id
    AND ca.assignee_id = auth.uid()
));

CREATE POLICY "Assigned staff insert client overview"
ON public.client_overview FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.client_assignments ca
  WHERE ca.client_id = client_overview.client_id
    AND ca.assignee_id = auth.uid()
));

-- Auto-update updated_at
CREATE TRIGGER client_overview_touch
BEFORE UPDATE ON public.client_overview
FOR EACH ROW EXECUTE FUNCTION public.touch_story_sources();
