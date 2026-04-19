-- Add style_json column to content_overrides for PowerPoint-style controls
ALTER TABLE public.content_overrides
ADD COLUMN IF NOT EXISTS style_json jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Make sure unique on content_key for upserts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'content_overrides_content_key_unique'
  ) THEN
    ALTER TABLE public.content_overrides
      ADD CONSTRAINT content_overrides_content_key_unique UNIQUE (content_key);
  END IF;
END $$;