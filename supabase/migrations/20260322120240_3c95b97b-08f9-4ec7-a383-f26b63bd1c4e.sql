
CREATE TABLE public.supervisee_case_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisee_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  client_name text NOT NULL DEFAULT '',
  client_age text NOT NULL DEFAULT '',
  diagnosis text NOT NULL DEFAULT '',
  session_date timestamptz NOT NULL DEFAULT now(),
  session_type text NOT NULL DEFAULT 'direct',
  duration_minutes integer NOT NULL DEFAULT 60,
  setting text NOT NULL DEFAULT '',
  targets_addressed text NOT NULL DEFAULT '',
  interventions_used text NOT NULL DEFAULT '',
  client_response text NOT NULL DEFAULT '',
  data_summary text NOT NULL DEFAULT '',
  next_steps text NOT NULL DEFAULT '',
  supervision_notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft'
);

ALTER TABLE public.supervisee_case_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supervisees can manage own case logs"
ON public.supervisee_case_logs FOR ALL TO authenticated
USING (auth.uid() = supervisee_id)
WITH CHECK (auth.uid() = supervisee_id);

CREATE POLICY "Admins can manage all case logs"
ON public.supervisee_case_logs FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Supervisors can view assigned supervisee logs"
ON public.supervisee_case_logs FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'team_member'::app_role) AND
  EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_id = supervisee_case_logs.supervisee_id
    AND ca.assignee_id = auth.uid()
  )
);

CREATE POLICY "Supervisees can upload own documents"
ON public.client_documents FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'supervisee'::app_role) AND client_id = auth.uid() AND uploaded_by = auth.uid()
);

CREATE POLICY "Supervisees can view own documents"
ON public.client_documents FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'supervisee'::app_role) AND client_id = auth.uid()
);
