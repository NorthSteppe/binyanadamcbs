CREATE OR REPLACE FUNCTION public.touch_staff_integrations()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.staff_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft', 'zoom')),
  account_email TEXT NOT NULL DEFAULT '',
  account_name TEXT NOT NULL DEFAULT '',
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL DEFAULT '',
  token_expires_at TIMESTAMPTZ,
  scope TEXT NOT NULL DEFAULT '',
  extra_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

ALTER TABLE public.staff_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all staff integrations"
  ON public.staff_integrations FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff view own integrations"
  ON public.staff_integrations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Staff insert own integrations"
  ON public.staff_integrations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff update own integrations"
  ON public.staff_integrations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff delete own integrations"
  ON public.staff_integrations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_staff_integrations_updated_at
  BEFORE UPDATE ON public.staff_integrations
  FOR EACH ROW EXECUTE FUNCTION public.touch_staff_integrations();

CREATE INDEX idx_staff_integrations_user ON public.staff_integrations(user_id);
CREATE INDEX idx_staff_integrations_provider ON public.staff_integrations(provider);