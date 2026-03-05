import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Save,
  History,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Brain,
  Heart,
  Eye,
  Shield,
  TrendingUp,
  CalendarDays,
  MessageSquare,
  Loader2,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

// Types
interface MatrixEntry {
  id: string;
  user_id: string;
  filled_by: string;
  values_text: string;
  internal_obstacles: string;
  avoidance_behaviours: string;
  committed_actions: string;
  notes: string;
  created_at: string;
}

type QuadrantKey = "values_text" | "internal_obstacles" | "avoidance_behaviours" | "committed_actions";

interface QuadrantConfig {
  key: QuadrantKey;
  label: string;
  prompt: string;
  icon: React.ReactNode;
  position: string;
  color: string;
  bgColor: string;
}

const QUADRANTS: QuadrantConfig[] = [
  {
    key: "committed_actions",
    label: "Toward Actions",
    prompt: "What observable actions can you take to move toward your values, even when difficult thoughts are present?",
    icon: <ArrowUpRight size={18} />,
    position: "top-right",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
  },
  {
    key: "avoidance_behaviours",
    label: "Away Behaviours",
    prompt: "What observable things do you do to escape or avoid those difficult thoughts and feelings?",
    icon: <Shield size={18} />,
    position: "top-left",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  },
  {
    key: "values_text",
    label: "Values",
    prompt: "Who and what is important to you? What do you care about deeply?",
    icon: <Heart size={18} />,
    position: "bottom-right",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  },
  {
    key: "internal_obstacles",
    label: "Internal Obstacles",
    prompt: "What difficult thoughts, feelings, memories, or sensations show up and get in the way?",
    icon: <Brain size={18} />,
    position: "bottom-left",
    color: "text-rose-700 dark:text-rose-400",
    bgColor: "bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
  },
];

// Voice recognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const ACT_SYSTEM_PROMPT = `You are a warm, skilled ACT (Acceptance and Commitment Therapy) practitioner guiding a client through the ACT Matrix. You help them explore four quadrants one at a time:

1. Values (bottom-right): Who and what is important to them
2. Internal Obstacles (bottom-left): Difficult thoughts and feelings that show up
3. Away Behaviours (top-left): Observable actions taken to avoid discomfort
4. Toward Actions (top-right): Observable actions to move toward values

Guide conversationally. Ask one question at a time. Be empathetic but concise. When you have enough for a quadrant, summarise it in 1-2 sentences and move to the next. When all four are complete, output a JSON block like:
\`\`\`json
{"values_text":"...","internal_obstacles":"...","avoidance_behaviours":"...","committed_actions":"..."}
\`\`\`
Start by warmly introducing the Matrix and asking about their values.`;

