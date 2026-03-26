
-- Drop existing team member policy
DROP POLICY IF EXISTS "Team members can manage own staff todos" ON public.staff_todos;

-- Create new policy: team members can view tasks assigned to them OR created by them
CREATE POLICY "Team members can view own staff todos" ON public.staff_todos
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'team_member'::app_role) AND 
  (auth.uid() = assigned_to OR auth.uid() = created_by)
);

-- Team members can insert tasks (assign to any staff member)
CREATE POLICY "Team members can insert staff todos" ON public.staff_todos
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'team_member'::app_role) AND auth.uid() = created_by
);

-- Team members can update tasks assigned to them or created by them
CREATE POLICY "Team members can update own staff todos" ON public.staff_todos
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'team_member'::app_role) AND 
  (auth.uid() = assigned_to OR auth.uid() = created_by)
)
WITH CHECK (
  has_role(auth.uid(), 'team_member'::app_role) AND 
  (auth.uid() = assigned_to OR auth.uid() = created_by)
);

-- Team members can delete tasks they created
CREATE POLICY "Team members can delete own staff todos" ON public.staff_todos
FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'team_member'::app_role) AND auth.uid() = created_by
);
