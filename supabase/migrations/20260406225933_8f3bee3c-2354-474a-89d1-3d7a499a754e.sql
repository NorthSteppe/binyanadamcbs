
ALTER TABLE public.team_members
  ADD COLUMN user_id uuid DEFAULT NULL,
  ADD COLUMN long_bio text NOT NULL DEFAULT '',
  ADD COLUMN profile_image_url text DEFAULT NULL;
