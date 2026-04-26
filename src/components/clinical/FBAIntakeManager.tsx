import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Eye, Send, Loader2, ClipboardList, PencilLine, Save, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FBA_INTAKE_SECTIONS, IntakeQuestion, calcCompletion } from "@/lib/fbaIntakeQuestions";
import { useNavigate } from "react-router-dom";
import {
  mapIntakeToReportDraft,
  FBA_PREFILL_STORAGE_KEY,
  FBA_PREFILL_EVENT,
} from "@/lib/fbaIntakeMapping";
import FBAPathway, { FBAPathwayStep } from "@/components/clinical/FBAPathway";

interface ClientOption {
  id: string;
  full_name: string;
}

interface AssignmentRow {
  id: string;
  client_id: string;
  child_name: string;
  status: string;
  notes: string;
  submitted_at: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  in_progress: "bg-sky-100 text-sky-800 border-sky-200",
  submitted: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const FBAIntakeManager = () => {
  const { user, isAdmin } = useAuth();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newClientId, setNewClientId] = useState("");
  const [newChildName, setNewChildName] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [viewing, setViewing] = useState<AssignmentRow | null>(null);
  const [viewResponses, setViewResponses] = useState<Record<string, string>>({});
  const [profilesById, setProfilesById] = useState<Record<string, string>>({});
  const [filling, setFilling] = useState<AssignmentRow | null>(null);
  const [fillResponses, setFillResponses] = useState<Record<string, string>>({});
  const [fillLoading, setFillLoading] = useState(false);
  const [fillSaving, setFillSaving] = useState(false);

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    // Clients I'm assigned to (or all if admin)
    let clientList: ClientOption[] = [];
    if (isAdmin) {
      const { data } = await supabase.from("profiles").select("id, full_name").order("full_name");
      clientList = data || [];
    } else {
      const { data: assigns } = await supabase
        .from("client_assignments")
        .select("client_id")
        .eq("assignee_id", user.id);
      const ids = (assigns || []).map((a) => a.client_id);
      if (ids.length) {
        const { data } = await supabase.from("profiles").select("id, full_name").in("id", ids);
        clientList = data || [];
      }
    }
    setClients(clientList);

