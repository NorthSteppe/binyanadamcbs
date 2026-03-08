
-- Projects for organizing tasks
CREATE TABLE public.user_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6366f1',
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects" ON public.user_projects FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tasks with priorities, labels, deadlines, status, project assignment
CREATE TABLE public.user_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.user_projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  labels text[] NOT NULL DEFAULT '{}',
  due_date timestamptz,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  estimated_minutes integer NOT NULL DEFAULT 30,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks" ON public.user_tasks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Focus time blocks for calendar
CREATE TABLE public.focus_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Focus Time',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_rule text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.focus_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own focus blocks" ON public.focus_blocks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Calendar sharing preferences
CREATE TABLE public.calendar_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  shared_with_id uuid NOT NULL,
  can_view_tasks boolean NOT NULL DEFAULT false,
  can_view_focus boolean NOT NULL DEFAULT false,
  can_view_sessions boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(owner_id, shared_with_id)
);
ALTER TABLE public.calendar_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage shares" ON public.calendar_shares FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Shared users can view shares" ON public.calendar_shares FOR SELECT TO authenticated
  USING (auth.uid() = shared_with_id);

-- Daily AI plans
CREATE TABLE public.daily_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_date date NOT NULL,
  plan_data jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_date)
);
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own plans" ON public.daily_plans FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
