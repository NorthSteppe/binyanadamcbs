
CREATE TABLE public.act_matrix_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  filled_by uuid NOT NULL,
  values_text text NOT NULL DEFAULT '',
  internal_obstacles text NOT NULL DEFAULT '',
  avoidance_behaviours text NOT NULL DEFAULT '',
  committed_actions text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.act_matrix_entries ENABLE ROW LEVEL SECURITY;

-- Clients can view their own entries
CREATE POLICY "Clients can view own ACT entries"
  ON public.act_matrix_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Clients can insert their own entries
CREATE POLICY "Clients can insert own ACT entries"
  ON public.act_matrix_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() = filled_by);

-- Admins can manage all entries
CREATE POLICY "Admins can manage ACT entries"
  ON public.act_matrix_entries FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Team members can manage entries for their assigned clients
CREATE POLICY "Team members can manage assigned client ACT entries"
  ON public.act_matrix_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.client_assignments ca
      WHERE ca.client_id = act_matrix_entries.user_id
        AND ca.assignee_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.client_assignments ca
      WHERE ca.client_id = act_matrix_entries.user_id
        AND ca.assignee_id = auth.uid()
    )
  );
