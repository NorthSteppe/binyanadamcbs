import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HeroImage {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  interval_seconds: number;
  created_at: string;
  updated_at: string;
}

export function useHeroImages(activeOnly = true) {
  return useQuery({
    queryKey: ["hero-images", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("hero_images")
        .select("*")
        .order("display_order", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HeroImage[];
    },
  });
}

export function useUploadHeroImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("hero-images")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("hero-images")
        .getPublicUrl(path);

      // Get max order
      const { data: existing } = await supabase
        .from("hero_images")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);

      const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

      const { error: insertError } = await supabase.from("hero_images").insert({
        image_url: urlData.publicUrl,
        alt_text: file.name,
        display_order: nextOrder,
      });
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-images"] });
      toast.success("Image uploaded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateHeroImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeroImage> & { id: string }) => {
      const { error } = await supabase
        .from("hero_images")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-images"] });
      toast.success("Image updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteHeroImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: HeroImage) => {
      // Extract path from URL
      const url = new URL(image.image_url);
      const parts = url.pathname.split("/hero-images/");
      if (parts.length > 1) {
        await supabase.storage.from("hero-images").remove([parts[1]]);
      }

      const { error } = await supabase.from("hero_images").delete().eq("id", image.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-images"] });
      toast.success("Image deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
