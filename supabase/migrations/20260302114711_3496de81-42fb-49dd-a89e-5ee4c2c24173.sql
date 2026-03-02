
-- Create hero_images table for landing page slideshow
CREATE TABLE public.hero_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  interval_seconds INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

-- Public read for active images (landing page)
CREATE POLICY "Anyone can view active hero images"
ON public.hero_images
FOR SELECT
USING (is_active = true);

-- Admins can manage all hero images
CREATE POLICY "Admins can manage hero images"
ON public.hero_images
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for hero images
INSERT INTO storage.buckets (id, name, public) VALUES ('hero-images', 'hero-images', true);

-- Public read access for hero images bucket
CREATE POLICY "Hero images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-images');

-- Admins can upload hero images
CREATE POLICY "Admins can upload hero images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hero-images' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update hero images
CREATE POLICY "Admins can update hero images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hero-images' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete hero images
CREATE POLICY "Admins can delete hero images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hero-images' AND public.has_role(auth.uid(), 'admin'));
