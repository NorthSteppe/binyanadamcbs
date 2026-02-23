
-- Allow authenticated users to view all profiles (for team collaboration)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);
