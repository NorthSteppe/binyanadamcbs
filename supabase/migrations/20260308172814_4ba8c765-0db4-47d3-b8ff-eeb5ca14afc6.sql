
ALTER TABLE public.sessions 
  ADD COLUMN IF NOT EXISTS meeting_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS meeting_platform text DEFAULT '',
  ADD COLUMN IF NOT EXISTS attendee_ids uuid[] DEFAULT '{}';
