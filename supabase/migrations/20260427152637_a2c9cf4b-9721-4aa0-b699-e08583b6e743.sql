-- Restore EXECUTE on has_role for authenticated and anon roles.
-- This function is used inside RLS policies across the schema; revoking
-- execute caused all role checks to fail and broke admin access.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;