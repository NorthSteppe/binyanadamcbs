
-- 1) Tighten realtime.messages SELECT policy: exact match user-scoped topic instead of substring LIKE
DROP POLICY IF EXISTS "Users receive own realtime events" ON realtime.messages;

CREATE POLICY "Users receive own realtime events"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = ('user:' || (auth.uid())::text)
);

-- 2) Lock down EXECUTE on all SECURITY DEFINER functions in public schema.
--    Revoke from PUBLIC + anon + authenticated, then re-grant only where needed.

REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_on_notification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_assistant_config() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_safe_profiles() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_team_member_rate(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_session_financial_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.link_manual_client_to_user(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_admins_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_admins_team_request() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_session_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_staff_todo_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.publish_scheduled_posts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;

-- Re-grant EXECUTE only on functions intentionally exposed to clients

-- Public assistant config: used by anonymous visitors AND signed-in users
GRANT EXECUTE ON FUNCTION public.get_public_assistant_config() TO anon, authenticated;

-- Safe profiles directory: used by signed-in users (messages, admin tools)
GRANT EXECUTE ON FUNCTION public.get_safe_profiles() TO authenticated;

-- Team member rate: function itself enforces admin/team_member role
GRANT EXECUTE ON FUNCTION public.get_team_member_rate(uuid) TO authenticated;

-- create_notification used by admin calendar; restrict to authenticated
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text) TO authenticated;

-- has_role: used by other definer functions and policies; service_role keeps access automatically
-- (RLS policies invoking has_role run with table-owner privileges, no client EXECUTE needed.)

-- 3) Harden link_manual_client_to_user with internal admin role check
CREATE OR REPLACE FUNCTION public.link_manual_client_to_user(_manual_client_id uuid, _target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only admins may link manual client records to user accounts
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Permission denied: admin role required';
  END IF;

  UPDATE public.sessions
  SET client_id = _target_user_id, manual_client_id = _manual_client_id
  WHERE manual_client_id = _manual_client_id;

  UPDATE public.client_notes SET client_id = _target_user_id WHERE manual_client_id = _manual_client_id AND client_id IS NULL;
  UPDATE public.client_todos SET client_id = _target_user_id WHERE manual_client_id = _manual_client_id AND client_id IS NULL;
  UPDATE public.client_documents SET client_id = _target_user_id WHERE manual_client_id = _manual_client_id AND client_id IS NULL;
  UPDATE public.clinical_entries SET client_id = _target_user_id WHERE manual_client_id = _manual_client_id AND client_id IS NULL;

  UPDATE public.manual_clients
  SET linked_user_id = _target_user_id, updated_at = now()
  WHERE id = _manual_client_id;
END;
$function$;

-- Re-grant EXECUTE for admin-only RPC (authenticated; internal check enforces admin)
GRANT EXECUTE ON FUNCTION public.link_manual_client_to_user(uuid, uuid) TO authenticated;
