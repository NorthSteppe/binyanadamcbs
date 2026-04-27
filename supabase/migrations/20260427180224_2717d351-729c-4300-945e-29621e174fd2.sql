-- Restrict admin journal access to entries the client chose to share.
-- Private journal entries (is_shared_with_therapist = false) remain visible only to the client.
DROP POLICY IF EXISTS "Admins view all journal entries" ON public.client_journal_entries;

CREATE POLICY "Admins view shared journal entries"
ON public.client_journal_entries FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND is_shared_with_therapist = true
);