-- Shared touch function
CREATE OR REPLACE FUNCTION public.touch_updated_at_generic()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Client journal entries
CREATE TABLE public.client_journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  mood TEXT NOT NULL DEFAULT '',
  related_session_id UUID NULL,
  is_shared_with_therapist BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients manage own journal"
ON public.client_journal_entries FOR ALL
TO authenticated
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins view all journal entries"
ON public.client_journal_entries FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Assigned therapists view shared journal"
ON public.client_journal_entries FOR SELECT
TO authenticated
USING (
  is_shared_with_therapist = true
  AND EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = client_journal_entries.client_id
      AND ca.assignee_id = auth.uid()
  )
);

CREATE INDEX idx_journal_client ON public.client_journal_entries(client_id, created_at DESC);

CREATE TRIGGER touch_journal_updated
BEFORE UPDATE ON public.client_journal_entries
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_generic();

-- Session topics
CREATE TABLE public.session_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  client_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  is_addressed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.session_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients manage own session topics"
ON public.session_topics FOR ALL
TO authenticated
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins manage session topics"
ON public.session_topics FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Assigned therapists view session topics"
ON public.session_topics FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = session_topics.client_id
      AND ca.assignee_id = auth.uid()
  )
);

CREATE POLICY "Assigned therapists update session topics"
ON public.session_topics FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = session_topics.client_id
      AND ca.assignee_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = session_topics.client_id
      AND ca.assignee_id = auth.uid()
  )
);

CREATE INDEX idx_session_topics_session ON public.session_topics(session_id);
CREATE INDEX idx_session_topics_client ON public.session_topics(client_id, created_at DESC);

CREATE TRIGGER touch_session_topics_updated
BEFORE UPDATE ON public.session_topics
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_generic();

-- Notify therapists on new journal entry
CREATE OR REPLACE FUNCTION public.notify_therapists_journal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_name TEXT;
  assignment RECORD;
BEGIN
  IF NEW.is_shared_with_therapist = false THEN
    RETURN NEW;
  END IF;
  SELECT full_name INTO client_name FROM public.profiles WHERE id = NEW.client_id;
  FOR assignment IN
    SELECT assignee_id FROM public.client_assignments WHERE client_id = NEW.client_id
  LOOP
    PERFORM public.create_notification(
      assignment.assignee_id,
      'client_update',
      'New journal entry',
      COALESCE(client_name, 'A client') || ' shared a new journal entry.',
      '/admin/clients/' || NEW.client_id::text
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_journal_insert
AFTER INSERT ON public.client_journal_entries
FOR EACH ROW EXECUTE FUNCTION public.notify_therapists_journal();

-- Notify therapists on new session topic
CREATE OR REPLACE FUNCTION public.notify_therapists_session_topic()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_name TEXT;
  assignment RECORD;
BEGIN
  SELECT full_name INTO client_name FROM public.profiles WHERE id = NEW.client_id;
  FOR assignment IN
    SELECT assignee_id FROM public.client_assignments WHERE client_id = NEW.client_id
  LOOP
    PERFORM public.create_notification(
      assignment.assignee_id,
      'client_update',
      'New session topic',
      COALESCE(client_name, 'A client') || ' added a topic to discuss.',
      '/admin/clients/' || NEW.client_id::text
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_session_topic_insert
AFTER INSERT ON public.session_topics
FOR EACH ROW EXECUTE FUNCTION public.notify_therapists_session_topic();