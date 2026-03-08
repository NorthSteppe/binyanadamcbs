-- Add notes column to sessions table for Plaud.ai summaries and other notes
ALTER TABLE public.sessions ADD COLUMN notes text DEFAULT '';

-- Add plaud_recording_id to track which Plaud recording is linked
ALTER TABLE public.sessions ADD COLUMN plaud_recording_id text DEFAULT NULL;