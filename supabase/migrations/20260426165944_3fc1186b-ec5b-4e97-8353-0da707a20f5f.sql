
-- 1. Global pathway step templates (admin-editable defaults)
CREATE TABLE public.pathway_step_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_kind text NOT NULL DEFAULT 'support', -- 'support' or 'fba'
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Circle',
  link text NOT NULL DEFAULT '',
  step_type text NOT NULL DEFAULT 'link', -- 'link' | 'agreement' | 'intake' | 'report' | 'sessions' | 'custom'
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pathway_step_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pathway templates"
ON public.pathway_step_templates FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins manage pathway templates"
ON public.pathway_step_templates FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Per-client pathway steps (clones of templates + custom additions)
CREATE TABLE public.client_pathway_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  pathway_kind text NOT NULL DEFAULT 'support',
  template_id uuid REFERENCES public.pathway_step_templates(id) ON DELETE SET NULL,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Circle',
  link text NOT NULL DEFAULT '',
  step_type text NOT NULL DEFAULT 'link',
  display_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- 'pending' | 'in_progress' | 'completed' | 'skipped'
  completed_at timestamptz,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_pathway_steps_client ON public.client_pathway_steps(client_id, pathway_kind, display_order);

ALTER TABLE public.client_pathway_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage client pathway steps"
ON public.client_pathway_steps FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Assigned therapists manage client pathway steps"
ON public.client_pathway_steps FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM client_assignments ca WHERE ca.client_id = client_pathway_steps.client_id AND ca.assignee_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM client_assignments ca WHERE ca.client_id = client_pathway_steps.client_id AND ca.assignee_id = auth.uid()));

CREATE POLICY "Clients view own pathway steps"
ON public.client_pathway_steps FOR SELECT
TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "Clients update own pathway step status"
ON public.client_pathway_steps FOR UPDATE
TO authenticated
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

-- 3. Client profile extras (photo + basic info shown on pathway page)
CREATE TABLE public.client_profile_extras (
  client_id uuid PRIMARY KEY,
  photo_url text NOT NULL DEFAULT '',
  child_name text NOT NULL DEFAULT '',
  date_of_birth date,
  diagnosis text NOT NULL DEFAULT '',
  parent_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_profile_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage client profile extras"
ON public.client_profile_extras FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Assigned therapists manage client profile extras"
ON public.client_profile_extras FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM client_assignments ca WHERE ca.client_id = client_profile_extras.client_id AND ca.assignee_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM client_assignments ca WHERE ca.client_id = client_profile_extras.client_id AND ca.assignee_id = auth.uid()));

CREATE POLICY "Clients view own profile extras"
ON public.client_profile_extras FOR SELECT
TO authenticated
USING (client_id = auth.uid());

-- 4. Touch triggers
CREATE OR REPLACE FUNCTION public.touch_pathway_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_touch_pathway_templates BEFORE UPDATE ON public.pathway_step_templates
FOR EACH ROW EXECUTE FUNCTION public.touch_pathway_updated_at();

CREATE TRIGGER trg_touch_client_pathway_steps BEFORE UPDATE ON public.client_pathway_steps
FOR EACH ROW EXECUTE FUNCTION public.touch_pathway_updated_at();

CREATE TRIGGER trg_touch_client_profile_extras BEFORE UPDATE ON public.client_profile_extras
FOR EACH ROW EXECUTE FUNCTION public.touch_pathway_updated_at();

-- 5. Storage bucket for client photos
INSERT INTO storage.buckets (id, name, public) VALUES ('client-photos', 'client-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read client photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-photos');

CREATE POLICY "Admins upload client photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update client photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'client-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete client photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'client-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Therapists upload client photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-photos' AND has_role(auth.uid(), 'team_member'::app_role));

CREATE POLICY "Therapists update client photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'client-photos' AND has_role(auth.uid(), 'team_member'::app_role));

-- 6. Seed default Support Pathway steps
INSERT INTO public.pathway_step_templates (pathway_kind, label, description, icon, link, step_type, display_order) VALUES
('support', 'Initial Enquiry', 'Family makes contact and shares concerns.', 'Phone', '/contact', 'link', 10),
('support', 'Support Agreement', 'Sign the support agreement to formalise the partnership.', 'FileSignature', '/portal/support-agreement', 'agreement', 20),
('support', 'FBA Intake', 'Parents complete the Hanley intake questionnaire.', 'ClipboardList', '/portal/fba-intake', 'intake', 30),
('support', 'FBA Report', 'Clinical team analyses intake and observations into a report.', 'FileText', '/admin/fba-report', 'report', 40),
('support', 'Skill-Based Treatment', 'Sessions begin building skills in place of challenging behaviour.', 'Sparkles', '/portal/booking', 'sessions', 50),
('support', 'Ongoing Review', 'Progress reviewed and plan refined regularly.', 'RefreshCcw', '', 'custom', 60);

-- 7. Seed default FBA process sub-steps (used inside the FBA pathway)
INSERT INTO public.pathway_step_templates (pathway_kind, label, description, icon, link, step_type, display_order) VALUES
('fba', 'Intake Sent', 'Hanley intake sent to the family.', 'Send', '/staff/fba-intakes', 'intake', 10),
('fba', 'Intake In Progress', 'Family is filling in the intake.', 'PenLine', '/staff/fba-intakes', 'intake', 20),
('fba', 'Intake Submitted', 'Intake completed and ready for review.', 'CheckCircle2', '/staff/fba-intakes', 'intake', 30),
('fba', 'Open-Ended Interview', 'Clinician interviews caregivers using Hanley protocol.', 'Mic', '/admin/fba-report', 'report', 40),
('fba', 'IISCA Observation', 'Practical functional analysis to confirm function.', 'Eye', '/admin/fba-report', 'report', 50),
('fba', 'Report Drafted', 'FBA report written and reviewed.', 'FileText', '/admin/fba-report', 'report', 60),
('fba', 'Report Shared', 'Report shared with family and treatment plan begins.', 'Share2', '/admin/fba-report', 'report', 70);
