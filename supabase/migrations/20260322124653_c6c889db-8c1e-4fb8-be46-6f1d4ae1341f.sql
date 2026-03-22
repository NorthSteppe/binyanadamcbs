
-- Drop the trigger that uses net.http_post (which requires pg_net extension)
DROP TRIGGER IF EXISTS on_notification_send_telegram ON public.notifications;
DROP FUNCTION IF EXISTS public.send_telegram_on_notification();
