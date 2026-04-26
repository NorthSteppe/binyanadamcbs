
-- Drop the overly permissive write policies
DROP POLICY IF EXISTS "Therapists upload client photos" ON storage.objects;
DROP POLICY IF EXISTS "Therapists update client photos" ON storage.objects;
DROP POLICY IF EXISTS "Therapists delete client photos" ON storage.objects;

-- INSERT: admins OR therapists assigned to the client (folder = client_id)
CREATE POLICY "Assigned therapists upload client photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-photos'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.client_assignments ca
      WHERE ca.assignee_id = auth.uid()
        AND ca.client_id::text = (storage.foldername(name))[1]
    )
  )
);

-- UPDATE: admins OR assigned therapists
CREATE POLICY "Assigned therapists update client photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'client-photos'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.client_assignments ca
      WHERE ca.assignee_id = auth.uid()
        AND ca.client_id::text = (storage.foldername(name))[1]
    )
  )
)
WITH CHECK (
  bucket_id = 'client-photos'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.client_assignments ca
      WHERE ca.assignee_id = auth.uid()
        AND ca.client_id::text = (storage.foldername(name))[1]
    )
  )
);

-- DELETE: admins OR assigned therapists
CREATE POLICY "Assigned therapists delete client photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'client-photos'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.client_assignments ca
      WHERE ca.assignee_id = auth.uid()
        AND ca.client_id::text = (storage.foldername(name))[1]
    )
  )
);
