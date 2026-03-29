import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, ExternalLink, GripVertical, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  usePartnerBadges,
  useUpsertPartnerBadge,
  useDeletePartnerBadge,
  type PartnerBadge,
} from "@/hooks/usePartnerBadges";

const BadgeManager = () => {
  const { data: badges, isLoading } = usePartnerBadges(false);
  const upsert = useUpsertPartnerBadge();
  const remove = useDeletePartnerBadge();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<PartnerBadge> | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `badges/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("hero-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("hero-images").getPublicUrl(path);
      setEditing((prev) => ({ ...prev, image_url: data.publicUrl }));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!editing?.name || !editing?.image_url) {
      toast.error("Name and image are required");
      return;
    }
    upsert.mutate(editing as any, {
      onSuccess: () => { setDialogOpen(false); setEditing(null); },
    });
  };

  const openEdit = (badge: PartnerBadge) => {
    setEditing({ ...badge });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing({ name: "", image_url: "", link_url: "", display_order: (badges?.length ?? 0), is_active: true });
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container py-10">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" asChild><Link to="/admin"><ArrowLeft size={18} /></Link></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Partner Badges</h1>
            <p className="text-sm text-muted-foreground">Manage accreditation & partner logos on the landing page</p>
          </div>
          <div className="ml-auto">
            <Button onClick={openNew}><Plus size={16} className="mr-2" /> Add Badge</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges?.map((badge) => (
              <Card key={badge.id} className="p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEdit(badge)}>
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  <img src={badge.image_url} alt={badge.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{badge.name}</p>
                  {badge.link_url && <p className="text-xs text-muted-foreground flex items-center gap-1 truncate"><ExternalLink size={10} /> {badge.link_url}</p>}
                  <p className="text-xs text-muted-foreground mt-1">Order: {badge.display_order} · {badge.is_active ? "Active" : "Hidden"}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Badge" : "New Badge"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={editing?.name ?? ""} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label>Image</Label>
              {editing?.image_url && (
                <div className="w-full h-20 bg-muted rounded-lg flex items-center justify-center mb-2">
                  <img src={editing.image_url} alt="" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <Input type="file" accept="image/*" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
            </div>
            <div>
              <Label>Link URL (optional)</Label>
              <Input placeholder="https://example.com" value={editing?.link_url ?? ""} onChange={(e) => setEditing((p) => ({ ...p, link_url: e.target.value }))} />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input type="number" value={editing?.display_order ?? 0} onChange={(e) => setEditing((p) => ({ ...p, display_order: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editing?.is_active ?? true} onCheckedChange={(v) => setEditing((p) => ({ ...p, is_active: v }))} />
              <Label>Active</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleSave} disabled={upsert.isPending}>{upsert.isPending ? "Saving…" : "Save"}</Button>
              {editing?.id && (
                <Button variant="destructive" size="icon" onClick={() => { remove.mutate(editing.id!); setDialogOpen(false); }}>
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default BadgeManager;
