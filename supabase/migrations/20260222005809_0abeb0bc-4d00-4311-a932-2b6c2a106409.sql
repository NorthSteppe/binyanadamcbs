
CREATE TABLE public.team_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  UNIQUE(user_id)
);

ALTER TABLE public.team_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own request
CREATE POLICY "Users can request team access"
  ON public.team_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own request
CREATE POLICY "Users can view own request"
  ON public.team_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all requests
CREATE POLICY "Admins can manage team requests"
  ON public.team_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
