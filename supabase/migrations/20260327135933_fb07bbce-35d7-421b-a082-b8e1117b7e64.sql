
CREATE OR REPLACE FUNCTION public.email_on_notification()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  recipient_email TEXT;
  is_suppressed BOOLEAN;
  msg_id TEXT;
  unsub_token TEXT;
  site_name TEXT := 'Binyan Adam CBS';
  site_url TEXT := 'https://bacbs.com';
  sender_domain TEXT := 'notify.bacbs.com';
  from_domain TEXT := 'bacbs.com';
  email_html TEXT;
  email_text TEXT;
  link_button TEXT := '';
  link_text TEXT := '';
BEGIN
  SELECT email INTO recipient_email
  FROM auth.users
  WHERE id = NEW.user_id;

  IF recipient_email IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.suppressed_emails
    WHERE email = lower(recipient_email)
  ) INTO is_suppressed;

  IF is_suppressed THEN
    RETURN NEW;
  END IF;

  -- Get or create unsubscribe token
  SELECT token INTO unsub_token
  FROM public.email_unsubscribe_tokens
  WHERE email = lower(recipient_email) AND used_at IS NULL;

  IF unsub_token IS NULL THEN
    unsub_token := encode(gen_random_bytes(32), 'hex');
    INSERT INTO public.email_unsubscribe_tokens (token, email)
    VALUES (unsub_token, lower(recipient_email))
    ON CONFLICT (email) DO NOTHING;
    -- Re-read in case of race
    SELECT token INTO unsub_token
    FROM public.email_unsubscribe_tokens
    WHERE email = lower(recipient_email) AND used_at IS NULL;
  END IF;

  msg_id := gen_random_uuid()::text;

  IF NEW.link IS NOT NULL AND NEW.link != '' THEN
    link_button := '<a href="' || site_url || NEW.link || '" style="display:inline-block;background-color:hsl(174,42%,32%);color:#ffffff;font-size:15px;border-radius:12px;padding:14px 24px;text-decoration:none;margin-top:8px;">View Details</a>';
    link_text := 'View details: ' || site_url || NEW.link;
  END IF;

  email_html := '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head><body style="background-color:#ffffff;font-family:DM Sans,Arial,sans-serif;margin:0;padding:0;">'
    || '<div style="padding:32px 28px;max-width:600px;margin:0 auto;">'
    || '<img src="https://wcqjmjceelcainyyqjmi.supabase.co/storage/v1/object/public/email-assets/binyan-logo.png?v=1" alt="Binyan" width="120" style="margin-bottom:24px;" />'
    || '<h1 style="font-size:24px;font-weight:bold;color:hsl(192,35%,18%);margin:0 0 20px;">' || COALESCE(NEW.title, 'New Notification') || '</h1>'
    || '<p style="font-size:15px;color:hsl(192,15%,46%);line-height:1.6;margin:0 0 28px;">' || COALESCE(NEW.message, 'You have a new notification.') || '</p>'
    || link_button
    || '<p style="font-size:12px;color:#999999;margin:32px 0 0;">— The ' || site_name || ' Team</p>'
    || '</div></body></html>';

  email_text := COALESCE(NEW.title, 'New Notification') || E'\n\n' || COALESCE(NEW.message, 'You have a new notification.') || E'\n\n' || link_text;

  INSERT INTO public.email_send_log (message_id, template_name, recipient_email, status)
  VALUES (msg_id, 'notification', recipient_email, 'pending');

  PERFORM public.enqueue_email(
    'transactional_emails',
    jsonb_build_object(
      'message_id', msg_id,
      'to', recipient_email,
      'from', site_name || ' <noreply@' || from_domain || '>',
      'sender_domain', sender_domain,
      'subject', COALESCE(NEW.title, 'New Notification'),
      'html', email_html,
      'text', email_text,
      'purpose', 'transactional',
      'label', 'notification',
      'idempotency_key', 'notification-' || NEW.id,
      'unsubscribe_token', unsub_token,
      'queued_at', now()::text
    )
  );

  RETURN NEW;
END;
$function$;
