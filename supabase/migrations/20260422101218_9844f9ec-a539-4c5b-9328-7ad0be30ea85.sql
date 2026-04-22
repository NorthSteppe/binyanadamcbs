CREATE POLICY "Assigned therapists insert intake responses"
ON public.fba_intake_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = fba_intake_responses.client_id
      AND ca.assignee_id = auth.uid()
  )
);

CREATE POLICY "Assigned therapists update intake responses"
ON public.fba_intake_responses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = fba_intake_responses.client_id
      AND ca.assignee_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = fba_intake_responses.client_id
      AND ca.assignee_id = auth.uid()
  )
);