
-- Table for admin-editable page content (images + quotes)
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  section_key text NOT NULL DEFAULT 'hero',
  image_url text NOT NULL DEFAULT '',
  alt_text text NOT NULL DEFAULT '',
  quote_text text NOT NULL DEFAULT '',
  quote_author text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(page_key, section_key)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content
CREATE POLICY "Anyone can view site content"
  ON public.site_content FOR SELECT
  USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage site content"
  ON public.site_content FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default rows for each page section
INSERT INTO public.site_content (page_key, section_key, image_url, alt_text) VALUES
  ('about', 'hero', '/lovable-uploads/93c59eae-410f-4380-a222-312d8d41af41.jpg', 'Binyan Adam team working with clients'),
  ('therapy', 'hero', '', 'Therapy services'),
  ('education', 'hero', '', 'Education services'),
  ('families', 'hero', '', 'Family services'),
  ('organisations', 'hero', '', 'Organisation services'),
  ('supervision', 'hero', '', 'Supervision services');
