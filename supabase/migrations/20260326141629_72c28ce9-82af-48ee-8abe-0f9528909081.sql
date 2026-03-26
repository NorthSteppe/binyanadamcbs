
CREATE OR REPLACE FUNCTION public.notify_staff_todo_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  creator_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.assigned_to != NEW.created_by THEN
    SELECT full_name INTO creator_name FROM public.profiles WHERE id = NEW.created_by;
    PERFORM public.create_notification(
      NEW.assigned_to, 'task', 'New Task Assigned',
      COALESCE(creator_name, 'Someone') || ' assigned you a task: "' || NEW.title || '"',
      '/staff/staff-todos'
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.is_completed = false AND NEW.is_completed = true AND NEW.created_by != NEW.assigned_to THEN
    SELECT full_name INTO creator_name FROM public.profiles WHERE id = NEW.assigned_to;
    PERFORM public.create_notification(
      NEW.created_by, 'task', 'Task Completed',
      COALESCE(creator_name, 'Someone') || ' completed the task: "' || NEW.title || '"',
      '/staff/staff-todos'
    );
  END IF;
  RETURN NEW;
END;
$function$;
