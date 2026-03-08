import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentOverride {
  id: string;
  content_key: string;
  content_value: string;
  content_type: string;
  image_url: string;
}

interface EditModeContextType {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  canEdit: boolean;
  overrides: Record<string, ContentOverride>;
  saveOverride: (key: string, value: string, type?: string, imageUrl?: string) => void;
  getOverride: (key: string) => string | undefined;
  getImageOverride: (key: string) => string | undefined;
  saving: boolean;
}

const EditModeContext = createContext<EditModeContextType>({
  editMode: false,
  setEditMode: () => {},
  canEdit: false,
  overrides: {},
  saveOverride: () => {},
  getOverride: () => undefined,
  getImageOverride: () => undefined,
  saving: false,
});

export const useEditMode = () => useContext(EditModeContext);

export const EditModeProvider = ({ children }: { children: ReactNode }) => {
  const { isAdmin } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const qc = useQueryClient();

  const { data: overridesList = [] } = useQuery({
    queryKey: ["content-overrides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_overrides")
        .select("*");
      if (error) throw error;
      return data as unknown as ContentOverride[];
    },
  });

  const overrides: Record<string, ContentOverride> = {};
  overridesList.forEach((o) => {
    overrides[o.content_key] = o;
  });

  const upsertMutation = useMutation({
    mutationFn: async ({ key, value, type, imageUrl }: { key: string; value: string; type: string; imageUrl: string }) => {
      const existing = overrides[key];
      if (existing) {
        const { error } = await supabase
          .from("content_overrides")
          .update({
            content_value: value,
            content_type: type,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          } as any)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("content_overrides")
          .insert({
            content_key: key,
            content_value: value,
            content_type: type,
            image_url: imageUrl,
          } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content-overrides"] });
      toast.success("Content saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveOverride = (key: string, value: string, type = "text", imageUrl = "") => {
    upsertMutation.mutate({ key, value, type, imageUrl });
  };

  const getOverride = (key: string) => overrides[key]?.content_value || undefined;
  const getImageOverride = (key: string) => overrides[key]?.image_url || undefined;

  // Turn off edit mode if not admin
  useEffect(() => {
    if (!isAdmin) setEditMode(false);
  }, [isAdmin]);

  return (
    <EditModeContext.Provider
      value={{
        editMode,
        setEditMode,
        canEdit: isAdmin,
        overrides,
        saveOverride,
        getOverride,
        getImageOverride,
        saving: upsertMutation.isPending,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
};
