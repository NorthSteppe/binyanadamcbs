
-- Add linked_user_id to manual_clients to allow linking to registered accounts
ALTER TABLE public.manual_clients ADD COLUMN linked_user_id uuid DEFAULT NULL;

-- Create a function to transfer all manual client data to a registered user
CREATE OR REPLACE FUNCTION public.link_manual_client_to_user(
  _manual_client_id uuid,
  _target_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update all sessions that reference this manual client to point to the real user
  UPDATE public.sessions
  SET client_id = _target_user_id,
      manual_client_id = _manual_client_id
  WHERE manual_client_id = _manual_client_id;

  -- Also update any sessions where client_id was the admin placeholder and manual_client_id matches
  -- (legacy pattern where admin's own ID was used as client_id for manual clients)

  -- Mark the manual client as linked
  UPDATE public.manual_clients
  SET linked_user_id = _target_user_id,
      updated_at = now()
  WHERE id = _manual_client_id;
END;
$$;
