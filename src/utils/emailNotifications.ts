import { supabase } from "@/integrations/supabase/client";

/**
 * Send an email notification for a given notification event.
 * Only sends if the user has email notifications enabled (checked server-side by looking up profile email).
 */
export async function sendNotificationEmail(params: {
  userId: string;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    // Get user email from auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Only send email for the notification's target user
    // We need the recipient's email — fetch from profiles or use a server-side approach
    // For now, use the edge function which has service role access
    await supabase.functions.invoke("send-notification-email", {
      body: {
        user_id: params.userId,
        title: params.title,
        message: params.message,
        link: params.link,
      },
    });
  } catch (err) {
    console.warn("Failed to send email notification:", err);
  }
}
