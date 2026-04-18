-- Enable scheduling extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create private storage bucket for source story files
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-sources', 'story-sources', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: admins only
CREATE POLICY "Admins can upload story sources"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'story-sources' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view story sources"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'story-sources' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update story sources"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'story-sources' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete story sources"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'story-sources' AND public.has_role(auth.uid(), 'admin'));

-- Tracking table for source files and generated posts
CREATE TABLE public.story_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by uuid NOT NULL,
  file_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  file_size_bytes integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  generated_post_id uuid,
  error_message text,
  voice_used text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.story_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage story sources"
ON public.story_sources FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_story_sources()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_touch_story_sources
BEFORE UPDATE ON public.story_sources
FOR EACH ROW EXECUTE FUNCTION public.touch_story_sources();

CREATE INDEX idx_story_sources_status ON public.story_sources(status);
CREATE INDEX idx_story_sources_created ON public.story_sources(created_at DESC);