export default function ACTMatrix({ targetUserId }: { targetUserId?: string }) {
  const { user, isStaff } = useAuth();
  const userId = targetUserId || user?.id;

  const [view, setView] = useState<"form" | "history" | "chat">("form");
  const [form, setForm] = useState<Record<QuadrantKey, string>>({
    values_text: "",
    internal_obstacles: "",
    avoidance_behaviours: "",
    committed_actions: "",
  });
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<MatrixEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeQuadrant, setActiveQuadrant] = useState<QuadrantKey | null>(null);

  // Voice
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Chat
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatListening, setChatListening] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatRecognitionRef = useRef<any>(null);
  const { session } = useAuth();

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Load history
  const loadHistory = useCallback(async () => {
    if (!userId) return;
    setLoadingHistory(true);
    const { data } = await supabase
      .from("act_matrix_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setEntries(data as unknown as MatrixEntry[]);
    setLoadingHistory(false);
  }, [userId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Voice for individual quadrant
  const toggleVoice = (quadrant: QuadrantKey) => {
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }
    if (listening && activeQuadrant === quadrant) {
      recognitionRef.current?.stop();
      setListening(false);
      setActiveQuadrant(null);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";
    let finalTranscript = form[quadrant];
    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += (finalTranscript ? " " : "") + e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setForm((f) => ({ ...f, [quadrant]: finalTranscript + (interim ? " " + interim : "") }));
    };
    recognition.onerror = () => {
      setListening(false);
      setActiveQuadrant(null);
    };
    recognition.onend = () => {
      setListening(false);
      setActiveQuadrant(null);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setActiveQuadrant(quadrant);
  };

  // Save
  const handleSave = async () => {
    if (!userId || !user?.id) return;
    const isEmpty = Object.values(form).every((v) => !v.trim());
    if (isEmpty) {
      toast.error("Please fill in at least one quadrant");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("act_matrix_entries").insert({
      user_id: userId,
      filled_by: user.id,
      ...form,
      notes,
    } as any);
    if (error) {
      toast.error("Failed to save entry");
    } else {
      toast.success("ACT Matrix entry saved");
      setForm({ values_text: "", internal_obstacles: "", avoidance_behaviours: "", committed_actions: "" });
      setNotes("");
      loadHistory();
    }
    setSaving(false);
  };

  // AI Chat
  const sendChat = async (text?: string) => {
    const msg = text || chatInput.trim();
    if (!msg || chatLoading || !session?.access_token) return;
    setChatInput("");
    const userMsg = { role: "user" as const, content: msg };
    const allMessages = [...chatMessages, userMsg];
    setChatMessages(allMessages);
    setChatLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [{ role: "system", content: ACT_SYSTEM_PROMPT }, ...allMessages],
        }),
      });
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantSoFar = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setChatMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Check if final message contains JSON matrix data
      const jsonMatch = assistantSoFar.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          setForm({
            values_text: parsed.values_text || "",
            internal_obstacles: parsed.internal_obstacles || "",
            avoidance_behaviours: parsed.avoidance_behaviours || "",
            committed_actions: parsed.committed_actions || "",
          });
          toast.success("Matrix filled from conversation! Review and save when ready.");
          setView("form");
        } catch {}
      }
    } catch (e) {
      toast.error("Chat error, please try again");
    }
    setChatLoading(false);
  };

  // Chat voice
  const toggleChatVoice = () => {
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported");
      return;
    }
    if (chatListening) {
      chatRecognitionRef.current?.stop();
      setChatListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-GB";
    let finalResult = "";
    recognition.onresult = (e: any) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
        if (e.results[i].isFinal) finalResult = transcript;
      }
      setChatInput(transcript);
    };
    recognition.onend = () => {
      setChatListening(false);
      if (finalResult.trim()) {
        sendChat(finalResult.trim());
      }
    };
    recognition.onerror = () => setChatListening(false);
    chatRecognitionRef.current = recognition;
    recognition.start();
    setChatListening(true);
  };

  // Staff: client selector
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");

  useEffect(() => {
    if (isStaff && !targetUserId) {
      // Load assigned clients for team members, or all for admins
      const loadClients = async () => {
        const { data } = await supabase.from("profiles").select("id, full_name").order("full_name");
        if (data) setClients(data);
      };
      loadClients();
    }
  }, [isStaff, targetUserId]);

  const effectiveUserId = targetUserId || (isStaff && selectedClient ? selectedClient : user?.id);

  // Reload history when effective user changes
  useEffect(() => {
    if (effectiveUserId) {
      const load = async () => {
        setLoadingHistory(true);
        const { data } = await supabase
          .from("act_matrix_entries")
          .select("*")
          .eq("user_id", effectiveUserId)
          .order("created_at", { ascending: false })
          .limit(50);
        if (data) setEntries(data as unknown as MatrixEntry[]);
        setLoadingHistory(false);
      };
      load();
    }
  }, [effectiveUserId]);

  const handleSaveForClient = async () => {
    const uid = effectiveUserId;
    if (!uid || !user?.id) return;
    const isEmpty = Object.values(form).every((v) => !v.trim());
    if (isEmpty) {
      toast.error("Please fill in at least one quadrant");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("act_matrix_entries").insert({
      user_id: uid,
      filled_by: user.id,
      ...form,
      notes,
    } as any);
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("ACT Matrix entry saved");
      setForm({ values_text: "", internal_obstacles: "", avoidance_behaviours: "", committed_actions: "" });
      setNotes("");
      // reload
      const { data } = await supabase
        .from("act_matrix_entries")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setEntries(data as unknown as MatrixEntry[]);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Staff: Client selector */}
      {isStaff && !targetUserId && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground">Client:</label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.full_name || "Unnamed"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === "form" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("form")}
          className="gap-1.5"
        >
          <Eye size={15} /> Matrix
        </Button>
        <Button
          variant={view === "chat" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setView("chat");
            if (chatMessages.length === 0) {
              // Start conversation
              setChatMessages([]);
              sendChat("Hello, I'd like to fill in my ACT Matrix.");
            }
          }}
          className="gap-1.5"
        >
          <MessageSquare size={15} /> Voice Guide
        </Button>
        <Button
          variant={view === "history" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setView("history");
            loadHistory();
          }}
          className="gap-1.5"
        >
          <History size={15} /> History
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {view === "form" && (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Axis Labels */}
            <div className="relative mb-2">
              <div className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Observable Behaviour ↑
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-2 gap-3 relative">
              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="bg-background border border-border rounded-full px-3 py-1.5 shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground">
                    ← Away&nbsp;&nbsp;|&nbsp;&nbsp;Toward →
                  </span>
                </div>
              </div>

              {QUADRANTS.map((q) => (
                <div key={q.key} className={`rounded-xl border p-4 ${q.bgColor} transition-all`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`flex items-center gap-1.5 font-semibold text-sm ${q.color}`}>
                      {q.icon} {q.label}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 w-7 p-0 ${listening && activeQuadrant === q.key ? "text-red-500 animate-pulse" : "text-muted-foreground"}`}
                      onClick={() => toggleVoice(q.key)}
                      title={listening && activeQuadrant === q.key ? "Stop listening" : "Speak"}
                    >
                      {listening && activeQuadrant === q.key ? <MicOff size={14} /> : <Mic size={14} />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{q.prompt}</p>
                  <Textarea
                    value={form[q.key]}
                    onChange={(e) => setForm((f) => ({ ...f, [q.key]: e.target.value }))}
                    placeholder="Type or speak..."
                    className="min-h-[80px] text-sm bg-background/60 resize-none"
                  />
                </div>
              ))}
            </div>

            <div className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
              ↓ Inner Experience (Thoughts & Feelings)
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="text-sm font-medium text-foreground mb-1 block">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes or observations..."
                className="min-h-[60px] text-sm resize-none"
              />
            </div>

            <Button onClick={isStaff ? handleSaveForClient : handleSave} disabled={saving} className="w-full mt-4 gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Entry
            </Button>
          </motion.div>
        )}

        {view === "chat" && (
          <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="h-[350px] overflow-y-auto p-4 space-y-3">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              <div className="border-t border-border p-3 flex gap-2">
                <Button
                  variant={chatListening ? "destructive" : "outline"}
                  size="icon"
                  className="shrink-0"
                  onClick={toggleChatVoice}
                >
                  {chatListening ? <MicOff size={16} /> : <Mic size={16} />}
                </Button>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="Type or use the mic..."
                  className="flex-1 bg-background border border-input rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <Button size="icon" onClick={() => sendChat()} disabled={chatLoading || !chatInput.trim()}>
                  <ArrowUpRight size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {view === "history" && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : entries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No entries yet.</p>
            ) : (
              <div className="space-y-4">
                {/* Trend summary */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Progress Overview</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-muted-foreground" />
                      <span className="text-muted-foreground">{entries.length} entries total</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Latest: {entries[0] ? format(new Date(entries[0].created_at), "dd MMM yyyy") : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Entry list */}
                {entries.map((entry) => (
                  <details key={entry.id} className="bg-card border border-border rounded-xl overflow-hidden group">
                    <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-lg p-2">
                          <Eye size={14} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {format(new Date(entry.created_at), "dd MMM yyyy, HH:mm")}
                          </p>
                          {entry.filled_by !== entry.user_id && (
                            <p className="text-xs text-muted-foreground">Filled by staff</p>
                          )}
                        </div>
                      </div>
                    </summary>
                    <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                      {QUADRANTS.map((q) => (
                        <div key={q.key} className={`rounded-lg border p-3 ${q.bgColor}`}>
                          <div className={`flex items-center gap-1 text-xs font-semibold mb-1 ${q.color}`}>
                            {q.icon} {q.label}
                          </div>
                          <p className="text-xs text-foreground whitespace-pre-wrap">
                            {(entry as any)[q.key] || "—"}
                          </p>
                        </div>
                      ))}
                      {entry.notes && (
                        <div className="col-span-2 text-xs text-muted-foreground border-t pt-2 mt-1">
                          <strong>Notes:</strong> {entry.notes}
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
