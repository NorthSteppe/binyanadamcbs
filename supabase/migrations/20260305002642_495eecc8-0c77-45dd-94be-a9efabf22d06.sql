ALTER TABLE public.service_options 
ADD COLUMN price_cents integer NOT NULL DEFAULT 0,
ADD COLUMN stripe_price_id text DEFAULT NULL;