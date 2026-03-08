import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import ClinicalToolLayout from "@/components/clinical/ClinicalToolLayout";
import ClientSelector from "@/components/clinical/ClientSelector";
import EntryHistory from "@/components/clinical/EntryHistory";

const ABCDataSheet = () => {
  const { user } = useAuth();
  const [clientId, setClientId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date_time: "",
    setting: "",
    antecedent: "",
    behaviour: "",
    consequence: "",
    function_hypothesis: "",
  });

  const handleSubmit = async () => {
    if (!clientId || !user) return toast.error("Select a client first");
    if (!form.antecedent || !form.behaviour || !form.consequence) return toast.error("Fill in A, B, and C fields");
    setSaving(true);
    const { error } = await supabase.from("clinical_entries").insert({
      client_id: clientId,
      filled_by: user.id,
      tool_type: "abc",
      entry_data: form as unknown as Record<string, unknown>,
      notes: form.function_hypothesis,
      entry_date: form.date_time ? new Date(form.date_time).toISOString() : new Date().toISOString(),
    });
    setSaving(false);
    if (error) return toast.error("Failed to save");
    toast.success("ABC entry saved");
    setForm({ date_time: "", setting: "", antecedent: "", behaviour: "", consequence: "", function_hypothesis: "" });
    setRefreshKey((k) => k + 1);
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <ClinicalToolLayout title="ABC Data Sheet" description="Record Antecedent–Behaviour–Consequence sequences for functional analysis" icon={ClipboardList}>
      <Card className="border-border/50 mb-6">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Client</Label>
            <ClientSelector value={clientId} onChange={setClientId} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date & Time</Label>
              <Input type="datetime-local" value={form.date_time} onChange={(e) => update("date_time", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Setting / Context</Label>
              <Input placeholder="e.g. Classroom, home, session..." value={form.setting} onChange={(e) => update("setting", e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">A — Antecedent</Label>
            <Textarea placeholder="What happened immediately before the behaviour?" value={form.antecedent} onChange={(e) => update("antecedent", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">B — Behaviour</Label>
            <Textarea placeholder="Describe the behaviour in observable, measurable terms" value={form.behaviour} onChange={(e) => update("behaviour", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">C — Consequence</Label>
            <Textarea placeholder="What happened immediately after the behaviour?" value={form.consequence} onChange={(e) => update("consequence", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Function Hypothesis</Label>
            <Textarea placeholder="Hypothesised function: attention, escape, access to tangible, sensory..." value={form.function_hypothesis} onChange={(e) => update("function_hypothesis", e.target.value)} />
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Submit ABC Entry"}
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-lg font-serif text-foreground mb-2">Entry History</h2>
      <EntryHistory
        clientId={clientId}
        toolType="abc"
        refreshKey={refreshKey}
        renderEntry={(data, notes) => (
          <div className="space-y-2 text-sm">
            {(data as Record<string, string>).setting && <p><span className="font-medium text-muted-foreground">Setting:</span> {(data as Record<string, string>).setting}</p>}
            <p><span className="font-medium text-primary">A:</span> {(data as Record<string, string>).antecedent}</p>
            <p><span className="font-medium text-primary">B:</span> {(data as Record<string, string>).behaviour}</p>
            <p><span className="font-medium text-primary">C:</span> {(data as Record<string, string>).consequence}</p>
            {notes && <p className="text-muted-foreground italic">Function: {notes}</p>}
          </div>
        )}
      />
    </ClinicalToolLayout>
  );
};

export default ABCDataSheet;
