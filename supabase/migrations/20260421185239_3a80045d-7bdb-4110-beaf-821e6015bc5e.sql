
-- Assignments: therapist invites a client to fill the intake
CREATE TABLE public.fba_intake_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  assigned_by uuid NOT NULL,
  child_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  notes text NOT NULL DEFAULT '',
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fba_intake_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage fba intake assignments"
ON public.fba_intake_assignments FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Assigned therapists view intake assignments"
ON public.fba_intake_assignments FOR SELECT TO authenticated
USING (
  assigned_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = fba_intake_assignments.client_id
      AND ca.assignee_id = auth.uid()
  )
);

CREATE POLICY "Assigned therapists create intake assignments"
ON public.fba_intake_assignments FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'team_member'::app_role)
  AND assigned_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = fba_intake_assignments.client_id
      AND ca.assignee_id = auth.uid()
  )
);

CREATE POLICY "Assigned therapists update intake assignments"
ON public.fba_intake_assignments FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = fba_intake_assignments.client_id
      AND ca.assignee_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = fba_intake_assignments.client_id
      AND ca.assignee_id = auth.uid()
  )
);

CREATE POLICY "Clients view own intake assignments"
ON public.fba_intake_assignments FOR SELECT TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "Clients update own intake status"
ON public.fba_intake_assignments FOR UPDATE TO authenticated
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

CREATE TRIGGER touch_fba_intake_assignments
BEFORE UPDATE ON public.fba_intake_assignments
FOR EACH ROW EXECUTE FUNCTION public.touch_staff_integrations();

-- Responses: one row per assignment with a JSON body of answers
CREATE TABLE public.fba_intake_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL UNIQUE REFERENCES public.fba_intake_assignments(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fba_intake_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage fba intake responses"
ON public.fba_intake_responses FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Assigned therapists view intake responses"
ON public.fba_intake_responses FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = fba_intake_responses.client_id
      AND ca.assignee_id = auth.uid()
  )
);

CREATE POLICY "Clients view own intake responses"
ON public.fba_intake_responses FOR SELECT TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "Clients insert own intake responses"
ON public.fba_intake_responses FOR INSERT TO authenticated
WITH CHECK (
  client_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.fba_intake_assignments a
    WHERE a.id = assignment_id AND a.client_id = auth.uid()
  )
);

CREATE POLICY "Clients update own intake responses"
ON public.fba_intake_responses FOR UPDATE TO authenticated
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

CREATE TRIGGER touch_fba_intake_responses
BEFORE UPDATE ON public.fba_intake_responses
FOR EACH ROW EXECUTE FUNCTION public.touch_staff_integrations();

CREATE INDEX idx_fba_intake_assignments_client ON public.fba_intake_assignments(client_id);
CREATE INDEX idx_fba_intake_assignments_assigner ON public.fba_intake_assignments(assigned_by);
