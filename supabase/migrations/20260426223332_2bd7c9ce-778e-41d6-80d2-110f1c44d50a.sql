-- Revoke column-level SELECT on the sensitive compensation column from anon and public roles
REVOKE SELECT (default_session_rate_cents) ON public.team_members FROM anon;
REVOKE SELECT (default_session_rate_cents) ON public.team_members FROM authenticated;

-- Re-grant SELECT on all other columns to anon and authenticated (preserving public team directory)
GRANT SELECT (
  id, name, role, bio, initials, slug, avatar_url, display_order, is_active,
  credentials, signature_url, social_linkedin, social_twitter, social_website,
  user_id, long_bio, profile_image_url, created_at, updated_at
) ON public.team_members TO anon, authenticated;

-- Create a SECURITY DEFINER function to expose the rate only to admins and team members
CREATE OR REPLACE FUNCTION public.get_team_member_rate(_team_member_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT default_session_rate_cents
  FROM public.team_members
  WHERE id = _team_member_id
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'team_member'::public.app_role)
    );
$$;

REVOKE ALL ON FUNCTION public.get_team_member_rate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_team_member_rate(uuid) TO authenticated;