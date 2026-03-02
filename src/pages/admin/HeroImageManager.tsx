import { useRef, useState } from "react";
import { useHeroImages, useUploadHeroImage, useUpdateHeroImage, useDeleteHeroImage, HeroImage } from "@/hooks/useHeroImages";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Trash2, Upload, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const HeroImageManager = () => {
  const { data: images, isLoading } = useHeroImages(false);
  const upload = useUploadHeroImage();
  const update = useUpdateHeroImage();
  const remove = useDeleteHeroImage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingAlt, setEditingAlt] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      await upload.mutateAsync(file);
    }
    if (fileRef.current) fileRef.current.value = "";
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
            <p className="text-muted-foreground">
              Manage the slideshow images on the landing page. Upload multiple images and they will rotate automatically.
            </p>
          </div>
          <Button onClick={() => fileRef.current?.click()} className="gap-2">
            <Upload size={16} /> Upload Images
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {isLoading && <p className="text-muted-foreground">Loading images...</p>}

        {images && images.length === 0 && (
          <div className="border border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground">
            No hero images yet. Upload your first image to get started.
          </div>
        )}

        <div className="grid gap-4">
          {images?.map((img, idx) => (
            <div
              key={img.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border border-border bg-card",
                !img.is_active && "opacity-60"
              )}
            >
              <GripVertical className="text-muted-foreground shrink-0" size={20} />

              <img
                src={img.image_url}
                alt={img.alt_text}
                className="w-24 h-16 object-cover rounded-lg shrink-0"
              />

              <div className="flex-1 min-w-0 space-y-2">
                {editingAlt === img.id ? (
                  <Input
                    defaultValue={img.alt_text}
                    placeholder="Alt text / description"
                    onBlur={(e) => {
                      update.mutate({ id: img.id, alt_text: e.target.value });
                      setEditingAlt(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        update.mutate({ id: img.id, alt_text: (e.target as HTMLInputElement).value });
                        setEditingAlt(null);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <p
                    className="text-sm text-foreground truncate cursor-pointer hover:text-primary"
                    onClick={() => setEditingAlt(img.id)}
                  >
                    {img.alt_text || "Click to add alt text"}
                  </p>
                )}

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Interval (sec):
                    <Input
                      type="number"
                      className="w-16 h-7 text-xs"
                      defaultValue={img.interval_seconds}
                      min={1}
                      max={30}
                      onBlur={(e) =>
                        update.mutate({ id: img.id, interval_seconds: parseInt(e.target.value) || 5 })
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  Active
                  <Switch
                    checked={img.is_active}
                    onCheckedChange={(checked) => update.mutate({ id: img.id, is_active: checked })}
                  />
                </label>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveImage(img, "up")}
                  disabled={idx === 0}
                >
                  <ArrowUp size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveImage(img, "down")}
                  disabled={idx === (images?.length ?? 0) - 1}
                >
                  <ArrowDown size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove.mutate(img)}
                >
                  <Trash2 size={16} />
                </Button>
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
