
-- Restrict uploads to email-assets bucket to admins only
CREATE POLICY "Only admins can upload email assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'email-assets' AND public.has_role(auth.uid(), 'admin'));

-- Restrict updates to email-assets bucket to admins only
CREATE POLICY "Only admins can update email assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'email-assets' AND public.has_role(auth.uid(), 'admin'));

-- Restrict deletes to email-assets bucket to admins only
CREATE POLICY "Only admins can delete email assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'email-assets' AND public.has_role(auth.uid(), 'admin'));