    const { data: rows } = await supabase
      .from("fba_intake_assignments")
      .select("id, client_id, child_name, status, notes, submitted_at, created_at")
      .order("created_at", { ascending: false });
    setAssignments(rows || []);
    const map: Record<string, string> = {};
    clientList.forEach((c) => (map[c.id] = c.full_name || "Unnamed"));
    setProfilesById(map);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [user, isAdmin]);

  const handleCreate = async () => {
    if (!newClientId) {
      toast.error("Pick a client first");
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("fba_intake_assignments").insert({
      client_id: newClientId,
      assigned_by: user!.id,
      child_name: newChildName,
      notes: newNotes,
      status: "pending",
    });
    setCreating(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Intake form sent to client portal");
    setCreateOpen(false);
    setNewClientId(""); setNewChildName(""); setNewNotes("");
    loadAll();
  };

  const openView = async (a: AssignmentRow) => {
    setViewing(a);
    const { data } = await supabase
      .from("fba_intake_responses")
      .select("responses")
      .eq("assignment_id", a.id)
      .maybeSingle();
    setViewResponses(((data?.responses as Record<string, string>) ?? {}) || {});
  };

  const openFill = async (a: AssignmentRow) => {
    setFilling(a);
    setFillLoading(true);
    const { data } = await supabase
      .from("fba_intake_responses")
      .select("responses")
      .eq("assignment_id", a.id)
      .maybeSingle();
    setFillResponses(((data?.responses as Record<string, string>) ?? {}) || {});
    setFillLoading(false);
  };

  const updateFillResponse = (key: string, value: string) =>
    setFillResponses((r) => ({ ...r, [key]: value }));

  const persistFill = async (markStatus?: "in_progress" | "submitted") => {
    if (!filling) return;
    const { error: upErr } = await supabase
      .from("fba_intake_responses")
      .upsert(
        { assignment_id: filling.id, client_id: filling.client_id, responses: fillResponses },
        { onConflict: "assignment_id" },
      );
    if (upErr) throw upErr;
    if (markStatus) {
      const update: { status: string; submitted_at?: string } = { status: markStatus };
      if (markStatus === "submitted") update.submitted_at = new Date().toISOString();
      const { error: aErr } = await supabase
        .from("fba_intake_assignments")
        .update(update)
        .eq("id", filling.id);
      if (aErr) throw aErr;
    }
  };

  const handleFillSave = async (submit: boolean) => {
    setFillSaving(true);
    try {
      await persistFill(submit ? "submitted" : (filling?.status === "pending" ? "in_progress" : undefined));
      toast.success(submit ? "Intake submitted" : "Progress saved");
      if (submit) setFilling(null);
      loadAll();
    } catch (e: any) {
      toast.error(e.message || "Could not save");
    } finally {
      setFillSaving(false);
    }
  };

  const renderFillField = (q: IntakeQuestion) => {
    const v = fillResponses[q.key] ?? "";
    if (q.type === "textarea")
      return <Textarea rows={q.rows ?? 3} value={v} onChange={(e) => updateFillResponse(q.key, e.target.value)} />;
    if (q.type === "date")
      return <Input type="date" value={v} onChange={(e) => updateFillResponse(q.key, e.target.value)} />;
    if (q.type === "radio")
      return (
        <div className="flex flex-wrap gap-2">
          {(q.options ?? []).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => updateFillResponse(q.key, opt)}
              className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                v === opt
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/40"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    return <Input value={v} onChange={(e) => updateFillResponse(q.key, e.target.value)} />;
  };


  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList size={15} className="text-primary" /> Parent FBA intake forms
          </h3>
          <p className="text-[11px] text-muted-foreground">Send the Hanley open-ended interview to a client to fill in.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 h-8 text-xs"><Plus size={13} /> New intake</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Send intake form to a client</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Client</Label>
                <Select value={newClientId} onValueChange={setNewClientId}>
                  <SelectTrigger><SelectValue placeholder="Choose an assigned client..." /></SelectTrigger>
                  <SelectContent>
                    {clients.filter((c) => c.id).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name || "Unnamed"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Child / client name (shown to parent)</Label>
                <Input value={newChildName} onChange={(e) => setNewChildName(e.target.value)} placeholder="e.g. Daniel" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Note for the parent (optional)</Label>
                <Textarea rows={3} value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Please complete before our session on..." />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={creating} className="gap-2">
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" size={18} /></div>
      ) : assignments.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No intake forms sent yet.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left p-2.5 font-medium">Client</th>
                <th className="text-left p-2.5 font-medium">Child</th>
                <th className="text-left p-2.5 font-medium">Status</th>
                <th className="text-left p-2.5 font-medium">Sent</th>
                <th className="text-right p-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-t border-border hover:bg-muted/20">
                  <td className="p-2.5">{profilesById[a.client_id] || a.client_id.slice(0, 8)}</td>
                  <td className="p-2.5">{a.child_name || "—"}</td>
                  <td className="p-2.5">
                    <Badge variant="outline" className={`text-[10px] uppercase ${STATUS_COLORS[a.status] || ""}`}>
                      {a.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="p-2.5 text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                  </td>
                  <td className="p-2.5 text-right">
                    <div className="flex justify-end gap-1">
                      {a.status !== "submitted" && (
                        <Button size="sm" variant="ghost" className="h-7 gap-1 text-[11px]" onClick={() => openFill(a)}>
                          <PencilLine size={12} /> Fill
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-[11px]" onClick={() => openView(a)}>
                        <Eye size={12} /> View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Intake responses {viewing?.child_name ? `— ${viewing.child_name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="text-[11px] text-muted-foreground -mt-2 mb-2">
            {calcCompletion(viewResponses)}% complete · status: {viewing?.status.replace("_", " ")}
          </div>
          <div className="space-y-5">
            {FBA_INTAKE_SECTIONS.map((sec) => {
              const answered = sec.questions.filter((q) => (viewResponses[q.key] ?? "").toString().trim());
              if (!answered.length) return null;
              return (
                <div key={sec.id} className="rounded-lg border border-border p-4">
                  <h4 className="text-sm font-semibold mb-3">{sec.title}</h4>
                  <dl className="space-y-3">
                    {sec.questions.map((q) => {
                      const v = (viewResponses[q.key] ?? "").toString();
                      if (!v.trim()) return null;
                      return (
                        <div key={q.key}>
                          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">{q.label}</dt>
                          <dd className="text-sm whitespace-pre-wrap leading-relaxed">{v}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!filling} onOpenChange={(o) => !o && setFilling(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Fill intake with parent {filling?.child_name ? `— ${filling.child_name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="text-[11px] text-muted-foreground -mt-2 mb-3">
            {calcCompletion(fillResponses)}% complete · saving as the client. The parent can keep editing in their portal.
          </div>
          {fillLoading ? (
            <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" size={18} /></div>
          ) : (
            <div className="space-y-5">
              {FBA_INTAKE_SECTIONS.map((sec) => (
                <div key={sec.id} className="rounded-lg border border-border p-4">
                  <h4 className="text-sm font-semibold mb-1">{sec.title}</h4>
                  {sec.description && <p className="text-[11px] text-muted-foreground mb-3">{sec.description}</p>}
                  <div className="space-y-4">
                    {sec.questions.map((q) => (
                      <div key={q.key} className="space-y-1.5">
                        <Label className="text-xs font-medium leading-snug">{q.label}</Label>
                        {q.hint && <p className="text-[10px] text-muted-foreground">{q.hint}</p>}
                        {renderFillField(q)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => handleFillSave(false)} disabled={fillSaving} className="gap-2">
              {fillSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save progress
            </Button>
            <Button onClick={() => handleFillSave(true)} disabled={fillSaving} className="gap-2">
              {fillSaving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Mark submitted
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FBAIntakeManager;
