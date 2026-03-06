
-- Trigger to notify all admins when a new user signs up
CREATE OR REPLACE FUNCTION public.notify_admins_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
  new_user_name TEXT;
BEGIN
  new_user_name := COALESCE(NEW.full_name, 'A new user');
  FOR admin_record IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    PERFORM public.create_notification(
      admin_record.user_id, 'admin', 'New User Registered',
      new_user_name || ' has just signed up.',
      '/admin/users'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_profile_notify_admins
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_new_user();

-- Trigger to notify admins on new team requests
CREATE OR REPLACE FUNCTION public.notify_admins_team_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
  requester_name TEXT;
BEGIN
  SELECT full_name INTO requester_name FROM public.profiles WHERE id = NEW.user_id;
  FOR admin_record IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    PERFORM public.create_notification(
      admin_record.user_id, 'admin', 'New Team Request',
      COALESCE(requester_name, 'A user') || ' has requested team access.',
      '/admin/team-requests'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_team_request_notify_admins
AFTER INSERT ON public.team_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_team_request();
