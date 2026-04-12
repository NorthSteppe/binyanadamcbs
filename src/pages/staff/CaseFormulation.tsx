import { useState } from "react";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import ClinicalToolLayout from "@/components/clinical/ClinicalToolLayout";
import ClientSelector from "@/components/clinical/ClientSelector";
import EntryHistory from "@/components/clinical/EntryHistory";

const sections = [
  { key: "presenting_problems", label: "Presenting Problems", placeholder: "Key concerns, referral reason, client's goals..." },
  { key: "developmental_history", label: "Relevant History & Context", placeholder: "Learning history, family, cultural context, medical factors..." },
  { key: "functional_patterns", label: "Functional Patterns", placeholder: "Key behavioural patterns, stimulus–response relationships, rule-governed behaviour..." },
  { key: "psychological_inflexibility", label: "Psychological Inflexibility Processes", placeholder: "Fusion, avoidance, loss of contact with values, inaction, conceptualised self, past/future focus..." },
  { key: "strengths_resources", label: "Strengths & Resources", placeholder: "Existing values, committed actions already taking, support networks..." },
  { key: "treatment_targets", label: "Treatment Targets", placeholder: "Prioritised targets with functional rationale..." },
  { key: "treatment_plan", label: "Treatment Plan", placeholder: "Intervention strategies mapped to functional analysis..." },
  { key: "outcome_measures", label: "Outcome Measures", placeholder: "How progress will be tracked (behavioural, self-report, functional)..." },
];

const CaseFormulation = () => {
  const { t } = useLanguage();
  const portalT = (t as any).staffClinical || {};

  const sections = [
    { key: "presenting_problems", label: portalT.presentingProblems || "Presenting Problems", placeholder: portalT.presentingPlaceholder || "Key concerns, referral reason, client's goals..." },
    { key: "developmental_history", label: portalT.relevantHistory || "Relevant History & Context", placeholder: portalT.historyPlaceholder || "Learning history, family, cultural context, medical factors..." },
    { key: "functional_patterns", label: portalT.functionalPatterns || "Functional Patterns", placeholder: portalT.functionalPlaceholder || "Key behavioural patterns, stimulus–response relationships, rule-governed behaviour..." },
    { key: "psychological_inflexibility", label: portalT.processInflexibility || "Psychological Inflexibility Processes", placeholder: portalT.inflexibilityPlaceholder || "Fusion, avoidance, loss of contact with values, inaction, conceptualised self, past/future focus..." },
    { key: "strengths_resources", label: portalT.strengthsResources || "Strengths & Resources", placeholder: portalT.strengthsPlaceholder || "Existing values, committed actions already taking, support networks..." },
    { key: "treatment_targets", label: portalT.treatmentTargets || "Treatment Targets", placeholder: portalT.targetsPlaceholder || "Prioritised targets with functional rationale..." },
    { key: "treatment_plan", label: portalT.treatmentPlan || "Treatment Plan", placeholder: portalT.planPlaceholder || "Intervention strategies mapped to functional analysis..." },
    { key: "outcome_measures", label: portalT.outcomeMeasures || "Outcome Measures", placeholder: portalT.outcomePlaceholder || "How progress will be tracked (behavioural, self-report, functional)..." },
  ];


  const { user } = useAuth();
  const [clientId, setClientId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [form, setForm] = useState<Record<string, string>>(
    Object.fromEntries(sections.map((s) => [s.key, ""]))
  );

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!clientId || !user) return toast.error(portalT.selectClientFirst || "Select a client first");
    const hasContent = Object.values(form).some((v) => v.trim());
    if (!hasContent) return toast.error(portalT.fillSection || "Fill in at least one section");
    setSaving(true);
    const { error } = await (supabase.from("clinical_entries") as any).insert({
      client_id: clientId,
      filled_by: user.id,
      tool_type: "case_formulation",
      entry_data: form,
      notes,
    });
    setSaving(false);
    if (error) return toast.error(portalT.failedToSave || "Failed to save");
    toast.success(portalT.caseSaved || "Case formulation saved");
    setForm(Object.fromEntries(sections.map((s) => [s.key, ""])));
    setNotes("");
    setRefreshKey((k) => k + 1);
  };

  return (
    <ClinicalToolLayout title={portalT.caseTitle || "Case Formulation"} description={portalT.caseDesc || "Structured CBS case conceptualisation with functional analysis"} icon={FileText}>
      <Card className="border-border/50 mb-6">
        <CardContent className="pt-6 space-y-5">
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{portalT.client || "Client"}</Label>
            <ClientSelector value={clientId} onChange={setClientId} />
          </div>

          {sections.map((section, i) => (
            <div key={section.key} className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {i + 1}. {section.label}
              </Label>
              <Textarea
                className="min-h-[80px]"
                value={form[section.key] || ""}
                onChange={(e) => update(section.key, e.target.value)}
                placeholder={section.placeholder}
              />
            </div>
          ))}

          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{portalT.additionalNotes || "Additional Notes"}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Supervision notes, risk considerations..." />
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? (portalT.saving || "Saving...") : (portalT.submitCase || "Submit Case Formulation")}
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-lg font-serif text-foreground mb-2">{portalT.entryHistory || "Formulation History"}</h2>
      <EntryHistory
        clientId={clientId}
        toolType="case_formulation"
        toolTitle={portalT.caseTitle || "Case Formulation"}
        refreshKey={refreshKey}
        getPdfSections={(data) => {
          const d = data as Record<string, string>;
          return sections.map((s) => ({ label: s.label, value: d[s.key] || "" }));
        }}
        renderEntry={(data, notes) => {
          const d = data as Record<string, string>;
          return (
            <div className="space-y-2 text-sm">
              {sections.map((s) => d[s.key] && (
                <div key={s.key}>
                  <span className="font-medium text-muted-foreground">{s.label}:</span>
                  <p className="ms-2 text-foreground">{d[s.key].length > 120 ? d[s.key].slice(0, 120) + "…" : d[s.key]}</p>
                </div>
              ))}
              {notes && <p className="italic text-muted-foreground">{notes}</p>}
            </div>
          );
        }}
      />
    </ClinicalToolLayout>
  );
};

export default CaseFormulation;
