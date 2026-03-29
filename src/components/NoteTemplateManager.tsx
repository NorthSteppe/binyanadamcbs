import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText, Share2, Edit } from "lucide-react";
import { toast } from "sonner";

interface NoteTemplate {
  id: string;
  created_by: string;
  title: string;
  description: string;
  template_content: string;
  is_shared: boolean;
  created_at: string;
}

interface NoteTemplateManagerProps {
  onApplyTemplate?: (content: string) => void;
  mode?: "manage" | "select";
}

const NoteTemplateManager = ({ onApplyTemplate, mode = "manage" }: NoteTemplateManagerProps) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", template_content: "", is_shared: false });

  const { data: templates = [] } = useQuery({
    queryKey: ["note_templates"],
    queryFn: async () => {
      const { data } = await (supabase.from("note_templates") as any)
        .select("*")
        .order("created_at", { ascending: false });
      return (data || []) as NoteTemplate[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await (supabase.from("note_templates") as any)
          .update({ title: form.title, description: form.description, template_content: form.template_content, is_shared: form.is_shared, updated_at: new Date().toISOString() })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from("note_templates") as any)
          .insert({ created_by: user!.id, title: form.title, description: form.description, template_content: form.template_content, is_shared: form.is_shared });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["note_templates"] });
      toast.success(editingId ? "Template updated" : "Template created");
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to save template"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("note_templates") as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["note_templates"] });
      toast.success("Template deleted");
    },
  });

  const resetForm = () => {
    setForm({ title: "", description: "", template_content: "", is_shared: false });
    setEditingId(null);
  };

  const openEdit = (t: NoteTemplate) => {
    setEditingId(t.id);
    setForm({ title: t.title, description: t.description, template_content: t.template_content, is_shared: t.is_shared });
    setDialogOpen(true);
  };

  if (mode === "select") {
    return (
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-1"><FileText size={12} /> Apply Template</Label>
        <div className="flex flex-wrap gap-1.5">
          {templates.map((t) => (
            <Button
              key={t.id}
              variant="outline"
              size="sm"
              className="text-xs gap-1 h-7"
              onClick={() => onApplyTemplate?.(t.template_content)}
            >
              <FileText size={10} /> {t.title}
            </Button>
          ))}
          {templates.length === 0 && <span className="text-xs text-muted-foreground">No templates yet</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText size={18} /> Note Templates
        </h3>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus size={14} /> New Template</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Template" : "Create Note Template"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. ABA Session Summary" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of when to use this" />
              </div>
              <div>
                <Label>Template Content</Label>
                <p className="text-xs text-muted-foreground mb-1">
                  Use placeholders like [Client Name], [Date], [Targets], etc. These serve as prompts for the therapist.
                </p>
                <Textarea
                  value={form.template_content}
                  onChange={(e) => setForm({ ...form, template_content: e.target.value })}
                  placeholder={`Session Date: [Date]\nClient: [Client Name]\n\nTargets Addressed:\n- \n\nInterventions Used:\n- \n\nClient Response:\n\nData Summary:\n\nNext Steps:\n`}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_shared} onCheckedChange={(c) => setForm({ ...form, is_shared: c })} />
                <Label className="flex items-center gap-1"><Share2 size={12} /> Share with team</Label>
              </div>
              <Button className="w-full" onClick={() => saveMutation.mutate()} disabled={!form.title || !form.template_content}>
                {editingId ? "Update Template" : "Create Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {templates.map((t) => (
          <Card key={t.id} className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium">{t.title}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}>
                    <Edit size={12} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(t.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {t.description && <p className="text-xs text-muted-foreground mb-2">{t.description}</p>}
              <pre className="text-xs bg-muted/50 rounded p-2 whitespace-pre-wrap max-h-24 overflow-y-auto font-mono">
                {t.template_content.slice(0, 200)}{t.template_content.length > 200 ? "..." : ""}
              </pre>
              <div className="flex gap-1 mt-2">
                {t.is_shared && <Badge variant="secondary" className="text-[10px]"><Share2 size={8} className="mr-1" /> Shared</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
        {templates.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-2">No templates yet. Create one to standardise your session notes.</p>
        )}
      </div>
    </div>
  );
};

export default NoteTemplateManager;
