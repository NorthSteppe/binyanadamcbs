
CREATE TABLE public.content_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL UNIQUE,
  content_value text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'text',
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage content overrides"
  ON public.content_overrides FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view content overrides"
  ON public.content_overrides FOR SELECT
  TO anon, authenticated
  USING (true);
