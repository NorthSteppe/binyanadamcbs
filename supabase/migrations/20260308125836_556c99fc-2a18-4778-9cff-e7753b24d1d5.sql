
CREATE TABLE public.page_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  element_type text NOT NULL DEFAULT 'text',
  content text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  pos_x double precision NOT NULL DEFAULT 0,
  pos_y double precision NOT NULL DEFAULT 0,
  width double precision NOT NULL DEFAULT 300,
  height double precision NOT NULL DEFAULT 100,
  rotation double precision NOT NULL DEFAULT 0,
  z_index integer NOT NULL DEFAULT 0,
  styles jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage page elements"
  ON public.page_elements FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view visible page elements"
  ON public.page_elements FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);
