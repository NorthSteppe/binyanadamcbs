
-- Assistant configuration (singleton-ish, one active config)
CREATE TABLE public.assistant_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean NOT NULL DEFAULT true,
  system_prompt text NOT NULL DEFAULT '',
  visitor_greeting text NOT NULL DEFAULT 'Hi! I''m here to help you find the right service. Can I ask you a few questions?',
  user_greeting text NOT NULL DEFAULT 'Welcome back! How can I help you today?',
  auto_popup_delay_seconds integer NOT NULL DEFAULT 5,
  collect_data_fields jsonb NOT NULL DEFAULT '["name", "email", "concern"]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage assistant config"
  ON public.assistant_config FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view assistant config"
  ON public.assistant_config FOR SELECT TO anon, authenticated
  USING (true);

-- Knowledge documents
CREATE TABLE public.assistant_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage knowledge"
  ON public.assistant_knowledge FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active knowledge"
  ON public.assistant_knowledge FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Guided question flows
CREATE TABLE public.assistant_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  trigger_type text NOT NULL DEFAULT 'visitor', -- 'visitor', 'user', 'both'
  flow_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage flows"
  ON public.assistant_flows FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active flows"
  ON public.assistant_flows FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Conversation logs
CREATE TABLE public.assistant_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- null for anonymous visitors
  visitor_fingerprint text, -- anonymous tracking
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active', -- 'active', 'completed', 'abandoned'
  source_page text NOT NULL DEFAULT '/',
  flow_id uuid REFERENCES public.assistant_flows(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage conversations"
  ON public.assistant_conversations FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own conversations"
  ON public.assistant_conversations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert conversations"
  ON public.assistant_conversations FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update own conversations"
  ON public.assistant_conversations FOR UPDATE TO anon, authenticated
  USING (true);

-- Collected data from conversations
CREATE TABLE public.assistant_collected_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.assistant_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid, -- linked when known
  field_name text NOT NULL,
  field_value text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'conversation', -- 'conversation', 'flow', 'manual'
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_collected_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage collected data"
  ON public.assistant_collected_data FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own collected data"
  ON public.assistant_collected_data FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert collected data"
  ON public.assistant_collected_data FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Insert default config
INSERT INTO public.assistant_config (system_prompt, visitor_greeting, user_greeting)
VALUES (
  'You are Binyan Adam''s proactive AI assistant. You help visitors discover the right service by asking thoughtful questions about their needs. For logged-in users, you proactively help with their tasks, upcoming sessions, and goals. Always be warm, professional, and encouraging. When you have enough information about a visitor''s needs, recommend specific Binyan services (Education, Therapy, Family Support, Organisations, Supervision) and suggest booking a consultation.',
  'Hi there! 👋 I''m Binyan''s assistant. I can help you find the right support — would you like me to ask a few quick questions to guide you?',
  'Welcome back! 👋 I noticed you have some upcoming tasks. Would you like help with anything today?'
);
