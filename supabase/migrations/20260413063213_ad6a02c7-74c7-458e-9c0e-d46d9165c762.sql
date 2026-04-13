
-- Enable RLS on realtime.messages (Supabase Realtime Authorization)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can receive realtime messages
-- This scopes realtime subscriptions so users only get events they're authorized for
-- The underlying table-level RLS on public.messages, public.notifications, and public.typing_status
-- already restricts which rows are visible; this policy allows the realtime system to deliver those filtered events.
CREATE POLICY "Authenticated users can receive realtime events"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

-- Note: The actual data filtering is enforced by the RLS policies on the source tables
-- (messages, notifications, typing_status). Supabase Realtime only delivers change events
-- for rows that pass the source table's RLS policies for the subscribing user.
-- This policy simply allows authenticated users to connect to the realtime system.
