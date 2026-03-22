
-- Allow authenticated users to insert their own resources
CREATE POLICY "Users can insert own resources"
ON public.resources
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Allow users to view their own uploaded resources  
CREATE POLICY "Users can view own resources"
ON public.resources
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Allow users to delete their own resources
CREATE POLICY "Users can delete own resources"
ON public.resources
FOR DELETE
TO authenticated
USING (created_by = auth.uid());
