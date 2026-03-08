import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  slug: string | null;
  avatar_url: string | null;
  display_order: number;
  is_active: boolean;
  credentials: string;
  signature_url: string | null;
  social_linkedin: string;
  social_twitter: string;
  social_website: string;
}

export const useTeamMembers = () =>
  useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as TeamMember[];
    },
  });

export const useUpsertTeamMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (member: Partial<TeamMember> & { id?: string }) => {
      const { id, ...rest } = member;
      if (id) {
        const { error } = await supabase
          .from("team_members")
          .update({ ...rest, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("team_members").insert(rest as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team-members"] }),
  });
};

export const useDeleteTeamMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team-members"] }),
  });
};
