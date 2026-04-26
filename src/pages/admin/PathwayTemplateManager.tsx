import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getPathwayIcon, PATHWAY_ICON_NAMES } from "@/lib/pathwayIcons";

interface Template {
  id: string;
  pathway_kind: string;
  label: string;
  description: string;
  icon: string;
  link: string;
  step_type: string;
  display_order: number;
  is_active: boolean;
}

const blank: Omit<Template, "id"> = {
  pathway_kind: "support", label: "", description: "", icon: "Circle",
  link: "", step_type: "custom", display_order: 0, is_active: true,
};

const PathwayTemplateManager = () => {
  const [kind, setKind] = useState<"support" | "fba">("support");
  const [items, setItems] = useState<Template[]>([]);
  const [editing, setEditing] = useState<Template | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<Template, "id">>(blank);

  const load = async () => {
    const { data, error } = await supabase
      .from("pathway_step_templates")
      .select("*")
      .eq("pathway_kind", kind)
      .order("display_order");
    if (error) toast.error(error.message);
    setItems((data as Template[]) ?? []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [kind]);

  const save = async () => {
    if (!draft.label.trim()) return toast.error("Label required");
    if (editing) {
      const { error } = await supabase
        .from("pathway_step_templates")
        .update({ ...draft, pathway_kind: kind })
        .eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Template updated");
    } else {
      const next = (items[items.length - 1]?.display_order ?? 0) + 10;
      const { error } = await supabase.from("pathway_step_templates").insert({
        ...draft, pathway_kind: kind, display_order: next,
      });
      if (error) return toast.error(error.message);
      toast.success("Template added");
    }
    setEditing(null); setAdding(false); setDraft({ ...blank, pathway_kind: kind });
    load();
  };

  const move = async (t: Template, dir: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === t.id);
    const swap = items[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("pathway_step_templates").update({ display_order: swap.display_order }).eq("id", t.id),
      supabase.from("pathway_step_templates").update({ display_order: t.display_order }).eq("id", swap.id),
    ]);
    load();
  };

  const remove = async (t: Template) => {
    if (!confirm(`Delete "${t.label}"?`)) return;
    const { error } = await supabase.from("pathway_step_templates").delete().eq("id", t.id);
    if (error) toast.error(error.message);
    else load();
  };

  const openEdit = (t: Template) => {
    setEditing(t);
    setDraft({ ...t });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft size={14} /> Back to Admin
          </Link>
          <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold">Pathway Templates</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Default steps copied to each new client pathway. Edits here apply to future clients only — existing clients keep their own copies.
              </p>
            </div>
            <Button className="rounded-full gap-2" onClick={() => { setAdding(true); setEditing(null); setDraft({ ...blank, pathway_kind: kind }); }}>
              <Plus size={14} /> Add step
            </Button>
          </div>

          <Tabs value={kind} onValueChange={(v) => setKind(v as any)} className="mt-6">
            <TabsList className="rounded-full">
              <TabsTrigger value="support" className="rounded-full">Support Pathway</TabsTrigger>
              <TabsTrigger value="fba" className="rounded-full">FBA Pathway</TabsTrigger>
            </TabsList>

            <TabsContent value={kind} className="mt-4 space-y-3">
              {items.length === 0 && (
                <Card className="p-8 text-center text-sm text-muted-foreground">No steps yet — add one above.</Card>
              )}
              {items.map((t, i) => {
                const Icon = getPathwayIcon(t.icon);
                return (
                  <Card key={t.id} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{t.label}</p>
                      {t.description && <p className="text-sm text-muted-foreground line-clamp-1">{t.description}</p>}
                      {t.link && <p className="text-xs text-primary/80 mt-0.5 truncate">{t.link}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(t, -1)} disabled={i === 0}><ChevronUp size={14} /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(t, 1)} disabled={i === items.length - 1}><ChevronDown size={14} /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(t)}><Pencil size={13} /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(t)}><Trash2 size={13} /></Button>
                    </div>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>

          <Dialog open={!!editing || adding} onOpenChange={(o) => { if (!o) { setEditing(null); setAdding(false); } }}>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit step" : "Add step"}</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-2">
                <Input placeholder="Label" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
                <Textarea placeholder="Description" rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Icon</label>
                    <Select value={draft.icon} onValueChange={(v) => setDraft({ ...draft, icon: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {PATHWAY_ICON_NAMES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Type</label>
                    <Select value={draft.step_type} onValueChange={(v) => setDraft({ ...draft, step_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="link">Link</SelectItem>
                        <SelectItem value="agreement">Agreement</SelectItem>
                        <SelectItem value="intake">Intake</SelectItem>
                        <SelectItem value="report">Report</SelectItem>
                        <SelectItem value="sessions">Sessions</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Input placeholder="Link (e.g. /portal/booking)" value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} />
                <Button className="w-full rounded-full" onClick={save}>{editing ? "Save changes" : "Add step"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PathwayTemplateManager;
