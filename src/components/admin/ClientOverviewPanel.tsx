import { useEffect, useState } from "react";
import { AlertTriangle, Save, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Stage = "new" | "active" | "paused" | "discharged";
type Risk = "low" | "medium" | "high";

interface Props { clientId: string; }

const ClientOverviewPanel = ({ clientId }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stage, setStage] = useState<Stage>("new");
  const [risk, setRisk] = useState<Risk>("low");
  const [riskNote, setRiskNote] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("client_overview")
        .select("*")
        .eq("client_id", clientId)
        .maybeSingle();
      if (data) {
        setStage(data.stage as Stage);
        setRisk(data.risk_level as Risk);
        setRiskNote(data.risk_note);
        setSummary(data.internal_summary);
        setTags(data.tags ?? []);
      }
      setLoading(false);
    })();
  }, [clientId]);

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput("");
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("client_overview").upsert({
      client_id: clientId,
      stage,
      risk_level: risk,
      risk_note: riskNote,
      internal_summary: summary,
      tags,
      updated_by: user.id,
    });
    setSaving(false);
    if (error) toast.error("Failed to save: " + error.message);
    else toast.success("Overview saved");
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading overview...</div>;

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Stage</label>
          <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="discharged">Discharged</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Risk level</label>
          <Select value={risk} onValueChange={(v) => setRisk(v as Risk)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {risk !== "low" && (
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5 flex items-center gap-1">
            <AlertTriangle size={12} /> Risk note
          </label>
          <Textarea
            value={riskNote}
            onChange={(e) => setRiskNote(e.target.value)}
            rows={2}
            placeholder="Brief context for the risk flag..."
          />
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Tags</label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {tags.map((t) => (
            <Badge key={t} variant="secondary" className="gap-1 pr-1">
              {t}
              <button onClick={() => removeTag(t)} className="hover:text-destructive">
                <X size={10} />
              </button>
            </Badge>
          ))}
          {tags.length === 0 && <span className="text-xs text-muted-foreground">No tags yet</span>}
        </div>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder="Add a tag (e.g. anxiety, parent-coaching)"
            className="h-9 text-sm"
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag}>
            <Plus size={13} />
          </Button>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">
          Internal summary <span className="text-muted-foreground/60">(visible to admins + assigned staff only)</span>
        </label>
        <Textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          placeholder="Short private summary of the case..."
        />
      </div>

      <Button onClick={save} disabled={saving} className="rounded-full gap-2">
        <Save size={14} /> {saving ? "Saving..." : "Save overview"}
      </Button>
    </div>
  );
};

export default ClientOverviewPanel;
