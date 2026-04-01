
-- Update notify_new_message to include sender ID in the link
CREATE OR REPLACE FUNCTION public.notify_new_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT full_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
  PERFORM public.create_notification(
    NEW.recipient_id, 'message', 'New Message',
    COALESCE(sender_name, 'Someone') || ' sent you a message.',
    '/portal/messages?user=' || NEW.sender_id::text
  );
  RETURN NEW;
END;
$function$;
