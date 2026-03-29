
-- Table for manually added clients/supervisees who don't have accounts
CREATE TABLE public.manual_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  client_type text NOT NULL DEFAULT 'client',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT ''
);

ALTER TABLE public.manual_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage manual clients"
  ON public.manual_clients FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team members can view manual clients"
  ON public.manual_clients FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'team_member'::app_role));

-- Add optional manual_client_id to sessions so sessions can reference manual clients
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS manual_client_id uuid REFERENCES public.manual_clients(id);
