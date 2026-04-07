
-- Drop overly permissive policies
DROP POLICY "Anyone can insert conversations" ON public.assistant_conversations;
DROP POLICY "Anyone can update own conversations" ON public.assistant_conversations;
DROP POLICY "Anyone can insert collected data" ON public.assistant_collected_data;

-- Tighter conversation policies
CREATE POLICY "Anon can insert conversations"
  ON public.assistant_conversations FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Authenticated can insert own conversations"
  ON public.assistant_conversations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated can update own conversations"
  ON public.assistant_conversations FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Collected data: only via edge function (service role) or admin
-- Remove anon insert, keep admin policy which already exists
CREATE POLICY "Authenticated can insert own collected data"
  ON public.assistant_collected_data FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
