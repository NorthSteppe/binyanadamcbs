-- Harden and unblock clinical notes access with assignment-based RLS
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

-- Remove old policy if present to avoid conflicts during iterative migrations
DROP POLICY IF EXISTS "Team members can insert notes for assigned clients" ON public.client_notes;
DROP POLICY IF EXISTS "Team members can view notes for assigned clients" ON public.client_notes;
DROP POLICY IF EXISTS "Team members can update own notes for assigned clients" ON public.client_notes;
DROP POLICY IF EXISTS "Team members can delete own notes for assigned clients" ON public.client_notes;
DROP POLICY IF EXISTS "Clients can view own client notes" ON public.client_notes;

-- Team members can create notes for clients they are assigned to; authorship is enforced
CREATE POLICY "Team members can insert notes for assigned clients"
ON public.client_notes
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'team_member'::app_role)
  AND author_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.client_assignments ca
    WHERE ca.client_id = client_notes.client_id
      AND ca.assignee_id = auth.uid()
  )
);

-- Team members can read notes for clients they are assigned to
CREATE POLICY "Team members can view notes for assigned clients"
ON public.client_notes
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'team_member'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.client_assignments ca
    WHERE ca.client_id = client_notes.client_id
      AND ca.assignee_id = auth.uid()
  )
);

-- Team members can edit only their own authored notes for assigned clients
CREATE POLICY "Team members can update own notes for assigned clients"
ON public.client_notes
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'team_member'::app_role)
  AND author_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.client_assignments ca
    WHERE ca.client_id = client_notes.client_id
      AND ca.assignee_id = auth.uid()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'team_member'::app_role)
  AND author_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.client_assignments ca
    WHERE ca.client_id = client_notes.client_id
      AND ca.assignee_id = auth.uid()
  )
);

-- Team members can delete only their own authored notes for assigned clients
CREATE POLICY "Team members can delete own notes for assigned clients"
ON public.client_notes
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'team_member'::app_role)
  AND author_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.client_assignments ca
    WHERE ca.client_id = client_notes.client_id
      AND ca.assignee_id = auth.uid()
  )
);

-- Clients can read notes written about themselves
CREATE POLICY "Clients can view own client notes"
ON public.client_notes
FOR SELECT
TO authenticated
USING (auth.uid() = client_id);