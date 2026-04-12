import { useState } from "react";
import { Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
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
  const { t } = useLanguage();
  const portalT = (t as any).staffFunctional || {};
  const staffT = (t as any).staffClinical || {};

  const { user } = useAuth();
  const [clientId, setClientId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!clientId || !user) return toast.error(staffT.selectClientFirst || "Select a client first");
    if (!form.target_behaviour) return toast.error(staffT.fillBehaviour || "Enter target behaviour");
    setSaving(true);
    const { error } = await (supabase.from("clinical_entries") as any).insert({
      client_id: clientId,
      filled_by: user.id,
      tool_type: "functional_assessment",
      entry_data: form,
      notes,
    });
    setSaving(false);
    if (error) return toast.error(staffT.failedToSave || "Failed to save");
    toast.success(portalT.assessmentSaved || "Assessment saved");
    setForm(defaultForm);
    setNotes("");
    setRefreshKey((k) => k + 1);
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <ClinicalToolLayout title={portalT.title || "Functional Assessment"} description={portalT.desc || "Comprehensive functional behaviour analysis with CBS framework"} icon={Activity}>
      <Card className="border-border/50 mb-6">
        <CardContent className="pt-6 space-y-5">
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{staffT.client || "Client"}</Label>
            <ClientSelector value={clientId} onChange={setClientId} />
          </div>

          <div className="border-s-2 border-primary/30 ps-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{portalT.targetBehaviour || "Target Behaviour"}</h3>
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.behaviourName || "Behaviour Name"}</Label>
              <Input value={form.target_behaviour} onChange={(e) => update("target_behaviour", e.target.value)} placeholder={portalT.behaviourPlaceholder || "e.g. Self-injurious behaviour"} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.operationalDef || "Operational Definition"}</Label>
              <Textarea value={form.operational_definition} onChange={(e) => update("operational_definition", e.target.value)} placeholder={portalT.opDefPlaceholder || "Observable, measurable description..."} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">{portalT.frequency || "Frequency"}</Label>
                <Input value={form.frequency} onChange={(e) => update("frequency", e.target.value)} placeholder={portalT.freqPlaceholder || "e.g. 3x/day"} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{portalT.intensity || "Intensity"}</Label>
                <Input value={form.intensity} onChange={(e) => update("intensity", e.target.value)} placeholder={portalT.intPlaceholder || "Low/Med/High"} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{portalT.duration || "Duration"}</Label>
                <Input value={form.duration} onChange={(e) => update("duration", e.target.value)} placeholder={portalT.durPlaceholder || "e.g. 5 minutes"} />
              </div>
            </div>
          </div>

          <div className="border-s-2 border-secondary/50 ps-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{portalT.antecedents || "Antecedent Variables"}</h3>
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.settingEvents || "Setting Events (Distant)"}</Label>
              <Textarea value={form.setting_events} onChange={(e) => update("setting_events", e.target.value)} placeholder={portalT.settingEventsPlaceholder || "e.g. Poor sleep, missed medication, family conflict..."} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.establishingOps || "Establishing Operations (Motivational)"}</Label>
              <Textarea value={form.establishing_operations} onChange={(e) => update("establishing_operations", e.target.value)} placeholder={portalT.estOpsPlaceholder || "e.g. Hunger, social deprivation, task satiation..."} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.discrimStimuli || "Discriminative Stimuli (Immediate)"}</Label>
              <Textarea value={form.discriminative_stimuli} onChange={(e) => update("discriminative_stimuli", e.target.value)} placeholder={portalT.discrimStimuliPlaceholder || "e.g. Demand placed, attention withdrawn, transition signal..."} />
            </div>
          </div>

          <div className="border-s-2 border-accent/50 ps-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{portalT.consequences || "Consequence Analysis"}</h3>
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.srPlus || "SR+ (Positive Reinforcement — something added)"}</Label>
              <Textarea value={form.consequences_sr_plus} onChange={(e) => update("consequences_sr_plus", e.target.value)} placeholder={portalT.srPlusPlaceholder || "e.g. Attention from staff, access to preferred item..."} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.srMinus || "SR− (Negative Reinforcement — something removed)"}</Label>
              <Textarea value={form.consequences_sr_minus} onChange={(e) => update("consequences_sr_minus", e.target.value)} placeholder={portalT.srMinusPlaceholder || "e.g. Escape from task demand, removal of aversive noise..."} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.spPlus || "SP+ (Positive Punishment — something added)"}</Label>
              <Textarea value={form.consequences_sp_plus} onChange={(e) => update("consequences_sp_plus", e.target.value)} placeholder={portalT.spPlusPlaceholder || "e.g. Verbal reprimand, physical block..."} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.spMinus || "SP− (Negative Punishment — something removed)"}</Label>
              <Textarea value={form.consequences_sp_minus} onChange={(e) => update("consequences_sp_minus", e.target.value)} placeholder={portalT.spMinusPlaceholder || "e.g. Loss of privileges, time-out from reinforcement..."} />
            </div>
          </div>

          <div className="border-s-2 border-primary/30 ps-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{portalT.formulation || "Formulation"}</h3>
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.hypothesisedFunc || "Hypothesised Function"}</Label>
              <Textarea value={form.hypothesised_function} onChange={(e) => update("hypothesised_function", e.target.value)} placeholder={portalT.hypothesisedFuncPlaceholder || "Based on the analysis, the behaviour appears to serve..."} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.replacementBeh || "Replacement Behaviour"}</Label>
              <Textarea value={form.replacement_behaviour} onChange={(e) => update("replacement_behaviour", e.target.value)} placeholder={portalT.replacementBehPlaceholder || "Functionally equivalent alternative behaviour..."} />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{staffT.additionalNotes || "Additional Notes"}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={staffT.additionalNotesPlaceholder || "Any additional clinical observations..."} />
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? (staffT.saving || "Saving...") : (portalT.submitAssessment || "Submit Assessment")}
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-lg font-serif text-foreground mb-2">{staffT.entryHistory || "Assessment History"}</h2>
      <EntryHistory
        clientId={clientId}
        toolType="functional_assessment"
        toolTitle={portalT.title || "Functional Assessment"}
        refreshKey={refreshKey}
        getPdfSections={(data) => {
          const d = data as Record<string, string>;
          return [
            { label: "Target Behaviour", value: d.target_behaviour || "" },
            { label: "Operational Definition", value: d.operational_definition || "" },
            { label: "Setting Events", value: d.setting_events || "" },
            { label: "Establishing Operations", value: d.establishing_operations || "" },
            { label: "Discriminative Stimuli", value: d.discriminative_stimuli || "" },
            { label: "Behaviour Topography", value: d.behaviour_topography || "" },
            { label: "Frequency / Intensity / Duration", value: [d.frequency, d.intensity, d.duration].filter(Boolean).join(" | ") },
            { label: "Consequences SR+", value: d.consequences_sr_plus || "" },
            { label: "Consequences SR−", value: d.consequences_sr_minus || "" },
            { label: "Consequences SP+", value: d.consequences_sp_plus || "" },
            { label: "Consequences SP−", value: d.consequences_sp_minus || "" },
            { label: "Hypothesised Function", value: d.hypothesised_function || "" },
          ];
        }}
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
