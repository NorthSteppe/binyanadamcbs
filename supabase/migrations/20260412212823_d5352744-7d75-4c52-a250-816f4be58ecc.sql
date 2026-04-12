-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view assistant config" ON public.assistant_config;

-- Create a restricted public SELECT policy that only allows admins to read the full table
-- (The admin ALL policy already covers admin SELECT, so no new policy needed for admins)

-- Create a security definer function to return only safe public fields
CREATE OR REPLACE FUNCTION public.get_public_assistant_config()
RETURNS TABLE (
  is_enabled boolean,
  auto_popup_delay_seconds integer,
  visitor_greeting text,
  user_greeting text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_enabled, auto_popup_delay_seconds, visitor_greeting, user_greeting
  FROM public.assistant_config
  LIMIT 1;
$$;