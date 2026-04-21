
-- 1. Sessions: add service link, price, payment + payout tracking
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS service_option_id UUID REFERENCES public.service_options(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS price_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paid_confirmed_by UUID,
  ADD COLUMN IF NOT EXISTS therapist_id UUID,
  ADD COLUMN IF NOT EXISTS therapist_rate_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS therapist_paid BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS therapist_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS therapist_paid_by UUID,
  ADD COLUMN IF NOT EXISTS therapist_payout_method TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS therapist_payout_batch_id UUID;

CREATE INDEX IF NOT EXISTS idx_sessions_therapist_id ON public.sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_therapist_paid ON public.sessions(therapist_paid);
CREATE INDEX IF NOT EXISTS idx_sessions_is_paid ON public.sessions(is_paid);

-- 2. Team members: default rate
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS default_session_rate_cents INTEGER NOT NULL DEFAULT 0;

-- 3. Therapist payout batches
CREATE TABLE IF NOT EXISTS public.therapist_payout_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL,
  total_cents INTEGER NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  reference TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.therapist_payout_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage payout batches"
ON public.therapist_payout_batches FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Therapists view own payout batches"
ON public.therapist_payout_batches FOR SELECT TO authenticated
USING (therapist_id = auth.uid());

-- 4. Allow assigned therapists to update payment confirmation on their sessions.
-- Existing financial guard trigger restricts clients; we extend so therapists
-- can set is_paid/payment_method/paid_at but cannot touch payout fields.
CREATE OR REPLACE FUNCTION public.guard_session_financial_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Service role bypass
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Admins: full access
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Team members can edit client-payment fields but NOT therapist payout fields
  IF has_role(auth.uid(), 'team_member'::app_role) THEN
    IF TG_OP = 'UPDATE' THEN
      NEW.therapist_rate_cents := OLD.therapist_rate_cents;
      NEW.therapist_paid := OLD.therapist_paid;
      NEW.therapist_paid_at := OLD.therapist_paid_at;
      NEW.therapist_paid_by := OLD.therapist_paid_by;
      NEW.therapist_payout_method := OLD.therapist_payout_method;
      NEW.therapist_payout_batch_id := OLD.therapist_payout_batch_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Clients: cannot modify any financial field
  IF TG_OP = 'INSERT' THEN
    NEW.is_paid := false;
    NEW.payment_method := '';
    NEW.paid_at := NULL;
    NEW.paid_confirmed_by := NULL;
    NEW.therapist_rate_cents := 0;
    NEW.therapist_paid := false;
    NEW.therapist_paid_at := NULL;
    NEW.therapist_paid_by := NULL;
    NEW.therapist_payout_method := '';
    NEW.therapist_payout_batch_id := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.is_paid := OLD.is_paid;
    NEW.payment_method := OLD.payment_method;
    NEW.paid_at := OLD.paid_at;
    NEW.paid_confirmed_by := OLD.paid_confirmed_by;
    NEW.therapist_rate_cents := OLD.therapist_rate_cents;
    NEW.therapist_paid := OLD.therapist_paid;
    NEW.therapist_paid_at := OLD.therapist_paid_at;
    NEW.therapist_paid_by := OLD.therapist_paid_by;
    NEW.therapist_payout_method := OLD.therapist_payout_method;
    NEW.therapist_payout_batch_id := OLD.therapist_payout_batch_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- Touch trigger for batches
CREATE OR REPLACE FUNCTION public.touch_payout_batches()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_touch_payout_batches ON public.therapist_payout_batches;
CREATE TRIGGER trg_touch_payout_batches
BEFORE UPDATE ON public.therapist_payout_batches
FOR EACH ROW EXECUTE FUNCTION public.touch_payout_batches();
