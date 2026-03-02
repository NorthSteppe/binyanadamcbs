import { useRef, useState } from "react";
import { useSiteContent, useUpdateSiteContent, SiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Save } from "lucide-react";
import { toast } from "sonner";

const PAGE_LABELS: Record<string, string> = {
  about: "About Page",
  therapy: "Therapy",
  education: "Education",
  families: "Families",
  organisations: "Organisations",
  supervision: "Supervision",
};

const SiteContentRow = ({ item }: { item: SiteContent }) => {
  const update = useUpdateSiteContent();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localQuote, setLocalQuote] = useState(item.quote_text);
  const [localAuthor, setLocalAuthor] = useState(item.quote_author);
  const [localAlt, setLocalAlt] = useState(item.alt_text);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `site-content/${item.page_key}-${item.section_key}-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("hero-images").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("hero-images").getPublicUrl(path);
      update.mutate({ id: item.id, image_url: urlData.publicUrl });
      toast.success("Image updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const saveText = () => {
    update.mutate({
      id: item.id,
      quote_text: localQuote,
      quote_author: localAuthor,
      alt_text: localAlt,
    });
    toast.success("Saved");
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-4 p-5 rounded-xl border border-border bg-card">
      <div className="shrink-0 w-full md:w-40">
        {item.image_url ? (
          <img src={item.image_url} alt={item.alt_text} className="w-full h-28 object-cover rounded-lg" />
        ) : (
          <div className="w-full h-28 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full gap-1"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={14} /> {uploading ? "Uploading…" : "Change Image"}
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      <div className="flex-1 min-w-0 space-y-2 w-full">
        <p className="text-sm font-semibold text-foreground">
          {PAGE_LABELS[item.page_key] || item.page_key} — {item.section_key}
        </p>
        <Input
          value={localAlt}
          placeholder="Alt text / description"
          onChange={(e) => setLocalAlt(e.target.value)}
        />
        <Input
          value={localQuote}
          placeholder="Quote text (optional)"
          onChange={(e) => setLocalQuote(e.target.value)}
        />
        <Input
          value={localAuthor}
          placeholder="Quote author (optional)"
          onChange={(e) => setLocalAuthor(e.target.value)}
        />
        <Button size="sm" className="gap-1" onClick={saveText}>
          <Save size={14} /> Save
        </Button>
      </div>
    </div>
  );
};

const SiteContentManager = () => {
  const { data: items, isLoading } = useSiteContent();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container py-24 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-foreground mb-1">Site Content Manager</h1>
          <p className="text-muted-foreground">Edit images and quotes shown across the website.</p>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading…</p>}

        <div className="grid gap-4">
          {items?.map((item) => (
            <SiteContentRow key={item.id} item={item} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SiteContentManager;
