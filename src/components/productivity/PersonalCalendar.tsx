import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft, ChevronRight, Plus, Shield, CalendarDays,
  LayoutGrid, List, Clock, Trash2, Edit2, Eye, ListTodo
} from "lucide-react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay,
  addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks,
  addDays, subDays, eachHourOfInterval, startOfDay, endOfDay,
  isToday as isDateToday, parseISO, differenceInMinutes, setHours, setMinutes
} from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "session" | "task" | "focus";
  color: string;
  priority?: string;
  status?: string;
  description?: string;
};

type ViewMode = "month" | "week" | "day";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const PersonalCalendar = () => {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const [showFocus, setShowFocus] = useState(true);
  const [showSessions, setShowSessions] = useState(true);
  const [createType, setCreateType] = useState<"focus" | "task">("focus");
  const [newEvent, setNewEvent] = useState({ title: "", start: "09:00", end: "10:00", description: "", priority: "medium" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // Date range based on view
  const { rangeStart, rangeEnd } = useMemo(() => {
    if (viewMode === "month") {
      const ms = startOfMonth(currentDate);
      const me = endOfMonth(currentDate);
      return { rangeStart: startOfWeek(ms, { weekStartsOn: 1 }), rangeEnd: endOfWeek(me, { weekStartsOn: 1 }) };
    }
    if (viewMode === "week") {
      return { rangeStart: startOfWeek(currentDate, { weekStartsOn: 1 }), rangeEnd: endOfWeek(currentDate, { weekStartsOn: 1 }) };
    }
    return { rangeStart: startOfDay(currentDate), rangeEnd: endOfDay(currentDate) };
  }, [currentDate, viewMode]);

  const days = useMemo(() => eachDayOfInterval({ start: rangeStart, end: rangeEnd }), [rangeStart, rangeEnd]);

  // Queries
  const { data: focusBlocks = [] } = useQuery({
    queryKey: ["focus_blocks", rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("focus_blocks").select("*")
        .gte("start_time", rangeStart.toISOString())
        .lte("start_time", rangeEnd.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const { data: scheduledTasks = [] } = useQuery({
    queryKey: ["scheduled_tasks", rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_tasks")
        .select("id, title, description, scheduled_start, scheduled_end, priority, status, due_date, estimated_minutes, is_completed")
        .gte("due_date", rangeStart.toISOString())
        .lte("due_date", rangeEnd.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!session && showTasks,
  });

  const { data: scheduledTasksWithTime = [] } = useQuery({
    queryKey: ["scheduled_tasks_time", rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_tasks")
        .select("id, title, description, scheduled_start, scheduled_end, priority, status, is_completed")
        .not("scheduled_start", "is", null)
        .gte("scheduled_start", rangeStart.toISOString())
        .lte("scheduled_start", rangeEnd.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!session && showTasks,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["my_sessions", rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, title, session_date, status, duration_minutes, description")
        .gte("session_date", rangeStart.toISOString())
        .lte("session_date", rangeEnd.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!session && showSessions,
  });

  const { data: shares = [] } = useQuery({
    queryKey: ["calendar_shares"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_shares").select("*").eq("owner_id", session!.user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  // Build unified events
  const events = useMemo(() => {
    const result: CalendarEvent[] = [];
    if (showSessions) {
      sessions.forEach((s: any) => {
        const start = parseISO(s.session_date);
        result.push({
          id: s.id, title: s.title, start,
          end: new Date(start.getTime() + (s.duration_minutes || 60) * 60000),
          type: "session", color: "hsl(var(--primary))", status: s.status, description: s.description,
        });
      });
    }
    if (showTasks) {
      // Tasks with scheduled time
      scheduledTasksWithTime.forEach((t: any) => {
        const start = parseISO(t.scheduled_start);
        const end = t.scheduled_end ? parseISO(t.scheduled_end) : new Date(start.getTime() + 30 * 60000);
        result.push({
          id: t.id, title: t.title, start, end,
          type: "task", color: "#3b82f6", priority: t.priority, status: t.status, description: t.description,
        });
      });
      // Tasks with due_date but no scheduled time (show as all-day in month view)
      scheduledTasks.forEach((t: any) => {
        if (t.scheduled_start) return; // already added above
        if (!t.due_date) return;
        const d = parseISO(t.due_date);
        result.push({
          id: t.id, title: t.title, start: d, end: d,
          type: "task", color: "#3b82f6", priority: t.priority, status: t.status, description: t.description,
        });
      });
    }
    if (showFocus) {
      focusBlocks.forEach((fb: any) => {
        result.push({
          id: fb.id, title: fb.title, start: parseISO(fb.start_time), end: parseISO(fb.end_time),
          type: "focus", color: "#a855f7",
        });
      });
    }
    return result;
  }, [sessions, scheduledTasks, scheduledTasksWithTime, focusBlocks, showSessions, showTasks, showFocus]);

  // Events grouped by day key
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const key = format(e.start, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  // Mutations
  const createFocusBlock = useMutation({
    mutationFn: async () => {
      if (!selectedDate) return;
      const [sh, sm] = newEvent.start.split(":").map(Number);
      const [eh, em] = newEvent.end.split(":").map(Number);
      const s = new Date(selectedDate); s.setHours(sh, sm, 0, 0);
      const e = new Date(selectedDate); e.setHours(eh, em, 0, 0);
      const { error } = await supabase.from("focus_blocks").insert({
        user_id: session!.user.id, title: newEvent.title || "Focus Time",
        start_time: s.toISOString(), end_time: e.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["focus_blocks"] }); closeCreateDialog(); toast.success("Focus block added"); },
    onError: () => toast.error("Failed to add focus block"),
  });

  const createTask = useMutation({
    mutationFn: async () => {
      if (!selectedDate) return;
      const [sh, sm] = newEvent.start.split(":").map(Number);
      const [eh, em] = newEvent.end.split(":").map(Number);
      const s = new Date(selectedDate); s.setHours(sh, sm, 0, 0);
      const e = new Date(selectedDate); e.setHours(eh, em, 0, 0);
      const { error } = await supabase.from("user_tasks").insert({
        user_id: session!.user.id, title: newEvent.title || "New Task",
        description: newEvent.description, priority: newEvent.priority,
        scheduled_start: s.toISOString(), scheduled_end: e.toISOString(),
        due_date: selectedDate.toISOString(),
        estimated_minutes: differenceInMinutes(e, s),
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["scheduled_tasks"] }); qc.invalidateQueries({ queryKey: ["user_tasks"] }); closeCreateDialog(); toast.success("Task created"); },
    onError: () => toast.error("Failed to create task"),
  });

  const deleteFocusBlock = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("focus_blocks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["focus_blocks"] }); setDetailDialogOpen(false); toast.success("Deleted"); },
  });

  const rescheduleEvent = useMutation({
    mutationFn: async ({ event, newStart }: { event: CalendarEvent; newStart: Date }) => {
      const duration = differenceInMinutes(event.end, event.start);
      const newEnd = new Date(newStart.getTime() + duration * 60000);
      if (event.type === "focus") {
        const { error } = await supabase.from("focus_blocks").update({
          start_time: newStart.toISOString(), end_time: newEnd.toISOString(),
        }).eq("id", event.id);
        if (error) throw error;
      } else if (event.type === "task") {
        const { error } = await supabase.from("user_tasks").update({
          scheduled_start: newStart.toISOString(), scheduled_end: newEnd.toISOString(),
          due_date: newStart.toISOString(),
        }).eq("id", event.id);
        if (error) throw error;
      } else if (event.type === "session") {
        const { error } = await supabase.from("sessions").update({
          session_date: newStart.toISOString(),
        }).eq("id", event.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["focus_blocks"] });
      qc.invalidateQueries({ queryKey: ["scheduled_tasks"] });
      qc.invalidateQueries({ queryKey: ["scheduled_tasks_time"] });
      qc.invalidateQueries({ queryKey: ["my_sessions"] });
      qc.invalidateQueries({ queryKey: ["user_tasks"] });
      toast.success("Event rescheduled");
    },
    onError: () => toast.error("Failed to reschedule"),
  });

  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", event.id);
    // Make ghost semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedEvent(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, cellKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(cellKey);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
    if (!draggedEvent) return;
    const newStart = new Date(day);
    newStart.setHours(hour, 0, 0, 0);
    // Don't reschedule if same time
    if (draggedEvent.start.getTime() === newStart.getTime()) return;
    rescheduleEvent.mutate({ event: draggedEvent, newStart });
    setDraggedEvent(null);
  };

  const handleMonthDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
    if (!draggedEvent) return;
    // Keep original time, change the date
    const newStart = new Date(day);
    newStart.setHours(draggedEvent.start.getHours(), draggedEvent.start.getMinutes(), 0, 0);
    if (draggedEvent.start.getTime() === newStart.getTime()) return;
    rescheduleEvent.mutate({ event: draggedEvent, newStart });
    setDraggedEvent(null);
  };

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewEvent({ title: "", start: "09:00", end: "10:00", description: "", priority: "medium" });
  };

  const navigate = (dir: 1 | -1) => {
    if (viewMode === "month") setCurrentDate(dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(dir === 1 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    else setCurrentDate(dir === 1 ? addDays(currentDate, 1) : subDays(currentDate, 1));
  };

  const headerLabel = () => {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy");
    if (viewMode === "week") return `${format(rangeStart, "MMM d")} – ${format(rangeEnd, "MMM d, yyyy")}`;
    return format(currentDate, "EEEE, MMMM d, yyyy");
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setCreateDialogOpen(true);
    setCreateType("focus");
    setNewEvent({ title: "", start: "09:00", end: "10:00", description: "", priority: "medium" });
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setDetailDialogOpen(true);
  };

  // Scroll to current hour in week/day view
  useEffect(() => {
    if ((viewMode === "week" || viewMode === "day") && scrollRef.current) {
      const now = new Date();
      const offset = Math.max(0, (now.getHours() - 1) * 64);
      scrollRef.current.scrollTop = offset;
    }
  }, [viewMode]);

  const today = new Date();

  const priorityColor = (p?: string) => {
    if (p === "urgent") return "bg-red-500";
    if (p === "high") return "bg-orange-500";
    if (p === "medium") return "bg-amber-400";
    return "bg-slate-400";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Personal Calendar</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="month" className="text-xs gap-1 px-2"><LayoutGrid size={12} /> Month</TabsTrigger>
              <TabsTrigger value="week" className="text-xs gap-1 px-2"><CalendarDays size={12} /> Week</TabsTrigger>
              <TabsTrigger value="day" className="text-xs gap-1 px-2"><List size={12} /> Day</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs">Today</Button>
          <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}><Shield size={14} /></Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Switch checked={showSessions} onCheckedChange={setShowSessions} className="scale-75" />
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />Sessions</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Switch checked={showTasks} onCheckedChange={setShowTasks} className="scale-75" />
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Tasks</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Switch checked={showFocus} onCheckedChange={setShowFocus} className="scale-75" />
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" />Focus Blocks</span>
        </label>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ChevronLeft size={18} /></Button>
        <h3 className="text-sm font-semibold">{headerLabel()}</h3>
        <Button variant="ghost" size="icon" onClick={() => navigate(1)}><ChevronRight size={18} /></Button>
      </div>

      {/* Month View */}
      {viewMode === "month" && (
        <div className="grid grid-cols-7 gap-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDay.get(key) || [];
            const isToday = isSameDay(day, today);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isOver = dropTarget === `month-${key}`;
            return (
              <motion.div
                key={key} whileHover={{ scale: 1.02 }}
                onClick={() => handleDayClick(day)}
                onDragOver={(e) => handleDragOver(e, `month-${key}`)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleMonthDrop(e, day)}
                className={`relative rounded-lg p-1 min-h-[80px] text-left border transition-colors cursor-pointer
                  ${isToday ? "border-primary bg-primary/5" : "border-transparent hover:border-border"}
                  ${!isCurrentMonth ? "opacity-40" : ""}
                  ${isOver ? "bg-primary/10 border-primary" : ""}`}
              >
                <span className={`text-[11px] font-medium ${isToday ? "text-primary" : "text-foreground"}`}>
                  {format(day, "d")}
                </span>
                <div className="space-y-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ev)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => handleEventClick(e, ev)}
                      className="text-[9px] px-1 py-0.5 rounded truncate cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: `${ev.color}20`, color: ev.color }}
                    >
                      {ev.type === "task" && ev.priority && (
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-0.5 ${priorityColor(ev.priority)}`} />
                      )}
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 3} more</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Week View */}
      {viewMode === "week" && (
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-[50px_repeat(7,1fr)] border-b border-border bg-muted/30">
            <div className="p-1" />
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={`text-center py-2 text-xs font-medium cursor-pointer hover:bg-muted/50 transition-colors
                  ${isSameDay(day, today) ? "text-primary bg-primary/5" : "text-foreground"}`}
                onClick={() => { setCurrentDate(day); setViewMode("day"); }}
              >
                <div>{format(day, "EEE")}</div>
                <div className={`text-lg font-bold ${isSameDay(day, today) ? "text-primary" : ""}`}>{format(day, "d")}</div>
              </div>
            ))}
          </div>
          {/* Time grid */}
          <div ref={scrollRef} className="max-h-[500px] overflow-y-auto">
            <div className="grid grid-cols-[50px_repeat(7,1fr)] relative">
              {HOURS.map((hour) => (
                <div key={hour} className="contents">
                  <div className="text-[10px] text-muted-foreground text-right pr-2 py-1 h-16 border-b border-border/30">
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                  {days.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const hourEvents = (eventsByDay.get(key) || []).filter((ev) => ev.start.getHours() === hour);
                    const cellKey = `week-${key}-${hour}`;
                    const isOver = dropTarget === cellKey;
                    return (
                      <div
                        key={`${key}-${hour}`}
                        className={`h-16 border-b border-l border-border/30 relative cursor-pointer transition-colors
                          ${isOver ? "bg-primary/10" : "hover:bg-muted/20"}`}
                        onClick={() => {
                          const d = new Date(day);
                          d.setHours(hour, 0, 0, 0);
                          setSelectedDate(d);
                          setNewEvent({ ...newEvent, start: `${hour.toString().padStart(2, "0")}:00`, end: `${(hour + 1).toString().padStart(2, "0")}:00` });
                          setCreateDialogOpen(true);
                        }}
                        onDragOver={(e) => handleDragOver(e, cellKey)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, day, hour)}
                      >
                        {hourEvents.map((ev) => {
                          const duration = differenceInMinutes(ev.end, ev.start);
                          const heightPx = Math.max(16, (duration / 60) * 64);
                          const topPx = (ev.start.getMinutes() / 60) * 64;
                          return (
                            <div
                              key={ev.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, ev)}
                              onDragEnd={handleDragEnd}
                              onClick={(e) => handleEventClick(e, ev)}
                              className="absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-[9px] font-medium truncate cursor-grab active:cursor-grabbing hover:opacity-80 z-10"
                              style={{
                                top: `${topPx}px`, height: `${heightPx}px`,
                                backgroundColor: `${ev.color}25`, color: ev.color,
                                borderLeft: `2px solid ${ev.color}`,
                              }}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === "day" && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div ref={scrollRef} className="max-h-[500px] overflow-y-auto">
            {HOURS.map((hour) => {
              const key = format(currentDate, "yyyy-MM-dd");
              const hourEvents = (eventsByDay.get(key) || []).filter((ev) => ev.start.getHours() === hour);
              const cellKey = `day-${key}-${hour}`;
              const isOver = dropTarget === cellKey;
              return (
                <div
                  key={hour}
                  className={`flex border-b border-border/30 min-h-[64px] cursor-pointer transition-colors
                    ${isOver ? "bg-primary/10" : "hover:bg-muted/20"}`}
                  onClick={() => {
                    const d = new Date(currentDate);
                    d.setHours(hour, 0, 0, 0);
                    setSelectedDate(d);
                    setNewEvent({ ...newEvent, start: `${hour.toString().padStart(2, "0")}:00`, end: `${(hour + 1).toString().padStart(2, "0")}:00` });
                    setCreateDialogOpen(true);
                  }}
                  onDragOver={(e) => handleDragOver(e, cellKey)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, currentDate, hour)}
                >
                  <div className="w-16 text-[11px] text-muted-foreground text-right pr-3 pt-1 flex-shrink-0">
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                  <div className="flex-1 relative py-0.5 space-y-0.5">
                    {hourEvents.map((ev) => {
                      const duration = differenceInMinutes(ev.end, ev.start);
                      return (
                        <div
                          key={ev.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, ev)}
                          onDragEnd={handleDragEnd}
                          onClick={(e) => handleEventClick(e, ev)}
                          className="rounded px-2 py-1 text-xs font-medium cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: `${ev.color}20`, color: ev.color,
                            borderLeft: `3px solid ${ev.color}`,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span>{ev.title}</span>
                            <span className="text-[10px] opacity-70">{duration}min</span>
                          </div>
                          {ev.description && <p className="text-[10px] opacity-60 mt-0.5 truncate">{ev.description}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Event Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={16} /> New Event — {selectedDate && format(selectedDate, "MMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Type</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={createType === "focus" ? "default" : "outline"} size="sm"
                  onClick={() => setCreateType("focus")} className="text-xs"
                >Focus Block</Button>
                <Button
                  variant={createType === "task" ? "default" : "outline"} size="sm"
                  onClick={() => setCreateType("task")} className="text-xs"
                >Task</Button>
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder={createType === "focus" ? "Focus Time" : "Task title"}
              />
            </div>
            {createType === "task" && (
              <>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={newEvent.priority} onValueChange={(v) => setNewEvent({ ...newEvent, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start</Label><Input type="time" value={newEvent.start} onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })} /></div>
              <div><Label>End</Label><Input type="time" value={newEvent.end} onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })} /></div>
            </div>
            <Button
              className="w-full" disabled={!newEvent.start || !newEvent.end}
              onClick={() => createType === "focus" ? createFocusBlock.mutate() : createTask.mutate()}
            >
              {createType === "focus" ? "Add Focus Block" : "Create Task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: selectedEvent?.color }}>
              {selectedEvent?.type === "session" && "📅"}
              {selectedEvent?.type === "task" && "✅"}
              {selectedEvent?.type === "focus" && "🎯"}
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={14} />
                {format(selectedEvent.start, "HH:mm")} – {format(selectedEvent.end, "HH:mm")}
                <span className="text-xs">({differenceInMinutes(selectedEvent.end, selectedEvent.start)} min)</span>
              </div>
              <Badge variant="outline" className="capitalize">{selectedEvent.type}</Badge>
              {selectedEvent.priority && (
                <Badge variant="outline" className="capitalize ml-1">{selectedEvent.priority} priority</Badge>
              )}
              {selectedEvent.status && (
                <Badge variant="secondary" className="capitalize ml-1">{selectedEvent.status}</Badge>
              )}
              {selectedEvent.description && (
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              )}
              {selectedEvent.type === "focus" && (
                <Button variant="destructive" size="sm" onClick={() => deleteFocusBlock.mutate(selectedEvent.id)}>
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Calendar Sharing</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">Control who can see your calendar. Only shared items will be visible to others.</p>
          {shares.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No one has access to your calendar yet.</p>
          ) : (
            <div className="space-y-2">
              {shares.map((s: any) => (
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalCalendar;
