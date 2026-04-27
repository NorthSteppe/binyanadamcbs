import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Circle, NotebookPen, Calendar, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props { clientId: string }

interface JournalEntry {
  id: string;
  content: string;
  mood: string;
  is_shared_with_therapist: boolean;
  created_at: string;
}

interface Topic {
  id: string;
  session_id: string;
  content: string;
  is_addressed: boolean;
  created_at: string;
}

interface SessionLite {
  id: string;
  title: string;
  session_date: string;
}

const ClientBetweenSessionsPanel = ({ clientId }: Props) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sessions, setSessions] = useState<Record<string, SessionLite>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [eRes, tRes] = await Promise.all([
      supabase.from("client_journal_entries" as any).select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
      supabase.from("session_topics" as any).select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
    ]);
    const entriesData = (eRes.data as any) || [];
    const topicsData = (tRes.data as any) || [];
    setEntries(entriesData);
    setTopics(topicsData);

    const sessionIds: string[] = [...new Set(topicsData.map((t: Topic) => t.session_id as string))];
    if (sessionIds.length) {
      const { data: sData } = await supabase.from("sessions").select("id,title,session_date").in("id", sessionIds);
      const map: Record<string, SessionLite> = {};
      (sData || []).forEach((s: any) => { map[s.id] = s; });
      setSessions(map);
    }
    setLoading(false);
  };

  useEffect(() => { if (clientId) load(); }, [clientId]);

  const toggleAddressed = async (topic: Topic) => {
    const { error } = await supabase.from("session_topics" as any)
      .update({ is_addressed: !topic.is_addressed })
      .eq("id", topic.id);
    if (error) { toast.error("Failed to update"); return; }
    setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, is_addressed: !t.is_addressed } : t));
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      {/* Session topics */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-primary" />
          <h3 className="font-semibold text-sm">Topics the client wants to discuss</h3>
          {topics.filter(t => !t.is_addressed).length > 0 && (
            <Badge variant="secondary" className="ml-1">{topics.filter(t => !t.is_addressed).length} open</Badge>
          )}
        </div>
        {topics.length === 0 ? (
          <Card className="p-4 border-dashed border-border/50 rounded-2xl">
            <p className="text-sm text-muted-foreground">No topics added by this client yet.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {topics.map(t => {
              const s = sessions[t.session_id];
              return (
                <Card key={t.id} className="p-3 border-border/50 rounded-2xl flex items-start gap-3">
                  <button onClick={() => toggleAddressed(t)} className="mt-0.5 shrink-0" aria-label="Toggle addressed">
                    {t.is_addressed
                      ? <CheckCircle2 size={18} className="text-primary" />
                      : <Circle size={18} className="text-muted-foreground hover:text-primary" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${t.is_addressed ? "line-through text-muted-foreground" : ""}`}>{t.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s ? `${s.title} · ${format(new Date(s.session_date), "EEE, MMM d · HH:mm")}` : "Session"}
                      {" · added "}{format(new Date(t.created_at), "MMM d")}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Journal */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <NotebookPen size={16} className="text-primary" />
          <h3 className="font-semibold text-sm">Client journal</h3>
        </div>
        {entries.length === 0 ? (
          <Card className="p-4 border-dashed border-border/50 rounded-2xl">
            <p className="text-sm text-muted-foreground">No journal entries yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map(e => (
              <Card key={e.id} className="p-4 border-border/50 rounded-2xl">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  {e.mood && <span className="text-base leading-none">{e.mood}</span>}
                  <span>{format(new Date(e.created_at), "EEE, MMM d, yyyy · HH:mm")}</span>
                  {!e.is_shared_with_therapist && (
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <EyeOff size={10} /> Private
                    </Badge>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{e.content}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientBetweenSessionsPanel;
