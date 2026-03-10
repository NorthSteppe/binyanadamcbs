
-- Drop the overly broad policy that lets any authenticated user see all profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Add scoped policy: staff and admin can view all profiles, others only own
CREATE POLICY "Staff and admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'team_member')
    OR auth.uid() = id
  );
