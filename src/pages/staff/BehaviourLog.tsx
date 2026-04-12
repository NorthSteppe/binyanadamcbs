import { useState } from "react";
import { BarChart3 } from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import ClinicalToolLayout from "@/components/clinical/ClinicalToolLayout";
import ClientSelector from "@/components/clinical/ClientSelector";
import EntryHistory from "@/components/clinical/EntryHistory";

const BehaviourLog = () => {
  const { t } = useLanguage();
  const portalT = (t as any).staffClinical || {};
  const { user } = useAuth();
  const [clientId, setClientId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: "",
    behaviour: "",
    frequency: "",
    intensity: 5,
    duration_minutes: "",
    context: "",
    mood_before: "",
    mood_after: "",
    coping_used: "",
  });
  const [notes, setNotes] = useState("");

  const update = (field: string, value: string | number) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!clientId || !user) return toast.error(portalT.selectClientFirst || "Select a client first");
    if (!form.behaviour) return toast.error(portalT.fillBehaviour || "Enter target behaviour");
    setSaving(true);
    const { error } = await (supabase.from("clinical_entries") as any).insert({
      client_id: clientId,
      filled_by: user.id,
      tool_type: "behaviour_log",
      entry_data: form,
      notes,
      entry_date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
    });
    setSaving(false);
    if (error) return toast.error(portalT.failedToSave || "Failed to save");
    toast.success(portalT.logSaved || "Behaviour log saved");
    setForm({ date: "", behaviour: "", frequency: "", intensity: 5, duration_minutes: "", context: "", mood_before: "", mood_after: "", coping_used: "" });
    setNotes("");
    setRefreshKey((k) => k + 1);
  };

  return (
    <ClinicalToolLayout title={portalT.logTitle || "Behaviour Tracking Log"} description={portalT.logDesc || "Daily frequency, intensity, and context tracking for target behaviours"} icon={BarChart3}>
      <Card className="border-border/50 mb-6">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{portalT.client || "Client"}</Label>
            <ClientSelector value={clientId} onChange={setClientId} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.dateTime || "Date"}</Label>
              <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.targetBehaviour || "Target Behaviour"}</Label>
              <Input value={form.behaviour} onChange={(e) => update("behaviour", e.target.value)} placeholder="e.g. Nail biting, avoidance..." />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.frequencyCount || "Frequency (count)"}</Label>
              <Input type="number" value={form.frequency} onChange={(e) => update("frequency", e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.durationMinutes || "Duration (minutes)"}</Label>
              <Input type="number" value={form.duration_minutes} onChange={(e) => update("duration_minutes", e.target.value)} placeholder="0" />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground">{portalT.intensity || "Intensity"}</Label>
                <span className="text-xs font-semibold text-primary">{form.intensity}/10</span>
              </div>
              <Slider value={[form.intensity]} onValueChange={([v]) => update("intensity", v)} max={10} min={1} step={1} className="mt-3" />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">{portalT.settingContext || "Context / Situation"}</Label>
            <Textarea value={form.context} onChange={(e) => update("context", e.target.value)} placeholder="Where, when, who was present..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.moodBefore || "Mood Before"}</Label>
              <Select value={form.mood_before} onValueChange={(v) => update("mood_before", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {["Very Low", "Low", "Neutral", "Good", "Very Good"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{portalT.moodAfter || "Mood After"}</Label>
              <Select value={form.mood_after} onValueChange={(v) => update("mood_after", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {["Very Low", "Low", "Neutral", "Good", "Very Good"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">{portalT.copingUsed || "Coping Strategy Used"}</Label>
            <Input value={form.coping_used} onChange={(e) => update("coping_used", e.target.value)} placeholder={portalT.copingPlaceholder || "e.g. Deep breathing, defusion technique, grounding..."} />
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{portalT.notes || "Notes"}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional observations..." />
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? (portalT.saving || "Saving...") : (portalT.submitLog || "Submit Log Entry")}
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-lg font-serif text-foreground mb-2">{portalT.entryHistory || "Log History"}</h2>
      <EntryHistory
        clientId={clientId}
        toolType="behaviour_log"
        toolTitle={portalT.logTitle || "Behaviour Tracking Log"}
        refreshKey={refreshKey}
        getPdfSections={(data) => {
          const d = data as Record<string, string | number>;
          return [
            { label: "Target Behaviour", value: String(d.behaviour || "") },
            { label: "Frequency", value: String(d.frequency || "") },
            { label: "Intensity", value: d.intensity ? `${d.intensity}/10` : "" },
            { label: "Duration (minutes)", value: String(d.duration_minutes || "") },
            { label: "Context / Situation", value: String(d.context || "") },
            { label: "Mood Before", value: String(d.mood_before || "") },
            { label: "Mood After", value: String(d.mood_after || "") },
          ];
        }}
        renderEntry={(data, notes) => {
          const d = data as Record<string, string | number>;
          return (
            <div className="space-y-1 text-sm">
              <p className="font-medium">{d.behaviour}</p>
              <div className="flex gap-4 text-muted-foreground">
                {d.frequency && <span>Freq: {d.frequency}</span>}
                {d.intensity && <span>Intensity: {String(d.intensity)}/10</span>}
                {d.duration_minutes && <span>Duration: {d.duration_minutes}m</span>}
              </div>
              {d.mood_before && <p>Mood: {d.mood_before} → {d.mood_after}</p>}
              {notes && <p className="italic text-muted-foreground">{notes}</p>}
            </div>
          );
        }}
      />
    </ClinicalToolLayout>
  );
};

export default BehaviourLog;
