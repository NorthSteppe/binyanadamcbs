import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, ArrowRight, Pencil, Trash2, ChevronUp, ChevronDown, GripVertical, Sparkles, RefreshCw } from "lucide-react";
import { getPathwayIcon, PATHWAY_ICON_NAMES, STATUS_COLORS } from "@/lib/pathwayIcons";

interface ClientStep {
  id: string;
  client_id: string;
  template_id: string | null;
  pathway_kind: string;
  label: string;
  description: string;
  icon: string;
  link: string;
  step_type: string;
  display_order: number;
  status: string;
  completed_at: string | null;
  notes: string;
}

interface Props {
  clientId: string;
  pathwayKind?: "support" | "fba";
  audience: "client" | "staff" | "admin";
  className?: string;
}

const STATUS_OPTIONS = ["pending", "in_progress", "completed", "skipped"];

const SupportPathwayBoard = ({ clientId, pathwayKind = "support", audience, className = "" }: Props) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const canEdit = audience === "admin" || audience === "staff";
  const canManageStructure = isAdmin || audience === "staff";

  const [steps, setSteps] = useState<ClientStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ClientStep | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    label: "", description: "", icon: "Circle", link: "", step_type: "custom",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("client_pathway_steps")
      .select("*")
      .eq("client_id", clientId)
      .eq("pathway_kind", pathwayKind)
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    setSteps((data as ClientStep[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (clientId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, pathwayKind]);

  const seedFromTemplates = async () => {
    if (!canManageStructure) return;
    const { data: templates, error } = await supabase
      .from("pathway_step_templates")
      .select("*")
      .eq("pathway_kind", pathwayKind)
      .eq("is_active", true)
      .order("display_order");
    if (error || !templates?.length) {
      toast.error("No active templates to copy");
      return;
    }
    const rows = templates.map((t: any) => ({
      client_id: clientId,
      template_id: t.id,
      pathway_kind: pathwayKind,
      label: t.label,
      description: t.description,
      icon: t.icon,
      link: t.link,
      step_type: t.step_type,
      display_order: t.display_order,
      status: "pending",
    }));
    const { error: insErr } = await supabase.from("client_pathway_steps").insert(rows);
    if (insErr) toast.error(insErr.message);
    else { toast.success("Pathway initialised from defaults"); load(); }
  };

  const updateStatus = async (step: ClientStep, status: string) => {
    const completed_at = status === "completed" ? new Date().toISOString() : null;
    const { error } = await supabase
      .from("client_pathway_steps")
      .update({ status, completed_at })
      .eq("id", step.id);
    if (error) toast.error(error.message);
    else load();
  };

  const move = async (step: ClientStep, direction: -1 | 1) => {
    const idx = steps.findIndex((s) => s.id === step.id);
    const swap = steps[idx + direction];
    if (!swap) return;
    await Promise.all([
      supabase.from("client_pathway_steps").update({ display_order: swap.display_order }).eq("id", step.id),
      supabase.from("client_pathway_steps").update({ display_order: step.display_order }).eq("id", swap.id),
    ]);
    load();
  };

  const removeStep = async (step: ClientStep) => {
    if (!confirm(`Remove "${step.label}"?`)) return;
    const { error } = await supabase.from("client_pathway_steps").delete().eq("id", step.id);
    if (error) toast.error(error.message);
    else load();
  };

  const saveStep = async () => {
    if (!draft.label.trim()) return toast.error("Label required");
    if (editing) {
      const { error } = await supabase
        .from("client_pathway_steps")
        .update({
          label: draft.label, description: draft.description,
          icon: draft.icon, link: draft.link, step_type: draft.step_type,
        })
        .eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Step updated");
    } else {
      const nextOrder = (steps[steps.length - 1]?.display_order ?? 0) + 10;
      const { error } = await supabase.from("client_pathway_steps").insert({
        client_id: clientId,
        pathway_kind: pathwayKind,
        label: draft.label,
        description: draft.description,
        icon: draft.icon,
        link: draft.link,
        step_type: draft.step_type,
        display_order: nextOrder,
        status: "pending",
      });
      if (error) return toast.error(error.message);
      toast.success("Step added");
    }
    setEditing(null);
    setAdding(false);
    setDraft({ label: "", description: "", icon: "Circle", link: "", step_type: "custom" });
    load();
  };

  const openEdit = (s: ClientStep) => {
    setEditing(s);
    setDraft({
      label: s.label, description: s.description, icon: s.icon,
      link: s.link, step_type: s.step_type,
    });
  };

  const completed = useMemo(() => steps.filter((s) => s.status === "completed").length, [steps]);
  const total = steps.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  if (loading) {
    return <div className={`text-sm text-muted-foreground ${className}`}>Loading pathway…</div>;
  }

  if (!steps.length) {
    return (
      <Card className={`p-8 text-center space-y-4 ${className}`}>
        <p className="text-sm text-muted-foreground">No pathway steps yet for this client.</p>
        {canManageStructure ? (
          <Button onClick={seedFromTemplates} className="rounded-full gap-2">
            <Sparkles size={14} /> Initialise from default pathway
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">Your therapist will set this up shortly.</p>
        )}
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress bar */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">
            {pathwayKind === "support" ? "Support Pathway" : "FBA Pathway"}
          </p>
          <p className="text-xs text-muted-foreground">{completed} of {total} steps · {progress}%</p>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <ol className="space-y-3">
        {steps.map((s, i) => {
          const Icon = getPathwayIcon(s.icon);
          const status = STATUS_COLORS[s.status] ?? STATUS_COLORS.pending;
          const clickable = !!s.link;

          return (
            <li key={s.id}>
              <Card
                className={`p-4 sm:p-5 ring-1 ${status.ring} transition-all hover:shadow-md ${clickable ? "cursor-pointer" : ""}`}
                onClick={(e) => {
                  // ignore clicks on action buttons
                  if ((e.target as HTMLElement).closest("[data-no-nav]")) return;
                  if (clickable) navigate(s.link);
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Step number + icon */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className={`w-11 h-11 rounded-full ${status.bg} ${status.text} flex items-center justify-center`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">Step {i + 1}</span>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base leading-tight">{s.label}</h3>
                        {s.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={`${status.text} ${status.ring} text-[10px]`}>
                        {status.label}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap" data-no-nav>
                      {clickable && (
                        <Button
                          size="sm"
                          variant="default"
                          className="rounded-full gap-1.5 h-8"
                          onClick={(e) => { e.stopPropagation(); navigate(s.link); }}
                        >
                          Open <ArrowRight size={12} />
                        </Button>
                      )}
                      {canEdit && (
                        <Select
                          value={s.status}
                          onValueChange={(v) => updateStatus(s, v)}
                        >
                          <SelectTrigger className="h-8 text-xs w-[140px] rounded-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((o) => (
                              <SelectItem key={o} value={o} className="text-xs">
                                {STATUS_COLORS[o].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {audience === "client" && s.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full h-8 text-xs"
                          onClick={(e) => { e.stopPropagation(); updateStatus(s, "completed"); }}
                        >
                          Mark done
                        </Button>
                      )}

                      {canManageStructure && (
                        <div className="ml-auto flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); move(s, -1); }} disabled={i === 0}>
                            <ChevronUp size={14} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); move(s, 1); }} disabled={i === steps.length - 1}>
                            <ChevronDown size={14} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEdit(s); }}>
                            <Pencil size={13} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); removeStep(s); }}>
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ol>

      {canManageStructure && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full gap-2" onClick={() => { setAdding(true); setEditing(null); setDraft({ label: "", description: "", icon: "Circle", link: "", step_type: "custom" }); }}>
            <Plus size={14} /> Add custom step
          </Button>
          <Button variant="ghost" className="rounded-full gap-2 text-muted-foreground" onClick={seedFromTemplates}>
            <RefreshCw size={14} /> Add missing default steps
          </Button>
        </div>
      )}

      <Dialog open={!!editing || adding} onOpenChange={(o) => { if (!o) { setEditing(null); setAdding(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit step" : "Add step"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Label" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
            <Textarea placeholder="Description" rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Icon</label>
                <Select value={draft.icon} onValueChange={(v) => setDraft({ ...draft, icon: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {PATHWAY_ICON_NAMES.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
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
            <Button className="w-full rounded-full" onClick={saveStep}>{editing ? "Save changes" : "Add step"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportPathwayBoard;
