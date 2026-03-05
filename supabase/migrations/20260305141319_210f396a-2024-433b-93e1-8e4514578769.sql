
-- Staff personal to-do table
CREATE TABLE public.staff_todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  assigned_to UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_todos ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all staff todos"
  ON public.staff_todos FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Team members can manage todos assigned to them or created by them
CREATE POLICY "Team members can manage own staff todos"
  ON public.staff_todos FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'team_member') AND
    (auth.uid() = assigned_to OR auth.uid() = created_by)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'team_member') AND
    (auth.uid() = assigned_to OR auth.uid() = created_by)
  );

-- Allow team members to view/manage all sessions (not just their own)
CREATE POLICY "Team members can view all sessions"
  ON public.sessions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'team_member'));

CREATE POLICY "Team members can update sessions"
  ON public.sessions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'team_member'));

CREATE POLICY "Team members can insert sessions"
  ON public.sessions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'team_member'));
