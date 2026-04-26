-- Restrict assistant_knowledge and assistant_flows so they are no longer
-- readable by anonymous/authenticated users. The assistant edge function
-- reads them via the service role, so functionality is preserved while
-- removing exposure of internal clinical knowledge and flow definitions.

DROP POLICY IF EXISTS "Anyone can view active knowledge" ON public.assistant_knowledge;
DROP POLICY IF EXISTS "Anyone can view active flows" ON public.assistant_flows;

-- Admin-only read access remains via the existing "Admins can manage ..." policies.
-- The edge function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.