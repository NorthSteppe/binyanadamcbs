import { useState } from "react";
import { Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import ClinicalToolLayout from "@/components/clinical/ClinicalToolLayout";
import ClientSelector from "@/components/clinical/ClientSelector";
import EntryHistory from "@/components/clinical/EntryHistory";

const processes = [
  { key: "acceptance", label: "Acceptance", desc: "Willingness to experience difficult thoughts and feelings without avoidance", opposite: "Experiential Avoidance" },
  { key: "defusion", label: "Cognitive Defusion", desc: "Ability to step back from thoughts and see them as mental events", opposite: "Cognitive Fusion" },
  { key: "present_moment", label: "Present Moment Awareness", desc: "Flexible attention to the here-and-now with openness", opposite: "Dominance of Past/Future" },
  { key: "self_as_context", label: "Self-as-Context", desc: "A transcendent sense of self that observes experience", opposite: "Attachment to Conceptualised Self" },
  { key: "values", label: "Values", desc: "Clarity about what matters and provides direction for living", opposite: "Lack of Values Clarity" },
  { key: "committed_action", label: "Committed Action", desc: "Taking effective action guided by values, even when difficult", opposite: "Inaction / Impulsivity" },
];

const HexaflexTracker = () => {
  const { t } = useLanguage();
  const portalT = (t as any).advancedModels || {};
  const staffT = (t as any).staffClinical || {};

    const processes = [
        { key: "acceptance", label: portalT.hexAcceptance || "Acceptance", desc: portalT.hexAcceptanceDesc || "Willingness to experience difficult thoughts and feelings without avoidance", opposite: portalT.hexAcceptanceOpp || "Experiential Avoidance" },
        { key: "defusion", label: portalT.hexDefusion || "Cognitive Defusion", desc: portalT.hexDefusionDesc || "Ability to step back from thoughts and see them as mental events", opposite: portalT.hexDefusionOpp || "Cognitive Fusion" },
        { key: "present_moment", label: portalT.hexPresent || "Present Moment Awareness", desc: portalT.hexPresentDesc || "Flexible attention to the here-and-now with openness", opposite: portalT.hexPresentOpp || "Dominance of Past/Future" },
        { key: "self_as_context", label: portalT.hexSelf || "Self-as-Context", desc: portalT.hexSelfDesc || "A transcendent sense of self that observes experience", opposite: portalT.hexSelfOpp || "Attachment to Conceptualised Self" },
        { key: "values", label: portalT.hexValues || "Values", desc: portalT.hexValuesDesc || "Clarity about what matters and provides direction for living", opposite: portalT.hexValuesOpp || "Lack of Values Clarity" },
        { key: "committed_action", label: portalT.hexAction || "Committed Action", desc: portalT.hexActionDesc || "Taking effective action guided by values, even when difficult", opposite: portalT.hexActionOpp || "Inaction / Impulsivity" },
    ];
    

  const { user } = useAuth();
  const [clientId, setClientId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [ratings, setRatings] = useState<Record<string, { score: number; observation: string }>>(
    Object.fromEntries(processes.map((p) => [p.key, { score: 5, observation: "" }]))
  );

  const updateProcess = (key: string, field: string, value: number | string) => {
    setRatings((r) => ({ ...r, [key]: { ...r[key], [field]: value } }));
  };

  const handleSubmit = async () => {
    if (!clientId || !user) return toast.error(staffT.selectClientFirst || "Select a client first");
    setSaving(true);
    const { error } = await (supabase.from("clinical_entries") as any).insert({
      client_id: clientId,
      filled_by: user.id,
      tool_type: "hexaflex",
      entry_data: ratings,
      notes,
    });
    setSaving(false);
    if (error) return toast.error(staffT.failedToSave || "Failed to save");
    toast.success(portalT.hexaflexSaved || "Hexaflex assessment saved");
    setRatings(Object.fromEntries(processes.map((p) => [p.key, { score: 5, observation: "" }])));
    setNotes("");
    setRefreshKey((k) => k + 1);
  };

  const avgScore = Object.values(ratings).reduce((sum, r) => sum + r.score, 0) / processes.length;

  return (
    <ClinicalToolLayout title={portalT.hexaflexTitle || "Hexaflex Tracker"} description={portalT.hexaflexDesc || "Rate and track the six core ACT processes of psychological flexibility"} icon={Brain}>
      <Card className="border-border/50 mb-6">
        <CardContent className="pt-6 space-y-5">
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{staffT.client || "Client"}</Label>
            <ClientSelector value={clientId} onChange={setClientId} />
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{portalT.flexibilityScore || "Overall Flexibility Score"}</p>
            <p className="text-3xl font-bold text-primary">{avgScore.toFixed(1)}<span className="text-base font-normal text-muted-foreground">/10</span></p>
          </div>

          {processes.map((process) => (
            <div key={process.key} className="border border-border/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{process.label}</h3>
                  <p className="text-xs text-muted-foreground">{process.desc}</p>
                </div>
                <span className="text-lg font-bold text-primary shrink-0">{ratings[process.key]?.score}/10</span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{process.opposite}</span>
                  <span>{process.label}</span>
                </div>
                <Slider
                  value={[ratings[process.key]?.score || 5]}
                  onValueChange={([v]) => updateProcess(process.key, "score", v)}
                  max={10} min={1} step={1}
                />
              </div>
              <Textarea
                className="min-h-[50px]"
                value={ratings[process.key]?.observation || ""}
                onChange={(e) => updateProcess(process.key, "observation", e.target.value)}
                placeholder={`Observations about ${process.label.toLowerCase()}...`}
              />
            </div>
          ))}

          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{portalT.summaryNotes || "Summary Notes"}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={portalT.summaryPlaceholder || "Overall clinical impression, treatment priorities..."} />
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? (staffT.saving || "Saving...") : (portalT.submitHexaflex || "Submit Hexaflex Assessment")}
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-lg font-serif text-foreground mb-2">{portalT.assessmentHistory || "Assessment History"}</h2>
      <EntryHistory
        clientId={clientId}
        toolType="hexaflex"
        toolTitle={portalT.hexaflexTitle || "Hexaflex Tracker"}
        refreshKey={refreshKey}
        getPdfSections={(data) => {
          const d = data as Record<string, { score: number; observation: string }>;
          return processes.map((p) => ({
            label: p.label,
            value: d[p.key] ? `Score: ${d[p.key].score}/10\nObs: ${d[p.key].observation || "—"}` : "",
          }));
        }}
        renderEntry={(data, notes) => {
          const d = data as Record<string, { score: number; observation: string }>;
          return (
            <div className="space-y-1 text-sm">
              {processes.map((p) => d[p.key] && (
                <div key={p.key} className="flex items-center gap-2">
                  <span className="w-36 shrink-0 text-muted-foreground">{p.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: `${(d[p.key].score / 10) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right">{d[p.key].score}/10</span>
                </div>
              ))}
              {notes && <p className="italic text-muted-foreground mt-2">{notes}</p>}
            </div>
          );
        }}
      />
    </ClinicalToolLayout>
  );
};

export default HexaflexTracker;
