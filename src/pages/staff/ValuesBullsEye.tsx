import { useState } from "react";
import { Target } from "lucide-react";
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

const domains = [
  { key: "work_education", label: "Work / Education", desc: "Career, study, skill development" },
  { key: "relationships", label: "Relationships", desc: "Intimate, family, social connections" },
  { key: "personal_growth", label: "Personal Growth / Health", desc: "Physical, emotional, spiritual wellbeing" },
  { key: "leisure", label: "Leisure / Recreation", desc: "Fun, hobbies, creativity, play" },
];

const ValuesBullsEye = () => {
  const { t } = useLanguage();
  const portalT = (t as any).advancedModels || {};
  const staffT = (t as any).staffClinical || {};

    const domains = [
        { key: "work_education", label: portalT.valWork || "Work / Education", desc: portalT.valWorkDesc || "Career, study, skill development" },
        { key: "relationships", label: portalT.valRelations || "Relationships", desc: portalT.valRelationsDesc || "Intimate, family, social connections" },
        { key: "personal_growth", label: portalT.valGrowth || "Personal Growth / Health", desc: portalT.valGrowthDesc || "Physical, emotional, spiritual wellbeing" },
        { key: "leisure", label: portalT.valLeisure || "Leisure / Recreation", desc: portalT.valLeisureDesc || "Fun, hobbies, creativity, play" },
    ];
    

  const { user } = useAuth();
  const [clientId, setClientId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [values, setValues] = useState<Record<string, { importance: number; consistency: number; description: string }>>(
    Object.fromEntries(domains.map((d) => [d.key, { importance: 5, consistency: 5, description: "" }]))
  );

  const updateDomain = (key: string, field: string, value: number | string) => {
    setValues((v) => ({ ...v, [key]: { ...v[key], [field]: value } }));
  };

  const handleSubmit = async () => {
    if (!clientId || !user) return toast.error(staffT.selectClientFirst || "Select a client first");
    setSaving(true);
    const { error } = await (supabase.from("clinical_entries") as any).insert({
      client_id: clientId,
      filled_by: user.id,
      tool_type: "values_bullseye",
      entry_data: values,
      notes,
    });
    setSaving(false);
    if (error) return toast.error(staffT.failedToSave || "Failed to save");
    toast.success(portalT.bullseyeSaved || "Values assessment saved");
    setValues(Object.fromEntries(domains.map((d) => [d.key, { importance: 5, consistency: 5, description: "" }])));
    setNotes("");
    setRefreshKey((k) => k + 1);
  };

  return (
    <ClinicalToolLayout title={portalT.bullseyeTitle || "Values Bull's Eye"} description={portalT.bullseyeDesc || "Assess values importance and consistency of action across key life domains"} icon={Target}>
      <Card className="border-border/50 mb-6">
        <CardContent className="pt-6 space-y-6">
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{staffT.client || "Client"}</Label>
            <ClientSelector value={clientId} onChange={setClientId} />
          </div>

          {domains.map((domain) => (
            <div key={domain.key} className="border border-border/50 rounded-lg p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{domain.label}</h3>
                <p className="text-xs text-muted-foreground">{domain.desc}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{portalT.whatMatters || "What matters to you in this area?"}</Label>
                <Textarea
                  className="min-h-[60px]"
                  value={values[domain.key]?.description || ""}
                  onChange={(e) => updateDomain(domain.key, "description", e.target.value)}
                  placeholder={portalT.describeValue || "Describe what you value..."}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs text-muted-foreground">{portalT.importance || "Importance"}</Label>
                    <span className="text-xs font-semibold text-primary">{values[domain.key]?.importance}/10</span>
                  </div>
                  <Slider
                    value={[values[domain.key]?.importance || 5]}
                    onValueChange={([v]) => updateDomain(domain.key, "importance", v)}
                    max={10} min={1} step={1}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs text-muted-foreground">{portalT.consistency || "Consistency of Action"}</Label>
                    <span className="text-xs font-semibold text-primary">{values[domain.key]?.consistency}/10</span>
                  </div>
                  <Slider
                    value={[values[domain.key]?.consistency || 5]}
                    onValueChange={([v]) => updateDomain(domain.key, "consistency", v)}
                    max={10} min={1} step={1}
                  />
                </div>
              </div>
            </div>
          ))}

          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{portalT.clinicalNotes || "Clinical Notes"}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={portalT.clinicalNotesPlaceholder || "Observations about discrepancies, barriers, willingness..."} />
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? (staffT.saving || "Saving...") : (portalT.submitBullseye || "Submit Values Assessment")}
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-lg font-serif text-foreground mb-2">{portalT.assessmentHistory || "Assessment History"}</h2>
      <EntryHistory
        clientId={clientId}
        toolType="values_bullseye"
        toolTitle={portalT.bullseyeTitle || "Values Bull's Eye"}
        refreshKey={refreshKey}
        getPdfSections={(data) => {
          const d = data as Record<string, { importance: number; consistency: number; description: string }>;
          return domains.map((dom) => ({
            label: dom.label,
            value: d[dom.key]
              ? `Description: ${d[dom.key].description || "—"}\nImportance: ${d[dom.key].importance}/10\nConsistency of Action: ${d[dom.key].consistency}/10`
              : "",
          }));
        }}
        renderEntry={(data, notes) => {
          const d = data as Record<string, { importance: number; consistency: number; description: string }>;
          return (
            <div className="space-y-2 text-sm">
              {domains.map((dom) => d[dom.key] && (
                <div key={dom.key} className="flex items-center gap-3">
                  <span className="font-medium w-32 shrink-0">{dom.label}</span>
                  <span className="text-primary">Imp: {d[dom.key].importance}/10</span>
                  <span className="text-muted-foreground">Act: {d[dom.key].consistency}/10</span>
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

export default ValuesBullsEye;
