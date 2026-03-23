
-- Create profile_secrets table for sensitive tokens (owner-only access)
CREATE TABLE public.profile_secrets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_feed_token TEXT,
  telegram_chat_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_secrets ENABLE ROW LEVEL SECURITY;

-- Owner-only SELECT
CREATE POLICY "Users can view own secrets"
  ON public.profile_secrets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Owner-only UPDATE
CREATE POLICY "Users can update own secrets"
  ON public.profile_secrets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Owner-only INSERT
CREATE POLICY "Users can insert own secrets"
  ON public.profile_secrets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin full access
CREATE POLICY "Admins can manage all secrets"
  ON public.profile_secrets FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Migrate existing data from profiles
INSERT INTO public.profile_secrets (user_id, calendar_feed_token, telegram_chat_id)
SELECT id, calendar_feed_token, telegram_chat_id
FROM public.profiles
WHERE calendar_feed_token IS NOT NULL OR telegram_chat_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Update handle_new_user to also create profile_secrets row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.profile_secrets (user_id, calendar_feed_token)
  VALUES (NEW.id, gen_random_uuid()::text);
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$;
