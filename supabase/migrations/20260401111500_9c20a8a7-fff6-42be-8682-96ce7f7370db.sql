
-- 1. Prevent clients from modifying is_paid, payment_method, or status to paid-related values
CREATE OR REPLACE FUNCTION public.guard_session_financial_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow service_role (webhooks, admin operations) to set any field
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Allow admins and team_members to set financial fields
  IF has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'team_member') THEN
    RETURN NEW;
  END IF;

  -- For all other users (clients), prevent modification of financial fields
  IF TG_OP = 'INSERT' THEN
    NEW.is_paid := false;
    NEW.payment_method := '';
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.is_paid := OLD.is_paid;
    NEW.payment_method := OLD.payment_method;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER guard_session_financial_fields_trigger
  BEFORE INSERT OR UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_session_financial_fields();

-- 2. Restrict manual_clients team member access to assigned clients only
DROP POLICY IF EXISTS "Team members can view manual clients" ON public.manual_clients;
CREATE POLICY "Team members can view assigned manual clients"
  ON public.manual_clients
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'team_member'::app_role)
    AND (
      EXISTS (
        SELECT 1 FROM public.client_assignments ca
        WHERE ca.client_id = manual_clients.linked_user_id
        AND ca.assignee_id = auth.uid()
      )
      OR linked_user_id IS NULL
    )
  );

-- 3. Fix note_templates: split ALL policy to prevent team members deleting others' shared templates
DROP POLICY IF EXISTS "Team members can manage own templates" ON public.note_templates;
DROP POLICY IF EXISTS "Team members can view shared templates" ON public.note_templates;

CREATE POLICY "Team members can view own or shared templates"
  ON public.note_templates
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'team_member'::app_role)
    AND (created_by = auth.uid() OR is_shared = true)
  );

CREATE POLICY "Team members can insert own templates"
  ON public.note_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'team_member'::app_role)
    AND created_by = auth.uid()
  );

CREATE POLICY "Team members can update own templates"
  ON public.note_templates
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'team_member'::app_role)
    AND created_by = auth.uid()
  )
  WITH CHECK (
    has_role(auth.uid(), 'team_member'::app_role)
    AND created_by = auth.uid()
  );

CREATE POLICY "Team members can delete own templates"
  ON public.note_templates
  FOR DELETE
  TO authenticated
  USING (
    has_role(auth.uid(), 'team_member'::app_role)
    AND created_by = auth.uid()
  );

-- 4. Add storage policies for 'information' bucket (admin write, public read)
CREATE POLICY "Public read for information bucket"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'information');

CREATE POLICY "Admins can upload to information bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'information' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update information bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'information' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete from information bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'information' AND has_role(auth.uid(), 'admin'::app_role));
