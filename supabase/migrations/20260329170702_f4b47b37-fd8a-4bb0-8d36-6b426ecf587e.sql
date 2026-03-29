
CREATE TABLE public.partner_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active badges"
  ON public.partner_badges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage badges"
  ON public.partner_badges FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed the uploaded badges
INSERT INTO public.partner_badges (name, image_url, display_order) VALUES
  ('Professional Standards Authority', '/badges/psa-accredited.png', 0),
  ('ACBS Member', '/badges/acbs-member.png', 1),
  ('North Steppe', '/badges/north-steppe.png', 2),
  ('Yesoiday HaTorah', '/badges/yesoiday-hatorah.png', 3),
  ('UKBA Certified', '/badges/ukba-certified.png', 4),
  ('UK Society for Behaviour Analysis', '/badges/uksba.png', 5);
