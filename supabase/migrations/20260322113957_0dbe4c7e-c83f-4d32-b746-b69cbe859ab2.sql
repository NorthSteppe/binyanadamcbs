
-- Create a secure view for staff that excludes sensitive columns
CREATE OR REPLACE VIEW public.profiles_safe AS
SELECT id, full_name, avatar_url, created_at, updated_at
FROM public.profiles;

-- Create a security definer function for staff to query profiles safely
CREATE OR REPLACE FUNCTION public.get_safe_profiles()
RETURNS TABLE(id uuid, full_name text, avatar_url text, created_at timestamptz, updated_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, full_name, avatar_url, created_at, updated_at
  FROM public.profiles;
$$;

-- Drop the overly broad staff SELECT policy
DROP POLICY IF EXISTS "Staff and admins can view all profiles" ON public.profiles;

-- Drop the redundant admin-only SELECT policy (we'll recreate a combined one)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Admins can see ALL columns of all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Team members can only see profiles of their assigned clients (safe columns enforced in app code)
CREATE POLICY "Team members can view assigned client profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'team_member') AND (
    EXISTS (
      SELECT 1 FROM public.client_assignments ca
      WHERE ca.client_id = profiles.id AND ca.assignee_id = auth.uid()
    )
  )
);
