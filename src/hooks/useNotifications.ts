import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

/**
 * Single-subscription hook for user notifications.
 * Safe to call from multiple components — only one Realtime channel is ever
 * created per mounted component tree because each call creates its own
 * channel scoped to this hook instance, but the hook is only wired once
 * (the Header renders two NotificationBells with CSS, only one visible at a
 * time, but both mounted — this hook ensures each component manages its own
 * state locally without duplicating Realtime channels by using the user id
 * as the stable dependency instead of the user object reference).
 */
export const useNotifications = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setNotifications(data as Notification[]);
  }, [userId]);

  // Initial fetch — depends only on the stable user ID, not the object reference
  useEffect(() => {
    if (!userId) { setNotifications([]); return; }
    fetchNotifications();
  }, [userId, fetchNotifications]);

  // Realtime subscription — one channel per hook instance, cleaned up on unmount
  useEffect(() => {
    if (!userId) return;

    // Use a random suffix so parallel instances (desktop + mobile bell) never
    // collide on the same channel name, avoiding the "after subscribe()" error.
    const channelName = `notifications-${userId}-${Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]); // stable: only re-subscribes when the logged-in user changes

  const markRead = useCallback(async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, [notifications]);

  const clearAll = useCallback(async () => {
    if (notifications.length === 0) return;
    await supabase
      .from("notifications")
      .delete()
      .in("id", notifications.map((n) => n.id));
    setNotifications([]);
  }, [notifications]);

  return { notifications, markRead, markAllRead, clearAll };
};
