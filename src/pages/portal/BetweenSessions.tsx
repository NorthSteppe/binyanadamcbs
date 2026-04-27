import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { MessageSquarePlus, NotebookPen, Calendar, Trash2, Send, CheckCircle2, Eye, EyeOff, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  content: string;
  mood: string;
  is_shared_with_therapist: boolean;
  created_at: string;
}

interface SessionRow {
  id: string;
  title: string;
  session_date: string;
  status: string;
}

interface Topic {
  id: string;
  session_id: string;
  content: string;
  is_addressed: boolean;
  created_at: string;
}

const MOODS = ["😊", "🙂", "😐", "😔", "😟", "😡", "🌧️", "✨"];

const BetweenSessions = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [draft, setDraft] = useState("");
  const [draftMood, setDraftMood] = useState("");
  const [shareWithTherapist, setShareWithTherapist] = useState(true);
  const [topicDrafts, setTopicDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const loadAll = async () => {
    if (!user) return;
    const [entriesRes, sessionsRes, topicsRes] = await Promise.all([
      supabase.from("client_journal_entries" as any).select("*").eq("client_id", user.id).order("created_at", { ascending: false }).limit(100),
      supabase.from("sessions").select("id,title,session_date,status").eq("client_id", user.id).neq("status", "cancelled").order("session_date", { ascending: true }).limit(20),
      supabase.from("session_topics" as any).select("*").eq("client_id", user.id).order("created_at", { ascending: true }),
    ]);
    setEntries((entriesRes.data as any) || []);
    setSessions((sessionsRes.data as any) || []);
    setTopics((topicsRes.data as any) || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [user?.id]);

  const handlePost = async () => {
    if (!user || !draft.trim()) return;
    if (draft.length > 5000) { toast.error("Entry too long (max 5000 chars)"); return; }
    setPosting(true);
    const { error } = await supabase.from("client_journal_entries" as any).insert({
      client_id: user.id,
      content: draft.trim(),
      mood: draftMood,
      is_shared_with_therapist: shareWithTherapist,
    });
    setPosting(false);
    if (error) { toast.error("Could not post: " + error.message); return; }
    setDraft(""); setDraftMood("");
    toast.success(shareWithTherapist ? "Shared with your therapist" : "Saved privately");
    loadAll();
  };

  const handleDeleteEntry = async (id: string) => {
    const { error } = await supabase.from("client_journal_entries" as any).delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleAddTopic = async (sessionId: string) => {
    if (!user) return;
    const text = (topicDrafts[sessionId] || "").trim();
    if (!text) return;
    if (text.length > 500) { toast.error("Topic too long (max 500 chars)"); return; }
    const { error } = await supabase.from("session_topics" as any).insert({
      session_id: sessionId, client_id: user.id, content: text,
    });
    if (error) { toast.error("Failed to add topic"); return; }
    setTopicDrafts(prev => ({ ...prev, [sessionId]: "" }));
    toast.success("Topic added");
    loadAll();
  };

  const handleDeleteTopic = async (id: string) => {
    const { error } = await supabase.from("session_topics" as any).delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setTopics(prev => prev.filter(t => t.id !== id));
  };

  const upcomingSessions = sessions.filter(s => new Date(s.session_date) >= new Date(Date.now() - 86400000));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                <Sparkles size={22} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Between Sessions</h1>
            </div>
            <p className="text-muted-foreground mb-10 ms-14">
              A space to capture thoughts, feelings, and topics you'd like to bring to your sessions.
            </p>
          </motion.div>

          {/* Journal post box */}
          <Card className="p-5 mb-6 border-border/50 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <NotebookPen size={18} className="text-primary" />
              <h2 className="text-base font-semibold">Add a journal entry</h2>
            </div>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's on your mind? Anything you'd like your therapist to know…"
              className="min-h-[110px] mb-3"
              maxLength={5000}
            />
            <div className="flex items-center gap-1 mb-3 flex-wrap">
              <span className="text-xs text-muted-foreground me-1">Mood:</span>
              {MOODS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDraftMood(draftMood === m ? "" : m)}
                  className={`text-lg w-9 h-9 rounded-full transition ${draftMood === m ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"}`}
                  aria-label={`Mood ${m}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Switch id="share" checked={shareWithTherapist} onCheckedChange={setShareWithTherapist} />
                <Label htmlFor="share" className="text-xs cursor-pointer flex items-center gap-1">
                  {shareWithTherapist ? <Eye size={12} /> : <EyeOff size={12} />}
                  {shareWithTherapist ? "Share with my therapist" : "Private (only you)"}
                </Label>
              </div>
              <Button onClick={handlePost} disabled={!draft.trim() || posting} className="rounded-full gap-2">
                <Send size={14} /> Post
              </Button>
            </div>
          </Card>

          {/* Upcoming sessions with topics */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={18} className="text-primary" />
              <h2 className="text-base font-semibold">Topics for upcoming sessions</h2>
            </div>
            {upcomingSessions.length === 0 ? (
              <Card className="p-5 border-dashed border-border/50 rounded-2xl text-center">
                <p className="text-sm text-muted-foreground mb-2">No upcoming sessions yet.</p>
                <Link to="/portal/booking">
                  <Button variant="outline" size="sm" className="rounded-full">Book a session</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 5).map(s => {
                  const sessionTopics = topics.filter(t => t.session_id === s.id);
                  return (
                    <Card key={s.id} className="p-4 border-border/50 rounded-2xl">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div>
                          <p className="text-sm font-medium">{s.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(s.session_date), "EEE, MMM d · HH:mm")}
                          </p>
                        </div>
                        <Badge variant="secondary" className="capitalize">{s.status}</Badge>
                      </div>

                      {sessionTopics.length > 0 && (
                        <ul className="space-y-1.5 mb-3">
                          {sessionTopics.map(t => (
                            <li key={t.id} className="flex items-start justify-between gap-2 text-sm group">
                              <div className="flex items-start gap-2 min-w-0 flex-1">
                                {t.is_addressed
                                  ? <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                                  : <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />}
                                <span className={t.is_addressed ? "line-through text-muted-foreground" : ""}>
                                  {t.content}
                                </span>
                              </div>
                              <button onClick={() => handleDeleteTopic(t.id)} className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive">
                                <Trash2 size={12} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="flex items-center gap-2">
                        <Input
                          value={topicDrafts[s.id] || ""}
                          onChange={(e) => setTopicDrafts(prev => ({ ...prev, [s.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddTopic(s.id); }}
                          placeholder="Add a topic to discuss…"
                          className="rounded-full text-sm"
                          maxLength={500}
                        />
                        <Button onClick={() => handleAddTopic(s.id)} size="sm" variant="outline" className="rounded-full shrink-0 gap-1">
                          <MessageSquarePlus size={14} /> Add
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Journal feed */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <NotebookPen size={18} className="text-primary" />
              <h2 className="text-base font-semibold">Your journal</h2>
            </div>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : entries.length === 0 ? (
              <Card className="p-5 border-dashed border-border/50 rounded-2xl text-center">
                <p className="text-sm text-muted-foreground">No entries yet. Start writing above.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {entries.map(e => (
                  <Card key={e.id} className="p-4 border-border/50 rounded-2xl group">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {e.mood && <span className="text-base leading-none">{e.mood}</span>}
                        <span>{format(new Date(e.created_at), "EEE, MMM d · HH:mm")}</span>
                        {!e.is_shared_with_therapist && (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <EyeOff size={10} /> Private
                          </Badge>
                        )}
                      </div>
                      <button onClick={() => handleDeleteEntry(e.id)} className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{e.content}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <Link to="/portal/messages" className="text-primary hover:underline">Need a quicker reply? Message your therapist →</Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BetweenSessions;
