import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ElementStyles {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  opacity?: number;
  objectFit?: string;
}

export interface PageElement {
  id: string;
  page_key: string;
  element_type: string;
  content: string;
  image_url: string;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  styles: ElementStyles;
  is_visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function usePageElements(pageKey: string) {
  return useQuery({
    queryKey: ["page-elements", pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_elements")
        .select("*")
        .eq("page_key", pageKey)
        .order("z_index", { ascending: true });
      if (error) throw error;
      return (data as unknown as PageElement[]) ?? [];
    },
    enabled: !!pageKey,
  });
}

export function useCreatePageElement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (el: Partial<PageElement> & { page_key: string }) => {
      const { data, error } = await supabase
        .from("page_elements")
        .insert(el as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as PageElement;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["page-elements", vars.page_key] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePageElement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, page_key, ...updates }: Partial<PageElement> & { id: string; page_key: string }) => {
      const { error } = await supabase
        .from("page_elements")
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["page-elements", vars.page_key] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePageElement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, page_key }: { id: string; page_key: string }) => {
      const { error } = await supabase
        .from("page_elements")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["page-elements", vars.page_key] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
