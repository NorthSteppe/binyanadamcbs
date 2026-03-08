-- Fix 1: Remove the insecure client INSERT policy on course_purchases
DROP POLICY IF EXISTS "Users can insert own purchases" ON public.course_purchases;

-- Fix 2: Tighten the ACT matrix INSERT policy to prevent cross-user injection
DROP POLICY IF EXISTS "Clients can insert own ACT entries" ON public.act_matrix_entries;

CREATE POLICY "Clients can insert own ACT entries"
ON public.act_matrix_entries
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id AND auth.uid() = filled_by)
  OR
  EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_id = act_matrix_entries.user_id AND ca.assignee_id = auth.uid()
  )
);