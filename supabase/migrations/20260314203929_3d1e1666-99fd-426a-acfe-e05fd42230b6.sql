
-- Drop the overly broad team member policies on sessions
DROP POLICY IF EXISTS "Team members can view all sessions" ON public.sessions;
DROP POLICY IF EXISTS "Team members can update sessions" ON public.sessions;
DROP POLICY IF EXISTS "Team members can insert sessions" ON public.sessions;

-- Recreate with assignment-scoped access
CREATE POLICY "Team members can view assigned client sessions"
ON public.sessions FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'team_member'::app_role)
  AND EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_id = sessions.client_id AND ca.assignee_id = auth.uid()
  )
);

CREATE POLICY "Team members can update assigned client sessions"
ON public.sessions FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'team_member'::app_role)
  AND EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_id = sessions.client_id AND ca.assignee_id = auth.uid()
  )
);

CREATE POLICY "Team members can insert assigned client sessions"
ON public.sessions FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'team_member'::app_role)
  AND EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_id = sessions.client_id AND ca.assignee_id = auth.uid()
  )
);
