-- Create typing_status table for real-time typing indicators
CREATE TABLE public.typing_status (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  conversation_with uuid NOT NULL,
  is_typing boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, conversation_with)
);

ALTER TABLE public.typing_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own typing status"
ON public.typing_status FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can see typing status directed at them"
ON public.typing_status FOR SELECT
TO authenticated
USING (auth.uid() = conversation_with);

-- Enable realtime for typing_status
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_status;