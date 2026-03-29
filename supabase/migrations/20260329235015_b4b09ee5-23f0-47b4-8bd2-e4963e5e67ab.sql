
CREATE OR REPLACE FUNCTION public.notify_session_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  client_name TEXT;
  attendee_id UUID;
  notif_title TEXT;
  notif_message TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify the client
    PERFORM public.create_notification(
      NEW.client_id, 'session', 'New Session Scheduled',
      'Your session "' || NEW.title || '" has been scheduled for ' || to_char(NEW.session_date, 'DD Mon YYYY HH24:MI'),
      '/portal/booking'
    );
    -- Notify all attendees
    IF NEW.attendee_ids IS NOT NULL THEN
      FOREACH attendee_id IN ARRAY NEW.attendee_ids
      LOOP
        IF attendee_id != NEW.client_id THEN
          PERFORM public.create_notification(
            attendee_id, 'session', 'Session Invitation',
            'You have been invited to "' || NEW.title || '" on ' || to_char(NEW.session_date, 'DD Mon YYYY HH24:MI'),
            '/admin/calendar'
          );
        END IF;
      END LOOP;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Status change
    IF OLD.status != NEW.status THEN
      notif_title := 'Session ' || initcap(NEW.status);
      notif_message := 'Session "' || NEW.title || '" has been ' || NEW.status || '.';

      PERFORM public.create_notification(NEW.client_id, 'session', notif_title, notif_message, '/portal/booking');

      IF NEW.attendee_ids IS NOT NULL THEN
        FOREACH attendee_id IN ARRAY NEW.attendee_ids
        LOOP
          IF attendee_id != NEW.client_id THEN
            PERFORM public.create_notification(attendee_id, 'session', notif_title, notif_message, '/admin/calendar');
          END IF;
        END LOOP;
      END IF;
    END IF;

    -- Date/time change
    IF OLD.session_date != NEW.session_date THEN
      notif_title := 'Session Rescheduled';
      notif_message := 'Session "' || NEW.title || '" has been moved to ' || to_char(NEW.session_date, 'DD Mon YYYY HH24:MI');

      PERFORM public.create_notification(NEW.client_id, 'session', notif_title, notif_message, '/portal/booking');

      IF NEW.attendee_ids IS NOT NULL THEN
        FOREACH attendee_id IN ARRAY NEW.attendee_ids
        LOOP
          IF attendee_id != NEW.client_id THEN
            PERFORM public.create_notification(attendee_id, 'session', notif_title, notif_message, '/admin/calendar');
          END IF;
        END LOOP;
      END IF;
    END IF;

    -- Attendee list changed - notify newly added attendees
    IF OLD.attendee_ids IS DISTINCT FROM NEW.attendee_ids AND NEW.attendee_ids IS NOT NULL THEN
      FOREACH attendee_id IN ARRAY NEW.attendee_ids
      LOOP
        IF attendee_id != NEW.client_id AND (OLD.attendee_ids IS NULL OR NOT (attendee_id = ANY(OLD.attendee_ids))) THEN
          PERFORM public.create_notification(
            attendee_id, 'session', 'Session Invitation',
            'You have been invited to "' || NEW.title || '" on ' || to_char(NEW.session_date, 'DD Mon YYYY HH24:MI'),
            '/admin/calendar'
          );
        END IF;
      END LOOP;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.create_notification(
      OLD.client_id, 'session', 'Session Cancelled',
      'Your session "' || OLD.title || '" has been cancelled.',
      '/portal/booking'
    );
    IF OLD.attendee_ids IS NOT NULL THEN
      FOREACH attendee_id IN ARRAY OLD.attendee_ids
      LOOP
        IF attendee_id != OLD.client_id THEN
          PERFORM public.create_notification(
            attendee_id, 'session', 'Session Cancelled',
            'Session "' || OLD.title || '" has been cancelled.',
            '/admin/calendar'
          );
        END IF;
      END LOOP;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;
