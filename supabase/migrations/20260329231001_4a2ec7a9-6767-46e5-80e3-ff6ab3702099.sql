
ALTER TABLE public.sessions 
  ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS recurrence_parent_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL DEFAULT NULL;
