CREATE TABLE public.note_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  template_content text NOT NULL DEFAULT '',
  is_shared boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.note_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all templates" ON public.note_templates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Team members can manage own templates" ON public.note_templates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'team_member') AND (created_by = auth.uid() OR is_shared = true))
  WITH CHECK (has_role(auth.uid(), 'team_member') AND created_by = auth.uid());

CREATE POLICY "Team members can view shared templates" ON public.note_templates
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'team_member') AND is_shared = true);