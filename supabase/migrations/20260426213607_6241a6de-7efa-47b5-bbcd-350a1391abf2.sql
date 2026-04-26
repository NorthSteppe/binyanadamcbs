DROP POLICY IF EXISTS "Assigned therapists insert intake responses" ON public.fba_intake_responses;
DROP POLICY IF EXISTS "Assigned therapists update intake responses" ON public.fba_intake_responses;

CREATE POLICY "Assigned therapists insert intake responses"
ON public.fba_intake_responses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = fba_intake_responses.client_id
      AND ca.assignee_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Assigned therapists update intake responses"
ON public.fba_intake_responses
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = fba_intake_responses.client_id
      AND ca.assignee_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = fba_intake_responses.client_id
      AND ca.assignee_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin'::app_role)
);