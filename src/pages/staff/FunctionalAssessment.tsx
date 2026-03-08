import { useState } from "react";
import { Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ClinicalToolLayout from "@/components/clinical/ClinicalToolLayout";
import ClientSelector from "@/components/clinical/ClientSelector";
import EntryHistory from "@/components/clinical/EntryHistory";

const defaultForm = {
  target_behaviour: "",
  operational_definition: "",
  setting_events: "",
  establishing_operations: "",
  discriminative_stimuli: "",
  behaviour_topography: "",
  frequency: "",
  intensity: "",
  duration: "",
  consequences_sr_plus: "",
  consequences_sr_minus: "",
  consequences_sp_plus: "",
  consequences_sp_minus: "",
  hypothesised_function: "",
  replacement_behaviour: "",
};

const FunctionalAssessment = () => {
  const { user } = useAuth();
  const [clientId, setClientId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!clientId || !user) return toast.error("Select a client first");
    if (!form.target_behaviour) return toast.error("Enter target behaviour");
    setSaving(true);
    const { error } = await supabase.from("clinical_entries").insert({
      client_id: clientId,
      filled_by: user.id,
      tool_type: "functional_assessment",
      entry_data: form as unknown as Record<string, unknown>,
      notes,
    });
    setSaving(false);
    if (error) return toast.error("Failed to save");
    toast.success("Assessment saved");
    setForm(defaultForm);
    setNotes("");
    setRefreshKey((k) => k + 1);
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <ClinicalToolLayout title="Functional Assessment" description="Comprehensive functional behaviour analysis with CBS framework" icon={Activity}>
      <Card className="border-border/50 mb-6">
        <CardContent className="pt-6 space-y-5">
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Client</Label>
            <ClientSelector value={clientId} onChange={setClientId} />
          </div>

          <div className="border-l-2 border-primary/30 pl-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Target Behaviour</h3>
            <div>
              <Label className="text-xs text-muted-foreground">Behaviour Name</Label>
              <Input value={form.target_behaviour} onChange={(e) => update("target_behaviour", e.target.value)} placeholder="e.g. Self-injurious behaviour" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Operational Definition</Label>
              <Textarea value={form.operational_definition} onChange={(e) => update("operational_definition", e.target.value)} placeholder="Observable, measurable description..." />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Frequency</Label>
                <Input value={form.frequency} onChange={(e) => update("frequency", e.target.value)} placeholder="e.g. 3x/day" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Intensity</Label>
                <Input value={form.intensity} onChange={(e) => update("intensity", e.target.value)} placeholder="Low/Med/High" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <Input value={form.duration} onChange={(e) => update("duration", e.target.value)} placeholder="e.g. 5 minutes" />
              </div>
            </div>
          </div>

          <div className="border-l-2 border-secondary/50 pl-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Antecedent Variables</h3>
            <div>
              <Label className="text-xs text-muted-foreground">Setting Events (Distant)</Label>
              <Textarea value={form.setting_events} onChange={(e) => update("setting_events", e.target.value)} placeholder="e.g. Poor sleep, missed medication, family conflict..." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Establishing Operations (Motivational)</Label>
              <Textarea value={form.establishing_operations} onChange={(e) => update("establishing_operations", e.target.value)} placeholder="e.g. Hunger, social deprivation, task satiation..." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Discriminative Stimuli (Immediate)</Label>
              <Textarea value={form.discriminative_stimuli} onChange={(e) => update("discriminative_stimuli", e.target.value)} placeholder="e.g. Demand placed, attention withdrawn, transition signal..." />
            </div>
          </div>

          <div className="border-l-2 border-accent/50 pl-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Consequence Analysis</h3>
            <div>
              <Label className="text-xs text-muted-foreground">SR+ (Positive Reinforcement — something added)</Label>
              <Textarea value={form.consequences_sr_plus} onChange={(e) => update("consequences_sr_plus", e.target.value)} placeholder="e.g. Attention from staff, access to preferred item..." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">SR− (Negative Reinforcement — something removed)</Label>
              <Textarea value={form.consequences_sr_minus} onChange={(e) => update("consequences_sr_minus", e.target.value)} placeholder="e.g. Escape from task demand, removal of aversive noise..." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">SP+ (Positive Punishment — something added)</Label>
              <Textarea value={form.consequences_sp_plus} onChange={(e) => update("consequences_sp_plus", e.target.value)} placeholder="e.g. Verbal reprimand, physical block..." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">SP− (Negative Punishment — something removed)</Label>
              <Textarea value={form.consequences_sp_minus} onChange={(e) => update("consequences_sp_minus", e.target.value)} placeholder="e.g. Loss of privileges, time-out from reinforcement..." />
            </div>
          </div>

          <div className="border-l-2 border-primary/30 pl-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Formulation</h3>
            <div>
              <Label className="text-xs text-muted-foreground">Hypothesised Function</Label>
              <Textarea value={form.hypothesised_function} onChange={(e) => update("hypothesised_function", e.target.value)} placeholder="Based on the analysis, the behaviour appears to serve..." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Replacement Behaviour</Label>
              <Textarea value={form.replacement_behaviour} onChange={(e) => update("replacement_behaviour", e.target.value)} placeholder="Functionally equivalent alternative behaviour..." />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Additional Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional clinical observations..." />
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Submit Assessment"}
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-lg font-serif text-foreground mb-2">Assessment History</h2>
      <EntryHistory
        clientId={clientId}
        toolType="functional_assessment"
        refreshKey={refreshKey}
        renderEntry={(data, notes) => {
          const d = data as Record<string, string>;
          return (
            <div className="space-y-1 text-sm">
              <p className="font-medium">{d.target_behaviour}</p>
              {d.operational_definition && <p className="text-muted-foreground">{d.operational_definition}</p>}
              {d.hypothesised_function && <p><span className="font-medium">Function:</span> {d.hypothesised_function}</p>}
              {notes && <p className="italic text-muted-foreground">{notes}</p>}
            </div>
          );
        }}
      />
    </ClinicalToolLayout>
  );
};

export default FunctionalAssessment;
