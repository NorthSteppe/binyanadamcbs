import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ContentOverride {
  id: string;
  content_key: string;
  content_value: string;
  content_type: string;
  image_url: string;
  style_json: Record<string, any>;
}

interface SaveArgs {
  key: string;
  value?: string;
  type?: string;
  imageUrl?: string;
  styleJson?: Record<string, any>;
}

interface EditModeContextType {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  canEdit: boolean;
  overrides: Record<string, ContentOverride>;
  saveOverride: (args: SaveArgs) => void;
  getOverride: (key: string) => string | undefined;
  getImageOverride: (key: string) => string | undefined;
  getStyleOverride: (key: string) => Record<string, any>;
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
  getStyleOverride: () => ({}),
  saving: false,
});

export const useEditMode = () => useContext(EditModeContext);

export const EditModeProvider = ({ children }: { children: ReactNode }) => {
  const { isAdmin } = useAuth();
  // Initialise from sessionStorage so admins can launch edit mode from /admin/site-content and have it persist on the public page.
  const [editMode, setEditModeState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("ba-edit-mode") === "1";
  });
  const setEditMode = (v: boolean) => {
    setEditModeState(v);
    if (typeof window !== "undefined") {
      if (v) sessionStorage.setItem("ba-edit-mode", "1");
      else sessionStorage.removeItem("ba-edit-mode");
    }
  };
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
    overrides[o.content_key] = {
      ...o,
      style_json: (o.style_json as any) || {},
    };
  });

  const upsertMutation = useMutation({
    mutationFn: async ({ key, value, type, imageUrl, styleJson }: Required<Omit<SaveArgs, "key">> & { key: string }) => {
      const existing = overrides[key];
      if (existing) {
        const payload: any = { updated_at: new Date().toISOString() };
        if (value !== undefined) payload.content_value = value;
        if (type !== undefined) payload.content_type = type;
        if (imageUrl !== undefined) payload.image_url = imageUrl;
        if (styleJson !== undefined) payload.style_json = styleJson;
        const { error } = await supabase
          .from("content_overrides")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("content_overrides").insert({
          content_key: key,
          content_value: value ?? "",
          content_type: type ?? "text",
          image_url: imageUrl ?? "",
          style_json: styleJson ?? {},
        } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content-overrides"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveOverride = (args: SaveArgs) => {
    const existing = overrides[args.key];
    upsertMutation.mutate({
      key: args.key,
      value: args.value !== undefined ? args.value : existing?.content_value ?? "",
      type: args.type !== undefined ? args.type : existing?.content_type ?? "text",
      imageUrl: args.imageUrl !== undefined ? args.imageUrl : existing?.image_url ?? "",
      styleJson: args.styleJson !== undefined ? args.styleJson : existing?.style_json ?? {},
    });
  };

  const getOverride = (key: string) => overrides[key]?.content_value || undefined;
  const getImageOverride = (key: string) => overrides[key]?.image_url || undefined;
  const getStyleOverride = (key: string) => overrides[key]?.style_json || {};

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
        getStyleOverride,
        saving: upsertMutation.isPending,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
};
