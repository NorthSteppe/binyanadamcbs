-- Add manual_client_id to clinical/management tables to support manual clients
ALTER TABLE public.client_notes
  ADD COLUMN IF NOT EXISTS manual_client_id uuid REFERENCES public.manual_clients(id) ON DELETE CASCADE,
  ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE public.client_todos
  ADD COLUMN IF NOT EXISTS manual_client_id uuid REFERENCES public.manual_clients(id) ON DELETE CASCADE,
  ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE public.client_documents
  ADD COLUMN IF NOT EXISTS manual_client_id uuid REFERENCES public.manual_clients(id) ON DELETE CASCADE,
  ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE public.clinical_entries
  ADD COLUMN IF NOT EXISTS manual_client_id uuid REFERENCES public.manual_clients(id) ON DELETE CASCADE,
  ALTER COLUMN client_id DROP NOT NULL;

-- Sanity: at least one of client_id / manual_client_id must be set
ALTER TABLE public.client_notes DROP CONSTRAINT IF EXISTS client_notes_target_check;
ALTER TABLE public.client_notes ADD CONSTRAINT client_notes_target_check
  CHECK (client_id IS NOT NULL OR manual_client_id IS NOT NULL);

ALTER TABLE public.client_todos DROP CONSTRAINT IF EXISTS client_todos_target_check;
ALTER TABLE public.client_todos ADD CONSTRAINT client_todos_target_check
  CHECK (client_id IS NOT NULL OR manual_client_id IS NOT NULL);

ALTER TABLE public.client_documents DROP CONSTRAINT IF EXISTS client_documents_target_check;
ALTER TABLE public.client_documents ADD CONSTRAINT client_documents_target_check
  CHECK (client_id IS NOT NULL OR manual_client_id IS NOT NULL);

ALTER TABLE public.clinical_entries DROP CONSTRAINT IF EXISTS clinical_entries_target_check;
ALTER TABLE public.clinical_entries ADD CONSTRAINT clinical_entries_target_check
  CHECK (client_id IS NOT NULL OR manual_client_id IS NOT NULL);

-- RLS additions for manual clients on these tables
-- client_notes
CREATE POLICY "Staff can view manual client notes"
  ON public.client_notes FOR SELECT TO authenticated
  USING (
    manual_client_id IS NOT NULL AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.manual_clients mc WHERE mc.id = manual_client_id AND mc.created_by = auth.uid())
    )
  );

CREATE POLICY "Staff can insert manual client notes"
  ON public.client_notes FOR INSERT TO authenticated
  WITH CHECK (
    manual_client_id IS NOT NULL AND author_id = auth.uid() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.manual_clients mc WHERE mc.id = manual_client_id AND mc.created_by = auth.uid())
    )
  );

CREATE POLICY "Staff can update own manual client notes"
  ON public.client_notes FOR UPDATE TO authenticated
  USING (manual_client_id IS NOT NULL AND author_id = auth.uid())
  WITH CHECK (manual_client_id IS NOT NULL AND author_id = auth.uid());

CREATE POLICY "Staff can delete own manual client notes"
  ON public.client_notes FOR DELETE TO authenticated
  USING (manual_client_id IS NOT NULL AND author_id = auth.uid());

-- client_todos
CREATE POLICY "Staff manage manual client todos"
  ON public.client_todos FOR ALL TO authenticated
  USING (
    manual_client_id IS NOT NULL AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.manual_clients mc WHERE mc.id = manual_client_id AND mc.created_by = auth.uid())
    )
  )
  WITH CHECK (
    manual_client_id IS NOT NULL AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.manual_clients mc WHERE mc.id = manual_client_id AND mc.created_by = auth.uid())
    )
  );

-- client_documents
CREATE POLICY "Staff view manual client documents"
  ON public.client_documents FOR SELECT TO authenticated
  USING (
    manual_client_id IS NOT NULL AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.manual_clients mc WHERE mc.id = manual_client_id AND mc.created_by = auth.uid())
    )
  );

CREATE POLICY "Staff upload manual client documents"
  ON public.client_documents FOR INSERT TO authenticated
  WITH CHECK (
    manual_client_id IS NOT NULL AND uploaded_by = auth.uid() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.manual_clients mc WHERE mc.id = manual_client_id AND mc.created_by = auth.uid())
    )
  );

CREATE POLICY "Staff delete manual client documents"
  ON public.client_documents FOR DELETE TO authenticated
  USING (
    manual_client_id IS NOT NULL AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR uploaded_by = auth.uid()
    )
  );

-- clinical_entries
CREATE POLICY "Staff manage manual client clinical entries"
  ON public.clinical_entries FOR ALL TO authenticated
  USING (
    manual_client_id IS NOT NULL AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.manual_clients mc WHERE mc.id = manual_client_id AND mc.created_by = auth.uid())
    )
  )
  WITH CHECK (
    manual_client_id IS NOT NULL AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.manual_clients mc WHERE mc.id = manual_client_id AND mc.created_by = auth.uid())
    )
  );

-- Allow admins + assigned therapists to update profile names (full_name only via UI)
-- The existing profiles RLS already permits user-self update; add admin/therapist update via policy
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Assigned therapists can update client profile" ON public.profiles;
CREATE POLICY "Assigned therapists can update client profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'team_member'::app_role)
    AND EXISTS (SELECT 1 FROM public.client_assignments ca WHERE ca.client_id = profiles.id AND ca.assignee_id = auth.uid())
  )
  WITH CHECK (
    has_role(auth.uid(), 'team_member'::app_role)
    AND EXISTS (SELECT 1 FROM public.client_assignments ca WHERE ca.client_id = profiles.id AND ca.assignee_id = auth.uid())
  );

-- Update link_manual_client_to_user to also migrate notes/todos/documents/clinical_entries
CREATE OR REPLACE FUNCTION public.link_manual_client_to_user(_manual_client_id uuid, _target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Migrate sessions
  UPDATE public.sessions
  SET client_id = _target_user_id, manual_client_id = _manual_client_id
  WHERE manual_client_id = _manual_client_id;

  -- Migrate notes/todos/documents/clinical entries
  UPDATE public.client_notes SET client_id = _target_user_id WHERE manual_client_id = _manual_client_id AND client_id IS NULL;
  UPDATE public.client_todos SET client_id = _target_user_id WHERE manual_client_id = _manual_client_id AND client_id IS NULL;
  UPDATE public.client_documents SET client_id = _target_user_id WHERE manual_client_id = _manual_client_id AND client_id IS NULL;
  UPDATE public.clinical_entries SET client_id = _target_user_id WHERE manual_client_id = _manual_client_id AND client_id IS NULL;

  -- Mark the manual client as linked
  UPDATE public.manual_clients
  SET linked_user_id = _target_user_id, updated_at = now()
  WHERE id = _manual_client_id;
END;
$function$;