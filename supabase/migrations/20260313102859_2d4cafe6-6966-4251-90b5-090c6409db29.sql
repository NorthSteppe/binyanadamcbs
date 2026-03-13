
-- Allow therapists to INSERT documents for their assigned clients
CREATE POLICY "Assigned team members can upload client documents"
ON public.client_documents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_id = client_documents.client_id
    AND ca.assignee_id = auth.uid()
  )
  AND uploaded_by = auth.uid()
);

-- Allow therapists to upload to their own documents (where they are the client)
CREATE POLICY "Team members can upload own documents"
ON public.client_documents
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'team_member'::app_role)
  AND client_id = auth.uid()
  AND uploaded_by = auth.uid()
);

-- Storage: Allow therapists to upload files for assigned clients
CREATE POLICY "Team members can upload assigned client files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-documents'
  AND has_role(auth.uid(), 'team_member'::app_role)
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM client_assignments ca
      WHERE ca.client_id::text = (storage.foldername(name))[1]
      AND ca.assignee_id = auth.uid()
    )
  )
);

-- Storage: Allow admins to upload files for any client
CREATE POLICY "Admins can upload any client files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-documents'
  AND has_role(auth.uid(), 'admin'::app_role)
);
