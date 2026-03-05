
-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can update own notifications (mark read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- System can insert notifications (via triggers with security definer)
CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'team_member'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to create notification for a user
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _type TEXT,
  _title TEXT,
  _message TEXT,
  _link TEXT DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (_user_id, _type, _title, _message, _link);
END;
$$;

-- Trigger: notify on session changes
CREATE OR REPLACE FUNCTION public.notify_session_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  client_name TEXT;
  session_title TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT full_name INTO client_name FROM public.profiles WHERE id = NEW.client_id;
    -- Notify the client
    PERFORM public.create_notification(
      NEW.client_id, 'session', 'New Session Scheduled',
      'Your session "' || NEW.title || '" has been scheduled for ' || to_char(NEW.session_date, 'DD Mon YYYY HH24:MI'),
      '/portal/booking'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      SELECT full_name INTO client_name FROM public.profiles WHERE id = NEW.client_id;
      PERFORM public.create_notification(
        NEW.client_id, 'session', 'Session ' || initcap(NEW.status),
        'Your session "' || NEW.title || '" has been ' || NEW.status || '.',
        '/portal/booking'
      );
    END IF;
    IF OLD.session_date != NEW.session_date THEN
      PERFORM public.create_notification(
        NEW.client_id, 'session', 'Session Rescheduled',
        'Your session "' || NEW.title || '" has been moved to ' || to_char(NEW.session_date, 'DD Mon YYYY HH24:MI'),
        '/portal/booking'
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.create_notification(
      OLD.client_id, 'session', 'Session Cancelled',
      'Your session "' || OLD.title || '" has been cancelled.',
      '/portal/booking'
    );
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER session_notification_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION public.notify_session_change();

-- Trigger: notify on staff todo assignment
CREATE OR REPLACE FUNCTION public.notify_staff_todo_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  creator_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.assigned_to != NEW.created_by THEN
    SELECT full_name INTO creator_name FROM public.profiles WHERE id = NEW.created_by;
    PERFORM public.create_notification(
      NEW.assigned_to, 'task', 'New Task Assigned',
      COALESCE(creator_name, 'Someone') || ' assigned you a task: "' || NEW.title || '"',
      '/admin/staff-todos'
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.is_completed = false AND NEW.is_completed = true AND NEW.created_by != NEW.assigned_to THEN
    SELECT full_name INTO creator_name FROM public.profiles WHERE id = NEW.assigned_to;
    PERFORM public.create_notification(
      NEW.created_by, 'task', 'Task Completed',
      COALESCE(creator_name, 'Someone') || ' completed the task: "' || NEW.title || '"',
      '/admin/staff-todos'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER staff_todo_notification_trigger
AFTER INSERT OR UPDATE ON public.staff_todos
FOR EACH ROW EXECUTE FUNCTION public.notify_staff_todo_change();

-- Trigger: notify on new message
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT full_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
  PERFORM public.create_notification(
    NEW.recipient_id, 'message', 'New Message',
    COALESCE(sender_name, 'Someone') || ' sent you a message.',
    '/portal/messages'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER message_notification_trigger
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();
