import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Sun, CheckCircle2, Clock, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

type PlanItem = {
  time: string;
  title: string;
  type: "task" | "focus" | "session" | "break";
  task_id?: string;
  duration_minutes: number;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-schedule`;

const DailyPlanner = () => {
  const { session } = useAuth();
  const qc = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: plan } = useQuery({
    queryKey: ["daily_plan", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_plans")
        .select("*")
        .eq("plan_date", today)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["user_tasks_for_plan"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_tasks")
        .select("id, title, priority, estimated_minutes, due_date, status")
        .eq("is_completed", false)
        .order("priority", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const { data: todaySessions = [] } = useQuery({
    queryKey: ["today_sessions"],
    queryFn: async () => {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      const { data, error } = await supabase
        .from("sessions")
        .select("id, title, session_date, duration_minutes, status")
        .gte("session_date", start.toISOString())
        .lte("session_date", end.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const { data: focusBlocks = [] } = useQuery({
    queryKey: ["today_focus"],
    queryFn: async () => {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      const { data, error } = await supabase
        .from("focus_blocks")
        .select("*")
        .gte("start_time", start.toISOString())
        .lte("start_time", end.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const generatePlan = async () => {
    if (!session?.access_token) return;
    setIsGenerating(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          tasks: tasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority, estimated_minutes: t.estimated_minutes, due_date: t.due_date })),
          sessions: todaySessions.map((s: any) => ({ title: s.title, time: s.session_date, duration: s.duration_minutes })),
          focus_blocks: focusBlocks.map((f: any) => ({ title: f.title, start: f.start_time, end: f.end_time })),
          date: today,
        }),
      });
      if (!resp.ok) {
        toast.error(resp.status === 429 ? "Too many requests, try again shortly" : "Failed to generate plan");
        setIsGenerating(false);
        return;
      }
      const result = await resp.json();
      // Upsert plan
      const { error } = await supabase
        .from("daily_plans")
        .upsert({ user_id: session.user.id, plan_date: today, plan_data: result.plan || [] }, { onConflict: "user_id,plan_date" });
      if (error) throw error;

      // Update scheduled tasks if AI returned scheduling info
      if (result.scheduled_tasks) {
        for (const st of result.scheduled_tasks) {
          await supabase.from("user_tasks").update({
            scheduled_start: st.scheduled_start,
            scheduled_end: st.scheduled_end,
            status: "in_progress",
          }).eq("id", st.task_id);
        }
      }

      qc.invalidateQueries({ queryKey: ["daily_plan"] });
      qc.invalidateQueries({ queryKey: ["user_tasks"] });
      qc.invalidateQueries({ queryKey: ["scheduled_tasks"] });
      toast.success("Daily plan generated!");
    } catch {
      toast.error("Failed to generate plan");
    }
    setIsGenerating(false);
  };

  const planItems: PlanItem[] = plan?.plan_data as PlanItem[] || [];

  const typeStyles: Record<string, string> = {
    task: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30",
    focus: "border-l-purple-500 bg-purple-50 dark:bg-purple-950/30",
    session: "border-l-primary bg-primary/5",
    break: "border-l-green-500 bg-green-50 dark:bg-green-950/30",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sun size={20} className="text-amber-500" /> Today's Plan
          </h2>
          <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <Button size="sm" onClick={generatePlan} disabled={isGenerating} variant={plan ? "outline" : "default"}>
          {isGenerating ? <Loader2 size={14} className="mr-1 animate-spin" /> : plan ? <RefreshCw size={14} className="mr-1" /> : <Sparkles size={14} className="mr-1" />}
          {plan ? "Regenerate" : "Generate Plan"}
        </Button>
      </div>

      {planItems.length === 0 && !isGenerating && (
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <Sparkles className="mx-auto text-muted-foreground/30 mb-2" size={32} />
          <p className="text-sm text-muted-foreground">Click "Generate Plan" to let AI create your optimised daily schedule.</p>
          <p className="text-xs text-muted-foreground mt-1">
            {tasks.length} pending tasks · {todaySessions.length} sessions · {focusBlocks.length} focus blocks
          </p>
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <Loader2 className="mx-auto text-primary mb-2 animate-spin" size={32} />
          <p className="text-sm text-muted-foreground">AI is building your optimal schedule...</p>
        </div>
      )}

      {planItems.length > 0 && (
        <div className="space-y-2">
          {planItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`border-l-4 rounded-lg p-3 ${typeStyles[item.type] || typeStyles.task}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{item.time}</span>
                  <span className="text-sm font-medium text-foreground">{item.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[10px]"><Clock size={8} className="mr-0.5" />{item.duration_minutes}m</Badge>
                  <Badge variant="secondary" className="text-[10px] capitalize">{item.type}</Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyPlanner;
