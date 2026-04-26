-- Tighten realtime.messages SELECT policy so authenticated users can only receive
-- realtime broadcasts on topics that include their own user id. This prevents any
-- authenticated user from subscribing to arbitrary realtime topics.

DROP POLICY IF EXISTS "Authenticated users can receive realtime events" ON realtime.messages;

CREATE POLICY "Users receive own realtime events"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Allow only if the realtime topic contains the subscriber's user id.
  -- App code uses channels keyed by user id (e.g. "messages:<uid>", "notifications:<uid>").
  realtime.topic() LIKE '%' || auth.uid()::text || '%'
);