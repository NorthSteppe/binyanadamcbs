CREATE OR REPLACE FUNCTION public.touch_support_agreements_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.support_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT 'Support Agreement',
  body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  signed_name TEXT NOT NULL DEFAULT '',
  signature_data_url TEXT NOT NULL DEFAULT '',
  signed_at TIMESTAMPTZ,
  signed_pdf_url TEXT NOT NULL DEFAULT '',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage support agreements"
ON public.support_agreements FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Assigned therapists manage support agreements"
ON public.support_agreements FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM client_assignments ca WHERE ca.client_id = support_agreements.client_id AND ca.assignee_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM client_assignments ca WHERE ca.client_id = support_agreements.client_id AND ca.assignee_id = auth.uid()));

CREATE POLICY "Clients view own support agreement"
ON public.support_agreements FOR SELECT TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "Clients sign own support agreement"
ON public.support_agreements FOR UPDATE TO authenticated
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

CREATE TRIGGER trg_support_agreements_updated
BEFORE UPDATE ON public.support_agreements
FOR EACH ROW EXECUTE FUNCTION public.touch_support_agreements_updated_at();

INSERT INTO storage.buckets (id, name, public)
VALUES ('support-agreements', 'support-agreements', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins manage support agreement files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'support-agreements' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'support-agreements' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Assigned therapists manage support agreement files"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'support-agreements'
  AND EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_id::text = (storage.foldername(name))[1]
      AND ca.assignee_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'support-agreements'
  AND EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_id::text = (storage.foldername(name))[1]
      AND ca.assignee_id = auth.uid()
  )
);

CREATE POLICY "Clients read own support agreement files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'support-agreements'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Clients upload own support agreement files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'support-agreements'
  AND auth.uid()::text = (storage.foldername(name))[1]
);