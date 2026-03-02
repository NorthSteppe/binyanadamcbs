import { useRef, useState } from "react";
import { useHeroImages, useUpdateHeroImage, useDeleteHeroImage, HeroImage } from "@/hooks/useHeroImages";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Trash2, Upload, GripVertical, ArrowUp, ArrowDown, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PendingUpload {
  file: File;
  previewUrl: string;
  alt_text: string;
  display_order: number;
}

const HeroImageManager = () => {
  const { data: images, isLoading } = useHeroImages(false);
  const update = useUpdateHeroImage();
  const remove = useDeleteHeroImage();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [saving, setSaving] = useState(false);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const maxOrder = images?.reduce((max, img) => Math.max(max, img.display_order), -1) ?? -1;
    const existingPendingMax = pendingUploads.reduce((max, p) => Math.max(max, p.display_order), maxOrder);

    const newPending: PendingUpload[] = Array.from(files).map((file, i) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      alt_text: file.name.replace(/\.[^.]+$/, ""),
      display_order: existingPendingMax + 1 + i,
    }));
    setPendingUploads((prev) => [...prev, ...newPending]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const updatePending = (idx: number, updates: Partial<PendingUpload>) => {
    setPendingUploads((prev) => prev.map((p, i) => (i === idx ? { ...p, ...updates } : p)));
  };

  const removePending = (idx: number) => {
    setPendingUploads((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const saveAll = async () => {
    if (pendingUploads.length === 0) return;
    setSaving(true);
    try {
      for (const pending of pendingUploads) {
        const ext = pending.file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("hero-images").upload(path, pending.file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("hero-images").getPublicUrl(path);
        const { error: insertError } = await supabase.from("hero_images").insert({
          image_url: urlData.publicUrl,
          alt_text: pending.alt_text,
          display_order: pending.display_order,
          is_active: true,
        });
        if (insertError) throw insertError;
        URL.revokeObjectURL(pending.previewUrl);
      }
      setPendingUploads([]);
      queryClient.invalidateQueries({ queryKey: ["hero-images"] });
      toast.success(`${pendingUploads.length} image(s) uploaded`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const moveImage = (img: HeroImage, direction: "up" | "down") => {
    if (!images) return;
    const idx = images.findIndex((i) => i.id === img.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= images.length) return;
    const other = images[swapIdx];
    update.mutate({ id: img.id, display_order: other.display_order });
    update.mutate({ id: other.id, display_order: img.display_order });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container py-24 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl text-foreground mb-1">Hero Image Manager</h1>
            <p className="text-muted-foreground">Manage the slideshow images on the landing page.</p>
          </div>
          <Button onClick={() => fileRef.current?.click()} className="gap-2">
            <Upload size={16} /> Add Images
          </Button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} />
        </div>

        {/* Pending uploads staging area */}
        {pendingUploads.length > 0 && (
          <div className="mb-8 border border-primary/30 rounded-2xl p-6 bg-primary/5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">New Images — Edit before saving</h2>
              <Button onClick={saveAll} disabled={saving} className="gap-2">
                <Save size={16} /> {saving ? "Saving..." : `Save ${pendingUploads.length} Image(s)`}
              </Button>
            </div>
            {pendingUploads.map((p, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                <img src={p.previewUrl} alt="Preview" className="w-24 h-16 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Input
                    value={p.alt_text}
                    placeholder="Alt text / description"
                    onChange={(e) => updatePending(idx, { alt_text: e.target.value })}
                  />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Display order:
                    <Input
                      type="number"
                      className="w-20 h-7 text-xs"
                      value={p.display_order}
                      onChange={(e) => updatePending(idx, { display_order: parseInt(e.target.value) || 0 })}
                    />
                  </label>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removePending(idx)}>
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {isLoading && <p className="text-muted-foreground">Loading images...</p>}

        {images && images.length === 0 && pendingUploads.length === 0 && (
          <div className="border border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground">
            No hero images yet. Upload your first image to get started.
          </div>
        )}

        <div className="grid gap-4">
          {images?.map((img, idx) => (
            <div
              key={img.id}
              className={cn("flex items-center gap-4 p-4 rounded-xl border border-border bg-card", !img.is_active && "opacity-60")}
            >
              <GripVertical className="text-muted-foreground shrink-0" size={20} />
              <img src={img.image_url} alt={img.alt_text} className="w-24 h-16 object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                {editingAlt === img.id ? (
                  <Input
                    defaultValue={img.alt_text}
                    placeholder="Alt text / description"
                    onBlur={(e) => { update.mutate({ id: img.id, alt_text: e.target.value }); setEditingAlt(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { update.mutate({ id: img.id, alt_text: (e.target as HTMLInputElement).value }); setEditingAlt(null); } }}
                    autoFocus
                  />
                ) : (
                  <p className="text-sm text-foreground truncate cursor-pointer hover:text-primary" onClick={() => setEditingAlt(img.id)}>
                    {img.alt_text || "Click to add alt text"}
                  </p>
                )}
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Interval (sec):
                  <Input type="number" className="w-16 h-7 text-xs" defaultValue={img.interval_seconds} min={1} max={30}
                    onBlur={(e) => update.mutate({ id: img.id, interval_seconds: parseInt(e.target.value) || 5 })} />
                </label>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  Active
                  <Switch checked={img.is_active} onCheckedChange={(checked) => update.mutate({ id: img.id, is_active: checked })} />
                </label>
                <Button variant="ghost" size="icon" onClick={() => moveImage(img, "up")} disabled={idx === 0}><ArrowUp size={16} /></Button>
                <Button variant="ghost" size="icon" onClick={() => moveImage(img, "down")} disabled={idx === (images?.length ?? 0) - 1}><ArrowDown size={16} /></Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => remove.mutate(img)}><Trash2 size={16} /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HeroImageManager;
