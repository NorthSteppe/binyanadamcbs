
-- Client assignments
CREATE TABLE public.client_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  assignee_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, assignee_id)
);
ALTER TABLE public.client_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage assignments" ON public.client_assignments FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Team members can view own assignments" ON public.client_assignments FOR SELECT
  USING (assignee_id = auth.uid());
CREATE POLICY "Clients can view own assignments" ON public.client_assignments FOR SELECT
  USING (client_id = auth.uid());

-- Service options
CREATE TABLE public.service_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 60,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active service options" ON public.service_options FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage service options" ON public.service_options FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.service_options (name, description, duration_minutes, display_order) VALUES
  ('Initial Consultation', 'First meeting to discuss your needs and goals', 60, 1),
  ('Follow-Up Session', 'Regular follow-up session', 60, 2),
  ('Parent Coaching', 'Guidance and support for parents', 60, 3),
  ('Supervision Session', 'Professional supervision for practitioners', 90, 4),
  ('Assessment', 'Comprehensive behavioural assessment', 90, 5);

-- Client documents
CREATE TABLE public.client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  uploaded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can upload own documents" ON public.client_documents FOR INSERT
  WITH CHECK (auth.uid() = client_id AND auth.uid() = uploaded_by);
CREATE POLICY "Clients can view own documents" ON public.client_documents FOR SELECT
  USING (auth.uid() = client_id);
CREATE POLICY "Admins can manage all documents" ON public.client_documents FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assigned team members can view client documents" ON public.client_documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.client_assignments ca WHERE ca.client_id = client_documents.client_id AND ca.assignee_id = auth.uid()));

-- Client todos
CREATE TABLE public.client_todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_completed boolean NOT NULL DEFAULT false,
  due_date date,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.client_todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can view own todos" ON public.client_todos FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can mark own todos complete" ON public.client_todos FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Admins can manage all todos" ON public.client_todos FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assigned team members can manage client todos" ON public.client_todos FOR ALL
  USING (EXISTS (SELECT 1 FROM public.client_assignments ca WHERE ca.client_id = client_todos.client_id AND ca.assignee_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.client_assignments ca WHERE ca.client_id = client_todos.client_id AND ca.assignee_id = auth.uid()));

-- Team members can manage resources
CREATE POLICY "Team members can manage resources" ON public.resources FOR ALL
  USING (public.has_role(auth.uid(), 'team_member')) WITH CHECK (public.has_role(auth.uid(), 'team_member'));

-- Storage bucket for client documents
INSERT INTO storage.buckets (id, name, public) VALUES ('client-documents', 'client-documents', false) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Clients can upload own docs storage" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Clients can view own docs storage" ON storage.objects FOR SELECT
  USING (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins manage all docs storage" ON storage.objects FOR ALL
  USING (bucket_id = 'client-documents' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Assigned team view docs storage" ON storage.objects FOR SELECT
  USING (bucket_id = 'client-documents' AND EXISTS (
    SELECT 1 FROM public.client_assignments ca WHERE ca.client_id::text = (storage.foldername(name))[1] AND ca.assignee_id = auth.uid()
  ));
