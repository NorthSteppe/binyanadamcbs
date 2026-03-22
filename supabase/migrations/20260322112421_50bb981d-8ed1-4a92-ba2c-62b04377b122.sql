ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS calendar_feed_token text DEFAULT NULL;

-- Auto-generate a token for existing users who don't have one
UPDATE public.profiles SET calendar_feed_token = gen_random_uuid()::text WHERE calendar_feed_token IS NULL;