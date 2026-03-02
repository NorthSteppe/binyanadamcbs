import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteContent {
  id: string;
  page_key: string;
  section_key: string;
  image_url: string;
  alt_text: string;
  quote_text: string;
  quote_author: string;
}

export const useSiteContent = (pageKey?: string) => {
  return useQuery({
    queryKey: ["site-content", pageKey],
    queryFn: async () => {
      let query = supabase.from("site_content").select("*").order("page_key");
      if (pageKey) query = query.eq("page_key", pageKey);
      const { data, error } = await query;
      if (error) throw error;
      return data as SiteContent[];
    },
  });
};

export const usePageContent = (pageKey: string, sectionKey = "hero") => {
  return useQuery({
    queryKey: ["site-content", pageKey, sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("page_key", pageKey)
        .eq("section_key", sectionKey)
        .maybeSingle();
      if (error) throw error;
      return data as SiteContent | null;
    },
  });
};

export const useUpdateSiteContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<SiteContent> & { id: string }) => {
      const { id, ...rest } = updates;
      const { error } = await supabase.from("site_content").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-content"] }),
  });
};
