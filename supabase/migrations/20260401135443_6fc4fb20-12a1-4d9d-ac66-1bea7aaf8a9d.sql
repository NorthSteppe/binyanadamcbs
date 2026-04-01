
-- Fix: Restrict team member access to manual_clients - only see ones they created or ones linked to their assigned clients
DROP POLICY IF EXISTS "Team members can view assigned manual clients" ON public.manual_clients;

CREATE POLICY "Team members can view assigned manual clients"
  ON public.manual_clients
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'team_member'::app_role)
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.client_assignments ca
        WHERE ca.client_id = manual_clients.linked_user_id
        AND ca.assignee_id = auth.uid()
      )
    )
  );
