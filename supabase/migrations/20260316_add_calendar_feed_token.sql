-- Add a unique calendar feed token to each profile for secure iCal subscriptions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS calendar_feed_token uuid;

-- Populate existing profiles with a unique token
UPDATE profiles SET calendar_feed_token = gen_random_uuid() WHERE calendar_feed_token IS NULL;

-- Ensure uniqueness and non-null going forward
ALTER TABLE profiles ALTER COLUMN calendar_feed_token SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN calendar_feed_token SET DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS profiles_calendar_feed_token_idx ON profiles(calendar_feed_token);
