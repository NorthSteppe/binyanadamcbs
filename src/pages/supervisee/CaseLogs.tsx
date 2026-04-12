import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Plus, ClipboardList, ChevronDown, ChevronRight, Trash2, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
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
  const { t } = useLanguage();
  const portalT = (t as any).superviseeHub || {};

  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyLog);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  
    const SESSION_TYPES = [
        { value: "direct", label: portalT.typeDirect || "Direct Service" },
        { value: "indirect", label: portalT.typeIndirect || "Indirect Service" },
        { value: "supervision", label: portalT.typeSupervision || "Supervision Meeting" },
        { value: "assessment", label: portalT.typeAssessment || "Assessment" },
        { value: "parent_training", label: portalT.typeParent || "Parent/Caregiver Training" },
        { value: "observation", label: portalT.typeObservation || "Observation" },
    ];
    
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
      toast.success(editingId ? portalT.logUpdated || "Case log updated" : portalT.logCreated || "Case log created");
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
      toast.success(portalT.logDeleted || "Case log deleted");
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
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{portalT.caseLogsLabel || "Case Logs"}</h1>
            </div>
            <Button onClick={() => { setForm(emptyLog); setEditingId(null); setShowForm(true); }} className="gap-2">
              <Plus size={16} /> {portalT.newLog || "New Log"}
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <ClipboardList className="mx-auto mb-3 text-muted-foreground" size={40} />
              <p className="text-muted-foreground">{portalT.noLogs || "No case logs yet. Start logging your client sessions."}</p>
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
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" onClick={() => openEdit(log)} className="gap-1"><Edit size={13} />{portalT.edit || "Edit"}</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(log.id)} className="gap-1"><Trash2 size={13} />{portalT.delete || "Delete"}</Button>
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
                <DialogTitle>{editingId ? (portalT.editLog || "Edit Case Log") : (portalT.newLogTitle || "New Case Log")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>{portalT.clientName || "Client Name"}</Label>
                    <Input value={form.client_name} onChange={(e) => updateField("client_name", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{portalT.clientAge || "Client Age"}</Label>
                    <Input value={form.client_age} onChange={(e) => updateField("client_age", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Diagnosis</Label>
                    <Input value={form.diagnosis} onChange={(e) => updateField("diagnosis", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{portalT.sessionDateTime || "Session Date & Time"}</Label>
                    <Input type="datetime-local" value={form.session_date} onChange={(e) => updateField("session_date", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{portalT.sessionType || "Session Type"}</Label>
                    <Select value={form.session_type} onValueChange={(v) => updateField("session_type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SESSION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>{portalT.durationMinutes || "Duration (minutes)"}</Label>
                    <Input type="number" value={form.duration_minutes} onChange={(e) => updateField("duration_minutes", parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>{portalT.settingPlaceholder || "Setting (e.g. clinic, home, school)"}</Label>
                    <Input value={form.setting} onChange={(e) => updateField("setting", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{portalT.targetsAddressed || "Targets Addressed"}</Label>
                  <Textarea value={form.targets_addressed} onChange={(e) => updateField("targets_addressed", e.target.value)} rows={3} placeholder={portalT.targetsPlaceholder || "List behavioural targets worked on during the session..."} />
                </div>
                <div className="space-y-1.5">
                  <Label>{portalT.interventionsUsed || "Interventions Used"}</Label>
                  <Textarea value={form.interventions_used} onChange={(e) => updateField("interventions_used", e.target.value)} rows={3} placeholder={portalT.interventionsPlaceholder || "DTT, NET, FCT, antecedent strategies, etc."} />
                </div>
                <div className="space-y-1.5">
                  <Label>{portalT.clientResponse || "Client Response"}</Label>
                  <Textarea value={form.client_response} onChange={(e) => updateField("client_response", e.target.value)} rows={3} placeholder={portalT.responsePlaceholder || "How did the client respond? Prompt levels, engagement, challenging behaviours..."} />
                </div>
                <div className="space-y-1.5">
                  <Label>{portalT.dataSummary || "Data Summary"}</Label>
                  <Textarea value={form.data_summary} onChange={(e) => updateField("data_summary", e.target.value)} rows={2} placeholder={portalT.dataPlaceholder || "Trial data, frequency counts, duration data, percentage correct..."} />
                </div>
                <div className="space-y-1.5">
                  <Label>{portalT.nextSteps || "Next Steps / Recommendations"}</Label>
                  <Textarea value={form.next_steps} onChange={(e) => updateField("next_steps", e.target.value)} rows={2} placeholder={portalT.nextStepsPlaceholder || "Plan for next session, changes to intervention..."} />
                </div>
                <div className="space-y-1.5">
                  <Label>{portalT.supervisionNotes || "Supervision Notes"}</Label>
                  <Textarea value={form.supervision_notes} onChange={(e) => updateField("supervision_notes", e.target.value)} rows={2} placeholder={portalT.supervisionPlaceholder || "Questions for supervisor, areas to discuss..."} />
                </div>
                <div className="space-y-1.5">
                  <Label>{portalT.status || "Status"}</Label>
                  <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{portalT.statusDraft || "Draft"}</SelectItem>
                      <SelectItem value="submitted">{portalT.statusSubmitted || "Submitted for Review"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{portalT.cancel || "Cancel"}</Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Saving..." : editingId ? (portalT.updateLog || "Update Log") : (portalT.createLog || "Create Log")}
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
