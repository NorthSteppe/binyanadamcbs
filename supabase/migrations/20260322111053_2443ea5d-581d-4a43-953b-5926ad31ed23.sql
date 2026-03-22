
-- Create a function that sends Telegram notifications via edge function
-- This will be called by the existing notification triggers
CREATE OR REPLACE FUNCTION public.send_telegram_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Fire-and-forget HTTP call to the edge function via pg_net
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-telegram-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true)
    ),
    body := jsonb_build_object(
      'user_id', NEW.user_id::text,
      'title', NEW.title,
      'message', NEW.message,
      'link', NEW.link
    )
  );
  RETURN NEW;
END;
$$;

-- Attach trigger to notifications table
DROP TRIGGER IF EXISTS on_notification_send_telegram ON public.notifications;
CREATE TRIGGER on_notification_send_telegram
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_telegram_on_notification();
