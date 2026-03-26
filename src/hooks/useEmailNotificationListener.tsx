import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePreferences } from "@/hooks/usePreferences";

/**
 * Listens for new notifications via Supabase realtime and sends
 * email notifications if the user has email notifications enabled.
 * Mount once in the app (e.g., in AppLoader or a layout component).
 */
export function useEmailNotificationListener() {
  const { user } = useAuth();
  const { prefs } = usePreferences();
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("email-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          // Check email preference at the time of notification
          if (!prefsRef.current.notifyEmail) return;

          const notification = payload.new as {
            title: string;
            message: string;
            link?: string;
            user_id: string;
          };

          try {
            await supabase.functions.invoke("send-notification-email", {
              body: {
                user_id: notification.user_id,
                title: notification.title,
                message: notification.message,
                link: notification.link,
              },
            });
          } catch (err) {
            console.warn("Failed to send email notification:", err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
}
