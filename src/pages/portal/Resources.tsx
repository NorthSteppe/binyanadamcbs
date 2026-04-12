import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Download, ExternalLink, Upload, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string | null;
  external_url: string | null;
  created_at: string;
  created_by: string | null;
}

const CATEGORIES = ["general", "worksheets", "guides", "articles", "videos", "templates"];

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState("all");
  const { t } = useLanguage();
  const { session, roles } = useAuth();
  const portalT = (t as any).portalResources || {};

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newResource, setNewResource] = useState({ title: "", description: "", category: "general", external_url: "" });
  const [file, setFile] = useState<File | null>(null);

  const isStaff = roles?.includes("admin") || roles?.includes("team_member");

  const fetchResources = () => {
    supabase.from("resources").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setResources(data);
    });
  };

  useEffect(() => { fetchResources(); }, []);

  const handleUpload = async () => {
    if (!session || !newResource.title.trim()) return;
    setUploading(true);

    try {
      let fileUrl: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${session.user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("information")
          .upload(path, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("information")
          .getPublicUrl(path);
        fileUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("resources").insert({
        title: newResource.title,
        description: newResource.description || null,
        category: newResource.category,
        file_url: fileUrl,
        external_url: newResource.external_url || null,
        created_by: session.user.id,
      });

      if (error) throw error;

      toast.success("Resource uploaded!");
      setUploadOpen(false);
      setNewResource({ title: "", description: "", category: "general", external_url: "" });
      setFile(null);
      fetchResources();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload resource");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Resource deleted");
    fetchResources();
  };

  const categories = ["all", ...Array.from(new Set(resources.map((r) => r.category)))];
  const filtered = filter === "all" ? resources : resources.filter((r) => r.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl md:text-4xl flex items-center gap-3">
                <BookOpen className="text-primary" size={28} />
                {portalT.resourceLibrary || "Resource Library"}
              </h1>
              {session && (
                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2"><Upload size={16} />{portalT.uploadResourceBtn || "Upload Resource"}</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{portalT.uploadResourceTitle || "Upload a Resource"}</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label>{portalT.titleLbl || "Title"}</Label>
                        <Input value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} placeholder={portalT.titlePlaceholder || "Resource title"} />
                      </div>
                      <div>
                        <Label>{portalT.descriptionLbl || "Description"}</Label>
                        <Textarea value={newResource.description} onChange={(e) => setNewResource({ ...newResource, description: e.target.value })} placeholder={portalT.descriptionPlaceholder || "Brief description"} rows={2} />
                      </div>
                      <div>
                        <Label>{portalT.categoryLbl || "Category"}</Label>
                        <Select value={newResource.category} onValueChange={(v) => setNewResource({ ...newResource, category: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{portalT.fileLbl || "File (optional)"}</Label>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt,.xlsx,.pptx"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">{portalT.fileHint || "PDF, Word, Images, Excel, PowerPoint (max 10MB)"}</p>
                      </div>
                      <div>
                        <Label>{portalT.urlLbl || "External URL (optional)"}</Label>
                        <Input value={newResource.external_url} onChange={(e) => setNewResource({ ...newResource, external_url: e.target.value })} placeholder="https://..." />
                      </div>
                      <Button className="w-full" onClick={handleUpload} disabled={!newResource.title.trim() || uploading}>
                        {uploading ? <Loader2 size={14} className="me-1 animate-spin" /> : <Upload size={14} className="me-1" />}
                        {uploading ? (portalT.uploadingBtn || "Uploading...") : (portalT.uploadResourceBtn || "Upload Resource")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <p className="text-muted-foreground mb-8">{portalT.resourceSubtitle || "Articles, guides, and materials to support your journey."}</p>
          </motion.div>

          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                size="sm"
                className="rounded-full capitalize"
                onClick={() => setFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="mx-auto text-muted-foreground mb-4" size={40} />
              <p className="text-muted-foreground">{portalT.noResources || "No resources available yet."}</p>
              {session && (
                <Button className="mt-4 gap-2" onClick={() => setUploadOpen(true)}>
                  <Upload size={16} /> {portalT.uploadFirst || "Upload your first resource"}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((resource, i) => {
                const isOwn = resource.created_by === session?.user?.id;
                const canDelete = isOwn || isStaff;
                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-2xl border border-border/50 p-6 flex flex-col group"
                  >
                    <span className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">{resource.category}</span>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{resource.title}</h3>
                    {resource.description && <p className="text-sm text-muted-foreground mb-4 flex-1">{resource.description}</p>}
                    <div className="flex gap-2 mt-auto items-center">
                      {resource.file_url && (
                        <Button asChild variant="outline" size="sm" className="rounded-full gap-2">
                          <a href={resource.file_url} target="_blank" rel="noopener noreferrer"><Download size={14} />{portalT.downloadBtn || "Download"}</a>
                        </Button>
                      )}
                      {resource.external_url && (
                        <Button asChild variant="outline" size="sm" className="rounded-full gap-2">
                          <a href={resource.external_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} />{portalT.viewBtn || "View"}</a>
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 ms-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(resource.id)}>
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Resources;
