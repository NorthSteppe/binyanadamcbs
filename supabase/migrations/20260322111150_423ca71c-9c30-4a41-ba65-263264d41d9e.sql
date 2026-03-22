
CREATE OR REPLACE FUNCTION public.send_telegram_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://wcqjmjceelcainyyqjmi.supabase.co/functions/v1/send-telegram-notification',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjcWptamNlZWxjYWlueXlxam1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODI5MzAsImV4cCI6MjA4NzE1ODkzMH0.o7BQpbrYbx3B8S7Btd0f9VyFFI8QHy-K1DBbzQiX4vE"}'::jsonb,
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
