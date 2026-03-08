import { useRef } from "react";
import { useEditMode } from "@/hooks/useEditMode";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";

interface EditableImageProps {
  contentKey: string;
  defaultSrc: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
}

const EditableImage = ({
  contentKey,
  defaultSrc,
  alt = "",
  className = "",
  imgClassName = "",
}: EditableImageProps) => {
  const { editMode, getImageOverride, saveOverride } = useEditMode();
  const fileRef = useRef<HTMLInputElement>(null);

  const displaySrc = getImageOverride(contentKey) || defaultSrc;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const ext = file.name.split(".").pop();
      const path = `overrides/${contentKey.replace(/\./g, "-")}-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("hero-images")
        .upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from("hero-images")
        .getPublicUrl(path);
      saveOverride(contentKey, alt, "image", urlData.publicUrl);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (!editMode) {
    return (
      <div className={className}>
        <img src={displaySrc} alt={alt} className={imgClassName} />
      </div>
    );
  }

  return (
    <div className={`relative group/img ${className}`}>
      <img src={displaySrc} alt={alt} className={imgClassName} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <div
        onClick={() => fileRef.current?.click()}
        className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center gap-2 z-40"
      >
        <Upload size={28} className="text-white" />
        <span className="text-white text-sm font-medium">Click to replace image</span>
      </div>
    </div>
  );
};

export default EditableImage;
