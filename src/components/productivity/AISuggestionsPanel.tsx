import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Clock, Flag, Plus, GripVertical, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type AISuggestion = {
  title: string;
  description: string;
  priority: string;
  estimated_minutes: number;
  suggested_time: string;
  reason: string;
};

const SUGGEST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-suggest-tasks`;

interface AISuggestionsPanelProps {
  activeTab: string;
}

const AISuggestionsPanel = ({ activeTab }: AISuggestionsPanelProps) => {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const { data: allTasks = [] } = useQuery({
    queryKey: ["all_user_tasks_for_ai"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_tasks")
        .select("id, title, description, priority, status, due_date, estimated_minutes, is_completed, labels")
        .eq("is_completed", false)
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ["user_projects_for_ai"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_projects").select("id, name, color").eq("is_archived", false);
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const fetchSuggestions = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    setHasGenerated(true);
    try {
      const now = new Date();
      const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const [sessionsRes, todosRes] = await Promise.all([
        supabase
          .from("sessions")
          .select("title, session_date, duration_minutes, status, description")
          .gte("session_date", now.toISOString())
          .lte("session_date", weekLater.toISOString())
          .order("session_date", { ascending: true })
          .limit(20),
        supabase
          .from("client_todos")
          .select("title, description, due_date, is_completed")
          .eq("is_completed", false)
          .limit(20),
      ]);

      const resp = await fetch(SUGGEST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          tasks: allTasks.map((t: any) => ({
            title: t.title, priority: t.priority, status: t.status,
            due_date: t.due_date, estimated_minutes: t.estimated_minutes, labels: t.labels,
          })),
          projects: allProjects.map((p: any) => ({ name: p.name })),
          sessions: (sessionsRes.data || []).map((s: any) => ({
            title: s.title, date: s.session_date, duration: s.duration_minutes, status: s.status,
          })),
          client_todos: (todosRes.data || []).map((t: any) => ({
            title: t.title, description: t.description, due_date: t.due_date,
          })),
          date: format(new Date(), "yyyy-MM-dd"),
        }),
      });

      if (resp.status === 429) { toast.error("Rate limited. Try again shortly."); return; }
      if (resp.status === 402) { toast.error("AI credits required."); return; }
      if (!resp.ok) throw new Error("Failed");

      const data = await resp.json();
      setSuggestions(data.suggestions || []);
    } catch {
      toast.error("Failed to get AI suggestions");
    } finally {
      setIsLoading(false);
    }
  }, [session, allTasks, allProjects]);

  const addAsTask = useMutation({
    mutationFn: async ({ suggestion, status }: { suggestion: AISuggestion; status: string }) => {
      const [h, m] = suggestion.suggested_time.split(":").map(Number);
      const endMinutes = h * 60 + m + suggestion.estimated_minutes;
      const endH = Math.floor(endMinutes / 60);
      const endM = endMinutes % 60;

      const today = new Date();
      const start = new Date(today);
      start.setHours(h, m, 0, 0);
      const end = new Date(today);
      end.setHours(endH, endM, 0, 0);

      const { error } = await supabase.from("user_tasks").insert({
        user_id: session!.user.id,
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        status,
        estimated_minutes: suggestion.estimated_minutes,
        scheduled_start: start.toISOString(),
        scheduled_end: end.toISOString(),
        due_date: today.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: (_, { suggestion }) => {
      qc.invalidateQueries({ queryKey: ["user_tasks"] });
      qc.invalidateQueries({ queryKey: ["scheduled_tasks"] });
      qc.invalidateQueries({ queryKey: ["all_user_tasks_for_ai"] });
      setSuggestions((prev) => prev.filter((s) => s.title !== suggestion.title));
      toast.success("Task added!");
    },
    onError: () => toast.error("Failed to add task"),
  });

  const handleDragStart = (e: React.DragEvent, suggestion: AISuggestion) => {
    e.dataTransfer.setData("application/json", JSON.stringify(suggestion));
    e.dataTransfer.setData("text/plain", "ai-suggestion");
    e.dataTransfer.effectAllowed = "copy";
  };

  const dismissSuggestion = (title: string) => {
    setSuggestions((prev) => prev.filter((s) => s.title !== title));
  };

  const priorityColor = (p: string) => {
    if (p === "urgent") return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    if (p === "high") return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    if (p === "medium") return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Sparkles size={14} className="text-primary" /> AI Suggestions
        </h3>
        <Button
          variant="ghost" size="sm" className="h-7 text-xs gap-1"
          onClick={fetchSuggestions} disabled={isLoading}
        >
          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          {hasGenerated ? "Refresh" : "Generate"}
        </Button>
      </div>

      {!hasGenerated && !isLoading && (
        <div className="text-center py-6">
          <Sparkles className="mx-auto text-muted-foreground/30 mb-2" size={24} />
          <p className="text-xs text-muted-foreground">
            Generate AI suggestions based on your tasks, calendar, and to-dos.
          </p>
          <Button size="sm" className="mt-3 gap-1" onClick={fetchSuggestions}>
            <Sparkles size={12} /> Generate Suggestions
          </Button>
        </div>
      )}

      {isLoading && suggestions.length === 0 && (
        <div className="py-6 text-center">
          <Loader2 className="animate-spin mx-auto text-primary mb-2" size={20} />
          <p className="text-xs text-muted-foreground">Analysing your tasks & calendar…</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2 pr-1">
            <p className="text-[10px] text-muted-foreground">
              Drag suggestions to the board or click to add
            </p>
            <AnimatePresence>
              {suggestions.map((s, i) => (
                <motion.div
                  key={s.title}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  draggable
                  onDragStart={(e: any) => handleDragStart(e, s)}
                  className="border border-border rounded-xl p-3 space-y-1.5 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors bg-card group"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical size={12} className="text-muted-foreground/40 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-medium text-foreground leading-snug">{s.title}</h4>
                        <button onClick={() => dismissSuggestion(s.title)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} className="text-muted-foreground" />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{s.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 ml-5">
                    <Badge className={`text-[9px] px-1.5 py-0 border ${priorityColor(s.priority)}`}>
                      <Flag size={8} className="mr-0.5" />{s.priority}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                      <Clock size={8} className="mr-0.5" />{s.suggested_time}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                      {s.estimated_minutes}m
                    </Badge>
                  </div>

                  <p className="text-[9px] text-muted-foreground/70 italic ml-5">{s.reason}</p>

                  <div className="flex gap-1 ml-5">
                    <Button
                      size="sm" variant="outline"
                      className="h-6 text-[10px] px-2 gap-0.5"
                      onClick={() => addAsTask.mutate({ suggestion: s, status: "todo" })}
                    >
                      <Plus size={10} /> To Do
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="h-6 text-[10px] px-2 gap-0.5"
                      onClick={() => addAsTask.mutate({ suggestion: s, status: "in_progress" })}
                    >
                      <Plus size={10} /> In Progress
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}

      {hasGenerated && !isLoading && suggestions.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          All suggestions have been added! Click refresh for more.
        </p>
      )}
    </div>
  );
};

export default AISuggestionsPanel;
