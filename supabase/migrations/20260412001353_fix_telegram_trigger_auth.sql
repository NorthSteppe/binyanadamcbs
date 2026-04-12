
-- Fix: DB trigger was calling send-telegram-notification with the anon key,
-- which failed the edge function's auth check (auth.getUser(anon_key) = no user).
-- Now uses the service-role key so the edge function treats it as a trusted system call.

CREATE OR REPLACE FUNCTION public.send_telegram_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  service_role_key text;
BEGIN
  service_role_key := current_setting('app.settings.supabase_service_role_key', true);

  PERFORM net.http_post(
    url := 'https://wcqjmjceelcainyyqjmi.supabase.co/functions/v1/send-telegram-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
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
