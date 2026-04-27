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
  admin_record RECORD;
  assignment_record RECORD;
  notified UUID[] := ARRAY[]::UUID[];
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT full_name INTO client_name FROM public.profiles WHERE id = NEW.client_id;

    -- Notify the client themselves
    PERFORM public.create_notification(
      NEW.client_id, 'session', 'New Session Scheduled',
      'Your session "' || NEW.title || '" has been scheduled for ' || to_char(NEW.session_date, 'DD Mon YYYY HH24:MI'),
      '/portal/booking'
    );
    notified := array_append(notified, NEW.client_id);

    -- Notify explicit attendees
    IF NEW.attendee_ids IS NOT NULL THEN
      FOREACH attendee_id IN ARRAY NEW.attendee_ids
      LOOP
        IF NOT (attendee_id = ANY(notified)) THEN
          PERFORM public.create_notification(
            attendee_id, 'session', 'Session Invitation',
            'You have been invited to "' || NEW.title || '" on ' || to_char(NEW.session_date, 'DD Mon YYYY HH24:MI'),
            '/admin/calendar'
          );
          notified := array_append(notified, attendee_id);
        END IF;
      END LOOP;
    END IF;

    -- Notify therapists assigned to this client
    FOR assignment_record IN
      SELECT assignee_id FROM public.client_assignments WHERE client_id = NEW.client_id
    LOOP
      IF NOT (assignment_record.assignee_id = ANY(notified)) THEN
        PERFORM public.create_notification(
          assignment_record.assignee_id, 'session', 'Client Booked a Session',
          COALESCE(client_name, 'A client') || ' booked "' || NEW.title || '" on ' || to_char(NEW.session_date, 'DD Mon YYYY HH24:MI'),
          '/admin/calendar'
        );
        notified := array_append(notified, assignment_record.assignee_id);
      END IF;
    END LOOP;

    -- Notify all admins
    FOR admin_record IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
    LOOP
      IF NOT (admin_record.user_id = ANY(notified)) THEN
        PERFORM public.create_notification(
          admin_record.user_id, 'session', 'New Session Booked',
          COALESCE(client_name, 'A client') || ' booked "' || NEW.title || '" on ' || to_char(NEW.session_date, 'DD Mon YYYY HH24:MI'),
          '/admin/calendar'
        );
        notified := array_append(notified, admin_record.user_id);
      END IF;
    END LOOP;

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

    -- Notes updated
    IF OLD.notes IS DISTINCT FROM NEW.notes AND NEW.notes IS NOT NULL AND NEW.notes != '' THEN
      notif_title := 'Session Notes Updated';
      notif_message := 'Notes have been updated for "' || NEW.title || '" on ' || to_char(NEW.session_date, 'DD Mon YYYY');

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

    -- Also notify admins on cancellation
    FOR admin_record IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
    LOOP
      IF admin_record.user_id != OLD.client_id THEN
        PERFORM public.create_notification(
          admin_record.user_id, 'session', 'Session Cancelled',
          'Session "' || OLD.title || '" has been cancelled.',
          '/admin/calendar'
        );
      END IF;
    END LOOP;

    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;

-- Also backfill the missing notification for Calin's just-booked assessment to all admins
DO $$
DECLARE
  s RECORD;
  admin_record RECORD;
  client_name TEXT;
BEGIN
  SELECT * INTO s FROM public.sessions WHERE id = 'f2ebbec6-82fb-4c01-9ca6-cbf089c9554d';
  IF FOUND THEN
    SELECT full_name INTO client_name FROM public.profiles WHERE id = s.client_id;
    FOR admin_record IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
    LOOP
      PERFORM public.create_notification(
        admin_record.user_id, 'session', 'New Session Booked',
        COALESCE(client_name, 'A client') || ' booked "' || s.title || '" on ' || to_char(s.session_date, 'DD Mon YYYY HH24:MI'),
        '/admin/calendar'
      );
    END LOOP;
  END IF;
END $$;