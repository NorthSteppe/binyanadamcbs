
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS credentials text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS signature_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS social_linkedin text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_twitter text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_website text NOT NULL DEFAULT '';
