-- Make the bucket private
UPDATE storage.buckets SET public = false WHERE id = 'client-photos';

-- Drop the old public-read policy
DROP POLICY IF EXISTS "Public read client photos" ON storage.objects;

-- Allow admins to read all client photos
CREATE POLICY "Admins can read client photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-photos'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow assigned therapists to read photos of their clients (folder = client_id)
CREATE POLICY "Assigned therapists read client photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-photos'
  AND EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.assignee_id = auth.uid()
      AND ca.client_id::text = (storage.foldername(name))[1]
  )
);

-- Allow clients to read their own photo
CREATE POLICY "Clients read own photo"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);