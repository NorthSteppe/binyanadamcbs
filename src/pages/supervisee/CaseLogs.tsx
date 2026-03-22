import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Plus, ClipboardList, ChevronDown, ChevronRight, Trash2, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const SESSION_TYPES = [
  { value: "direct", label: "Direct Service" },
  { value: "indirect", label: "Indirect Service" },
  { value: "supervision", label: "Supervision Meeting" },
  { value: "assessment", label: "Assessment" },
  { value: "parent_training", label: "Parent/Caregiver Training" },
  { value: "observation", label: "Observation" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-primary/10 text-primary",
  reviewed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const emptyLog = {
  client_name: "",
  client_age: "",
  diagnosis: "",
  session_date: new Date().toISOString().slice(0, 16),
  session_type: "direct",
  duration_minutes: 60,
  setting: "",
  targets_addressed: "",
  interventions_used: "",
  client_response: "",
  data_summary: "",
  next_steps: "",
  supervision_notes: "",
  status: "draft",
};

const CaseLogs = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyLog);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["supervisee-case-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supervisee_case_logs" as any)
        .select("*")
        .order("session_date", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (logData: typeof form) => {
      const payload = { ...logData, supervisee_id: user!.id, session_date: new Date(logData.session_date).toISOString() };
      if (editingId) {
        const { error } = await supabase.from("supervisee_case_logs" as any).update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("supervisee_case_logs" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supervisee-case-logs"] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyLog);
      toast.success(editingId ? "Case log updated" : "Case log created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("supervisee_case_logs" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supervisee-case-logs"] });
      toast.success("Case log deleted");
    },
  });

  const openEdit = (log: any) => {
    setForm({
      client_name: log.client_name,
      client_age: log.client_age,
      diagnosis: log.diagnosis,
      session_date: log.session_date?.slice(0, 16) || "",
      session_type: log.session_type,
      duration_minutes: log.duration_minutes,
      setting: log.setting,
      targets_addressed: log.targets_addressed,
      interventions_used: log.interventions_used,
      client_response: log.client_response,
      data_summary: log.data_summary,
      next_steps: log.next_steps,
      supervision_notes: log.supervision_notes,
      status: log.status,
    });
    setEditingId(log.id);
    setShowForm(true);
  };

  const updateField = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                <ClipboardList size={22} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Case Logs</h1>
            </div>
            <Button onClick={() => { setForm(emptyLog); setEditingId(null); setShowForm(true); }} className="gap-2">
              <Plus size={16} /> New Log
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <ClipboardList className="mx-auto mb-3 text-muted-foreground" size={40} />
              <p className="text-muted-foreground">No case logs yet. Start logging your client sessions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log: any) => (
                <motion.div key={log.id} layout className="bg-card border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {expandedId === log.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <div className="min-w-0">
                        <p className="font-medium text-card-foreground truncate">
                          {log.client_name || "Unnamed Client"} — {SESSION_TYPES.find((t) => t.value === log.session_type)?.label || log.session_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.session_date), "dd MMM yyyy, HH:mm")} · {log.duration_minutes} min
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={STATUS_COLORS[log.status] || ""}>{log.status}</Badge>
                  </button>
                  {expandedId === log.id && (
                    <div className="px-4 pb-4 border-t border-border pt-3 space-y-3 text-sm">
                      {log.diagnosis && <div><span className="font-medium text-foreground">Diagnosis:</span> <span className="text-muted-foreground">{log.diagnosis}</span></div>}
                      {log.setting && <div><span className="font-medium text-foreground">Setting:</span> <span className="text-muted-foreground">{log.setting}</span></div>}
                      {log.targets_addressed && <div><span className="font-medium text-foreground">Targets Addressed:</span><p className="text-muted-foreground whitespace-pre-wrap mt-1">{log.targets_addressed}</p></div>}
                      {log.interventions_used && <div><span className="font-medium text-foreground">Interventions Used:</span><p className="text-muted-foreground whitespace-pre-wrap mt-1">{log.interventions_used}</p></div>}
                      {log.client_response && <div><span className="font-medium text-foreground">Client Response:</span><p className="text-muted-foreground whitespace-pre-wrap mt-1">{log.client_response}</p></div>}
                      {log.data_summary && <div><span className="font-medium text-foreground">Data Summary:</span><p className="text-muted-foreground whitespace-pre-wrap mt-1">{log.data_summary}</p></div>}
                      {log.next_steps && <div><span className="font-medium text-foreground">Next Steps:</span><p className="text-muted-foreground whitespace-pre-wrap mt-1">{log.next_steps}</p></div>}
                      {log.supervision_notes && <div><span className="font-medium text-foreground">Supervision Notes:</span><p className="text-muted-foreground whitespace-pre-wrap mt-1">{log.supervision_notes}</p></div>}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(log)} className="gap-1"><Edit size={14} /> Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(log.id)} className="gap-1"><Trash2 size={14} /> Delete</Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Case Log" : "New Case Log"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Client Name</Label>
                    <Input value={form.client_name} onChange={(e) => updateField("client_name", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Client Age</Label>
                    <Input value={form.client_age} onChange={(e) => updateField("client_age", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Diagnosis</Label>
                    <Input value={form.diagnosis} onChange={(e) => updateField("diagnosis", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Session Date & Time</Label>
                    <Input type="datetime-local" value={form.session_date} onChange={(e) => updateField("session_date", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Session Type</Label>
                    <Select value={form.session_type} onValueChange={(v) => updateField("session_type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SESSION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Duration (minutes)</Label>
                    <Input type="number" value={form.duration_minutes} onChange={(e) => updateField("duration_minutes", parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Setting (e.g. clinic, home, school)</Label>
                    <Input value={form.setting} onChange={(e) => updateField("setting", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Targets Addressed</Label>
                  <Textarea value={form.targets_addressed} onChange={(e) => updateField("targets_addressed", e.target.value)} rows={3} placeholder="List behavioural targets worked on during the session..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Interventions Used</Label>
                  <Textarea value={form.interventions_used} onChange={(e) => updateField("interventions_used", e.target.value)} rows={3} placeholder="DTT, NET, FCT, antecedent strategies, etc." />
                </div>
                <div className="space-y-1.5">
                  <Label>Client Response</Label>
                  <Textarea value={form.client_response} onChange={(e) => updateField("client_response", e.target.value)} rows={3} placeholder="How did the client respond? Prompt levels, engagement, challenging behaviours..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Data Summary</Label>
                  <Textarea value={form.data_summary} onChange={(e) => updateField("data_summary", e.target.value)} rows={2} placeholder="Trial data, frequency counts, duration data, percentage correct..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Next Steps / Recommendations</Label>
                  <Textarea value={form.next_steps} onChange={(e) => updateField("next_steps", e.target.value)} rows={2} placeholder="Plan for next session, changes to intervention..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Supervision Notes</Label>
                  <Textarea value={form.supervision_notes} onChange={(e) => updateField("supervision_notes", e.target.value)} rows={2} placeholder="Questions for supervisor, areas to discuss..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted for Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Saving..." : editingId ? "Update Log" : "Create Log"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CaseLogs;
