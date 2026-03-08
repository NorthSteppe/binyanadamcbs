import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Shield, Eye, EyeOff } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

type FocusBlock = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
};

type ScheduledTask = {
  id: string;
  title: string;
  scheduled_start: string;
  scheduled_end: string;
  priority: string;
};

type CalendarShare = {
  id: string;
  shared_with_id: string;
  can_view_tasks: boolean;
  can_view_focus: boolean;
  can_view_sessions: boolean;
  profiles?: { full_name: string } | null;
};

const PersonalCalendar = () => {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [focusDialogOpen, setFocusDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [newFocus, setNewFocus] = useState({ title: "Focus Time", start: "", end: "" });
  const [shareEmail, setShareEmail] = useState("");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const { data: focusBlocks = [] } = useQuery({
    queryKey: ["focus_blocks", format(currentMonth, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("focus_blocks")
        .select("*")
        .gte("start_time", calStart.toISOString())
        .lte("start_time", calEnd.toISOString());
      if (error) throw error;
      return data as FocusBlock[];
    },
    enabled: !!session,
  });

  const { data: scheduledTasks = [] } = useQuery({
    queryKey: ["scheduled_tasks", format(currentMonth, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_tasks")
        .select("id, title, scheduled_start, scheduled_end, priority")
        .not("scheduled_start", "is", null)
        .gte("scheduled_start", calStart.toISOString())
        .lte("scheduled_start", calEnd.toISOString());
      if (error) throw error;
      return data as ScheduledTask[];
    },
    enabled: !!session,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["my_sessions", format(currentMonth, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, title, session_date, status, duration_minutes")
        .gte("session_date", calStart.toISOString())
        .lte("session_date", calEnd.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const { data: shares = [] } = useQuery({
    queryKey: ["calendar_shares"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_shares")
        .select("*")
        .eq("owner_id", session!.user.id);
      if (error) throw error;
      return data as CalendarShare[];
    },
    enabled: !!session,
  });

  const createFocusBlock = useMutation({
    mutationFn: async () => {
      if (!selectedDate) return;
      const startDate = new Date(selectedDate);
      const [sh, sm] = newFocus.start.split(":").map(Number);
      startDate.setHours(sh, sm, 0, 0);
      const endDate = new Date(selectedDate);
      const [eh, em] = newFocus.end.split(":").map(Number);
      endDate.setHours(eh, em, 0, 0);
      const { error } = await supabase.from("focus_blocks").insert({
        user_id: session!.user.id,
        title: newFocus.title,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["focus_blocks"] });
      setFocusDialogOpen(false);
      setNewFocus({ title: "Focus Time", start: "", end: "" });
      toast.success("Focus block added");
    },
    onError: () => toast.error("Failed to add focus block"),
  });

  const dayData = useMemo(() => {
    const map = new Map<string, { focus: FocusBlock[]; tasks: ScheduledTask[]; sessions: any[] }>();
    days.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      map.set(key, { focus: [], tasks: [], sessions: [] });
    });
    focusBlocks.forEach((fb) => {
      const key = format(new Date(fb.start_time), "yyyy-MM-dd");
      map.get(key)?.focus.push(fb);
    });
    scheduledTasks.forEach((t) => {
      const key = format(new Date(t.scheduled_start!), "yyyy-MM-dd");
      map.get(key)?.tasks.push(t);
    });
    sessions.forEach((s: any) => {
      const key = format(new Date(s.session_date), "yyyy-MM-dd");
      map.get(key)?.sessions.push(s);
    });
    return map;
  }, [days, focusBlocks, scheduledTasks, sessions]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setFocusDialogOpen(true);
    setNewFocus({ title: "Focus Time", start: "09:00", end: "10:00" });
  };

  const today = new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Personal Calendar</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
            <Shield size={14} className="mr-1" /> Sharing
          </Button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={18} /></Button>
        <h3 className="text-sm font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={18} /></Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const data = dayData.get(key);
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleDayClick(day)}
              className={`relative rounded-lg p-1 min-h-[72px] text-left border transition-colors
                ${isToday ? "border-primary bg-primary/5" : "border-transparent hover:border-border"}
                ${!isCurrentMonth ? "opacity-40" : ""}`}
            >
              <span className={`text-[11px] font-medium ${isToday ? "text-primary" : "text-foreground"}`}>
                {format(day, "d")}
              </span>
              <div className="space-y-0.5 mt-0.5">
                {data?.sessions.slice(0, 1).map((s: any) => (
                  <div key={s.id} className="text-[9px] px-1 py-0.5 rounded bg-primary/15 text-primary truncate">{s.title}</div>
                ))}
                {data?.tasks.slice(0, 1).map((t) => (
                  <div key={t.id} className="text-[9px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 truncate">{t.title}</div>
                ))}
                {data?.focus.slice(0, 1).map((f) => (
                  <div key={f.id} className="text-[9px] px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 truncate">{f.title}</div>
                ))}
                {((data?.sessions.length || 0) + (data?.tasks.length || 0) + (data?.focus.length || 0)) > 3 && (
                  <span className="text-[8px] text-muted-foreground">+more</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />Sessions</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Scheduled Tasks</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" />Focus Blocks</span>
      </div>

      {/* Focus Block Dialog */}
      <Dialog open={focusDialogOpen} onOpenChange={setFocusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Focus Block — {selectedDate && format(selectedDate, "MMM d, yyyy")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={newFocus.title} onChange={(e) => setNewFocus({ ...newFocus, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start</Label><Input type="time" value={newFocus.start} onChange={(e) => setNewFocus({ ...newFocus, start: e.target.value })} /></div>
              <div><Label>End</Label><Input type="time" value={newFocus.end} onChange={(e) => setNewFocus({ ...newFocus, end: e.target.value })} /></div>
            </div>
            <Button className="w-full" onClick={() => createFocusBlock.mutate()} disabled={!newFocus.start || !newFocus.end}>Add Focus Block</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Calendar Sharing</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">Control who can see your calendar. Only shared items will be visible to others — your private tasks remain private by default.</p>
          {shares.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No one has access to your calendar yet.</p>
          ) : (
            <div className="space-y-2">
              {shares.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded border border-border text-sm">
                  <span className="text-foreground">{s.shared_with_id.slice(0, 8)}…</span>
                  <div className="flex gap-1">
                    {s.can_view_sessions && <Badge variant="outline" className="text-[9px]">Sessions</Badge>}
                    {s.can_view_tasks && <Badge variant="outline" className="text-[9px]">Tasks</Badge>}
                    {s.can_view_focus && <Badge variant="outline" className="text-[9px]">Focus</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground mt-2">Sharing options can be managed from your profile settings.</p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalCalendar;
