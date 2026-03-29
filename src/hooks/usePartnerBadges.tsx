import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PartnerBadge {
  id: string;
  name: string;
  image_url: string;
  link_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePartnerBadges(activeOnly = true) {
  return useQuery({
    queryKey: ["partner-badges", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("partner_badges" as any)
        .select("*")
        .order("display_order", { ascending: true });
      if (activeOnly) query = query.eq("is_active", true);
      const { data, error } = await query;
      if (error) throw error;
      return (data as any[]) as PartnerBadge[];
    },
  });
}

export function useUpsertPartnerBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (badge: Partial<PartnerBadge> & { id?: string }) => {
      if (badge.id) {
        const { id, ...rest } = badge;
        const { error } = await supabase.from("partner_badges" as any).update({ ...rest, updated_at: new Date().toISOString() } as any).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("partner_badges" as any).insert(badge as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["partner-badges"] }); toast.success("Badge saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePartnerBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("partner_badges" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["partner-badges"] }); toast.success("Badge removed"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
