import { useState, useMemo, useRef, useEffect, useCallback } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft, ChevronRight, Plus, CalendarDays,
  LayoutGrid, List, Clock, Trash2, Maximize2, Minimize2,
  ListTodo, User, Edit, X, Sparkles, Loader2, Check,
  Video, Link2, UserPlus, ExternalLink,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay,
  addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks,
  addDays, subDays, startOfDay, endOfDay,
  parseISO, differenceInMinutes,
} from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "session" | "task";
  color: string;
  status?: string;
  description?: string;
  clientName?: string;
  assignedName?: string;
  clientId?: string;
  meetingUrl?: string;
  meetingPlatform?: string;
  attendeeIds?: string[];
  notes?: string;
  plaudRecordingId?: string;
};

type ViewMode = "month" | "week" | "day";

type ClientProfile = { id: string; full_name: string };

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const statusColors: Record<string, string> = {
  scheduled: "hsl(var(--primary))",
  completed: "#22c55e",
  cancelled: "#ef4444",
  "no-show": "#eab308",
};

const AdminCalendar = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filters
  const [showSessions, setShowSessions] = useState(true);
  const [showTasks, setShowTasks] = useState(true);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<"session" | "task">("session");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // New session form
  const [newSession, setNewSession] = useState({ title: "", client_id: "", time: "09:00", duration_minutes: 60, description: "", meeting_platform: "", meeting_url: "", attendee_ids: [] as string[] });
  // New task form
  const [newTask, setNewTask] = useState({ title: "", assigned_to: "", description: "" });
  // Edit session form
  const [editForm, setEditForm] = useState({ title: "", session_date: "", session_time: "09:00", duration_minutes: 60, description: "", status: "scheduled", meeting_platform: "", meeting_url: "", attendee_ids: [] as string[] });
  const [editSessionId, setEditSessionId] = useState("");

  // Drag state
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // AI Scheduler
  const [aiScheduling, setAiScheduling] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ session_id: string; suggested_time: string; title: string; client_name?: string; duration_minutes: number }>>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Date range
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

  // Fetch clients & staff
  const { data: clients = [] } = useQuery({
    queryKey: ["all_profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name");
      return (data || []) as ClientProfile[];
    },
  });

  const { data: staffMembers = [] } = useQuery({
    queryKey: ["staff_profiles"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").in("role", ["admin", "team_member"]);
      if (!roles?.length) return [];
      const ids = roles.map((r) => r.user_id);
      const { data } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      return (data || []) as ClientProfile[];
    },
  });

  // Fetch sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ["team_sessions", rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from("sessions").select("*")
        .gte("session_date", rangeStart.toISOString())
        .lte("session_date", rangeEnd.toISOString())
        .order("session_date", { ascending: true });
      return data || [];
    },
  });

  // Fetch staff todos
  const { data: todos = [] } = useQuery({
    queryKey: ["team_todos", rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from("staff_todos").select("*")
        .eq("is_completed", false);
      return data || [];
    },
  });

  const nameMap = useMemo(() => {
    const m = new Map<string, string>();
    clients.forEach((c) => m.set(c.id, c.full_name || "Unknown"));
    return m;
  }, [clients]);

  // Build unified events
  const events = useMemo(() => {
    const result: CalendarEvent[] = [];
    if (showSessions) {
      sessions.forEach((s: any) => {
        const start = parseISO(s.session_date);
        result.push({
          id: s.id, title: s.title, start,
          end: new Date(start.getTime() + (s.duration_minutes || 60) * 60000),
          type: "session", color: statusColors[s.status] || statusColors.scheduled,
          status: s.status, description: s.description,
          clientName: nameMap.get(s.client_id) || "Unknown",
          clientId: s.client_id,
          meetingUrl: s.meeting_url || "",
          meetingPlatform: s.meeting_platform || "",
          attendeeIds: s.attendee_ids || [],
          notes: s.notes || "",
          plaudRecordingId: s.plaud_recording_id || "",
        });
      });
    }
    if (showTasks) {
      todos.forEach((t: any) => {
        if (!t.due_date) return;
        const d = new Date(t.due_date + "T09:00:00");
        result.push({
          id: t.id, title: t.title, start: d, end: new Date(d.getTime() + 30 * 60000),
          type: "task", color: "#3b82f6",
          description: t.description,
          assignedName: nameMap.get(t.assigned_to) || "Unknown",
        });
      });
    }
    return result;
  }, [sessions, todos, showSessions, showTasks, nameMap]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const key = format(e.start, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  // Navigation
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

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", event.id);
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = "0.5";
  };
  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = "1";
    setDraggedEvent(null);
    setDropTarget(null);
  };
  const handleDragOver = (e: React.DragEvent, cellKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(cellKey);
  };
  const handleDragLeave = () => setDropTarget(null);

  const rescheduleEvent = useMutation({
    mutationFn: async ({ event, newStart }: { event: CalendarEvent; newStart: Date }) => {
      if (event.type === "session") {
        const { error } = await supabase.from("sessions").update({ session_date: newStart.toISOString() }).eq("id", event.id);
        if (error) throw error;
      } else if (event.type === "task") {
        const { error } = await supabase.from("staff_todos").update({ due_date: format(newStart, "yyyy-MM-dd") }).eq("id", event.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team_sessions"] });
      qc.invalidateQueries({ queryKey: ["team_todos"] });
      toast.success("Event rescheduled");
    },
    onError: () => toast.error("Failed to reschedule"),
  });

  const handleDrop = (e: React.DragEvent, day: Date, hour?: number) => {
    e.preventDefault(); e.stopPropagation(); setDropTarget(null);
    if (!draggedEvent) return;
    const newStart = new Date(day);
    if (hour !== undefined) {
      newStart.setHours(hour, 0, 0, 0);
    } else {
      newStart.setHours(draggedEvent.start.getHours(), draggedEvent.start.getMinutes(), 0, 0);
    }
    if (draggedEvent.start.getTime() === newStart.getTime()) return;
    rescheduleEvent.mutate({ event: draggedEvent, newStart });
    setDraggedEvent(null);
  };

  // CRUD
  const handleCreateSession = async () => {
    if (!newSession.title || !newSession.client_id || !selectedDate) return;
    const dateTime = `${format(selectedDate, "yyyy-MM-dd")}T${newSession.time}:00`;
    const { error } = await supabase.from("sessions").insert({
      title: newSession.title, client_id: newSession.client_id, session_date: dateTime,
      duration_minutes: newSession.duration_minutes, description: newSession.description || null,
      meeting_platform: newSession.meeting_platform || null,
      meeting_url: newSession.meeting_url || null,
      attendee_ids: newSession.attendee_ids,
    } as any);
    if (error) toast.error("Failed to create session");
    else {
      // Send invite notifications to attendees
      for (const aid of newSession.attendee_ids) {
        await supabase.rpc("create_notification", {
          _user_id: aid, _type: "session", _title: "Session Invite",
          _message: `You've been invited to "${newSession.title}" on ${format(selectedDate, "MMM d")} at ${newSession.time}`,
          _link: "/admin/calendar",
        });
      }
      toast.success("Session created");
      setCreateOpen(false);
      setNewSession({ title: "", client_id: "", time: "09:00", duration_minutes: 60, description: "", meeting_platform: "", meeting_url: "", attendee_ids: [] });
      qc.invalidateQueries({ queryKey: ["team_sessions"] });
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.assigned_to || !user || !selectedDate) return;
    const { error } = await supabase.from("staff_todos").insert({
      title: newTask.title, assigned_to: newTask.assigned_to, created_by: user.id,
      due_date: format(selectedDate, "yyyy-MM-dd"), description: newTask.description || "",
    });
    if (error) toast.error("Failed to create task");
    else {
      toast.success("Task created");
      setCreateOpen(false);
      setNewTask({ title: "", assigned_to: "", description: "" });
      qc.invalidateQueries({ queryKey: ["team_todos"] });
    }
  };

  const handleDelete = async (event: CalendarEvent) => {
    if (event.type === "session") {
      const { error } = await supabase.from("sessions").delete().eq("id", event.id);
      if (error) toast.error("Failed to delete");
      else { toast.success("Session deleted"); qc.invalidateQueries({ queryKey: ["team_sessions"] }); }
    }
    setDetailOpen(false);
  };

  const handleStatusChange = async (sessionId: string, status: string) => {
    await supabase.from("sessions").update({ status }).eq("id", sessionId);
    qc.invalidateQueries({ queryKey: ["team_sessions"] });
  };

  const openEdit = (event: CalendarEvent) => {
    if (event.type !== "session") return;
    setEditSessionId(event.id);
    setEditForm({
      title: event.title,
      session_date: format(event.start, "yyyy-MM-dd"),
      session_time: format(event.start, "HH:mm"),
      duration_minutes: differenceInMinutes(event.end, event.start),
      description: event.description || "",
      status: event.status || "scheduled",
      meeting_platform: event.meetingPlatform || "",
      meeting_url: event.meetingUrl || "",
      attendee_ids: event.attendeeIds || [],
    });
    setEditOpen(true);
    setDetailOpen(false);
  };

  const handleUpdate = async () => {
    const dateTime = `${editForm.session_date}T${editForm.session_time}:00`;
    const { error } = await supabase.from("sessions").update({
      title: editForm.title, session_date: dateTime, duration_minutes: editForm.duration_minutes,
      description: editForm.description || null, status: editForm.status,
      meeting_platform: editForm.meeting_platform || null,
      meeting_url: editForm.meeting_url || null,
      attendee_ids: editForm.attendee_ids,
    } as any).eq("id", editSessionId);
    if (error) toast.error("Failed to update");
    else { toast.success("Session updated"); setEditOpen(false); qc.invalidateQueries({ queryKey: ["team_sessions"] }); }
  };

  // AI Auto-Scheduler
  const handleAiSchedule = async () => {
    setAiScheduling(true);
    try {
      const targetDate = format(currentDate, "yyyy-MM-dd");
      // Get sessions for the current day
      const dayStart = startOfDay(currentDate).toISOString();
      const dayEnd = endOfDay(currentDate).toISOString();

      const { data: daySessions } = await supabase
        .from("sessions")
        .select("*")
        .gte("session_date", dayStart)
        .lte("session_date", dayEnd);

      const existingSessions = (daySessions || [])
        .filter((s: any) => s.status === "scheduled")
        .map((s: any) => ({
          id: s.id,
          title: s.title,
          time: format(parseISO(s.session_date), "HH:mm"),
          duration_minutes: s.duration_minutes,
          client_id: s.client_id,
          client_name: nameMap.get(s.client_id) || "Unknown",
        }));

      // Get unscheduled sessions (sessions without a specific time, or staff todos that need scheduling)
      const { data: unscheduledTodos } = await supabase
        .from("staff_todos")
        .select("*")
        .eq("is_completed", false)
        .or(`due_date.is.null,due_date.eq.${targetDate}`);

      const unscheduledSessions = (unscheduledTodos || []).map((t: any) => ({
        session_id: t.id,
        title: t.title,
        duration_minutes: 30,
        assigned_to: t.assigned_to,
        assigned_name: nameMap.get(t.assigned_to) || "Unknown",
      }));

      if (unscheduledSessions.length === 0) {
        toast.info("No unscheduled tasks to auto-schedule for this day");
        setAiScheduling(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("ai-schedule", {
        body: {
          mode: "team",
          date: targetDate,
          unscheduled_sessions: unscheduledSessions,
          existing_sessions: existingSessions,
          clients: clients.map((c) => ({ id: c.id, name: c.full_name })),
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setAiScheduling(false);
        return;
      }

      setAiSuggestions(data.scheduled || []);
      setAiSummary(data.summary || "Schedule optimized");
      setAiDialogOpen(true);
    } catch (err: any) {
      console.error("AI schedule error:", err);
      toast.error("Failed to generate schedule suggestions");
    } finally {
      setAiScheduling(false);
    }
  };

  const applyAiSuggestion = async (suggestion: typeof aiSuggestions[0]) => {
    const dateTime = `${format(currentDate, "yyyy-MM-dd")}T${suggestion.suggested_time}:00`;
    // Update the staff todo's due_date
    const { error } = await supabase
      .from("staff_todos")
      .update({ due_date: format(currentDate, "yyyy-MM-dd") })
      .eq("id", suggestion.session_id);
    if (error) {
      toast.error("Failed to apply suggestion");
    } else {
      toast.success(`Scheduled "${suggestion.title}" at ${suggestion.suggested_time}`);
      qc.invalidateQueries({ queryKey: ["team_todos"] });
    }
  };

  const applyAllAiSuggestions = async () => {
    for (const s of aiSuggestions) {
      await applyAiSuggestion(s);
    }
    setAiDialogOpen(false);
    toast.success("All suggestions applied!");
  };

  // Click handlers
  const handleDayClick = (day: Date, hour?: number) => {
    setSelectedDate(day);
    if (hour !== undefined) {
      setNewSession((p) => ({ ...p, time: `${hour.toString().padStart(2, "0")}:00` }));
    }
    setCreateType("session");
    setCreateOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setDetailOpen(true);
  };

  // Scroll to current hour
  useEffect(() => {
    if ((viewMode === "week" || viewMode === "day") && scrollRef.current) {
      const offset = Math.max(0, (new Date().getHours() - 1) * 64);
      scrollRef.current.scrollTop = offset;
    }
  }, [viewMode]);

  const today = new Date();
  const calendarHeight = isFullscreen ? "h-[calc(100vh-200px)]" : "max-h-[600px]";

  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-background overflow-auto pt-4 px-4 pb-4"
    : "min-h-screen bg-background";

  return (
    <div className={containerClass}>
      {!isFullscreen && <Header />}
      <section className={isFullscreen ? "" : "pt-28 pb-20"}>
        <div className={isFullscreen ? "max-w-full" : "container max-w-6xl"}>
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h1 className={`${isFullscreen ? "text-xl" : "text-2xl md:text-3xl"} font-serif text-foreground`}>Team Calendar</h1>
              <p className="text-sm text-muted-foreground font-light">Sessions, tasks & scheduling for the whole team</p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList className="h-8">
                  <TabsTrigger value="month" className="text-xs gap-1 px-2"><LayoutGrid size={12} /> Month</TabsTrigger>
                  <TabsTrigger value="week" className="text-xs gap-1 px-2"><CalendarDays size={12} /> Week</TabsTrigger>
                  <TabsTrigger value="day" className="text-xs gap-1 px-2"><List size={12} /> Day</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs h-8">Today</Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAiSchedule}
                disabled={aiScheduling}
                className="h-8 gap-1 text-xs border-primary/30 hover:bg-primary/10"
              >
                {aiScheduling ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                AI Schedule
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="h-8">
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </Button>
              <Button size="sm" className="h-8 gap-1" onClick={() => { setSelectedDate(new Date()); setCreateType("session"); setCreateOpen(true); }}>
                <Plus size={14} /> New
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 text-xs mb-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Switch checked={showSessions} onCheckedChange={setShowSessions} className="scale-75" />
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors.scheduled }} />Sessions</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Switch checked={showTasks} onCheckedChange={setShowTasks} className="scale-75" />
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Tasks</span>
            </label>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ChevronLeft size={18} /></Button>
            <h3 className="text-sm font-semibold">{headerLabel()}</h3>
            <Button variant="ghost" size="icon" onClick={() => navigate(1)}><ChevronRight size={18} /></Button>
          </div>

          {/* ===== MONTH VIEW ===== */}
          {viewMode === "month" && (
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border/30">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {days.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const dayEvents = eventsByDay.get(key) || [];
                  const isT = isSameDay(day, today);
                  const isCur = isSameMonth(day, currentDate);
                  const isOver = dropTarget === `month-${key}`;
                  const maxEv = isFullscreen ? 5 : 3;
                  return (
                    <div
                      key={key}
                      onClick={() => handleDayClick(day)}
                      onDragOver={(e) => handleDragOver(e, `month-${key}`)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day)}
                      className={`min-h-[90px] border-b border-r border-border/20 p-1.5 cursor-pointer transition-colors
                        ${isT ? "bg-primary/5" : "hover:bg-muted/30"}
                        ${!isCur ? "opacity-40" : ""}
                        ${isOver ? "bg-primary/10" : ""}`}
                    >
                      <span className={`text-[11px] font-medium ${isT ? "text-primary" : "text-muted-foreground"}`}>{format(day, "d")}</span>
                      <div className="mt-0.5 space-y-0.5">
                        {dayEvents.slice(0, maxEv).map((ev) => (
                          <div
                            key={ev.id} draggable
                            onDragStart={(e) => handleDragStart(e, ev)}
                            onDragEnd={handleDragEnd}
                            onClick={(e) => handleEventClick(e, ev)}
                            className="text-[9px] px-1 py-0.5 rounded truncate cursor-grab active:cursor-grabbing hover:opacity-80"
                            style={{ backgroundColor: `${ev.color}20`, color: ev.color }}
                          >
                            {ev.type === "session" && format(ev.start, "HH:mm") + " "}{ev.clientName || ev.title}
                          </div>
                        ))}
                        {dayEvents.length > maxEv && (
                          <span className="text-[8px] text-muted-foreground">+{dayEvents.length - maxEv} more</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== WEEK VIEW ===== */}
          {viewMode === "week" && (
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
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
              <div ref={scrollRef} className={`overflow-y-auto ${calendarHeight}`}>
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
                            key={cellKey}
                            className={`h-16 border-b border-l border-border/30 relative cursor-pointer transition-colors
                              ${isOver ? "bg-primary/10" : "hover:bg-muted/20"}`}
                            onClick={() => handleDayClick(day, hour)}
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
                                  key={ev.id} draggable
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
                                  {ev.clientName || ev.title}
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

          {/* ===== DAY VIEW ===== */}
          {viewMode === "day" && (
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <div ref={scrollRef} className={`overflow-y-auto ${calendarHeight}`}>
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
                      onClick={() => handleDayClick(currentDate, hour)}
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
                              key={ev.id} draggable
                              onDragStart={(e) => handleDragStart(e, ev)}
                              onDragEnd={handleDragEnd}
                              onClick={(e) => handleEventClick(e, ev)}
                              className="rounded px-2 py-1.5 text-xs font-medium cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity"
                              style={{
                                backgroundColor: `${ev.color}20`, color: ev.color,
                                borderLeft: `3px solid ${ev.color}`,
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span>{ev.title}</span>
                                {ev.clientName && <span className="text-[10px] opacity-70">— {ev.clientName}</span>}
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
        </div>
      </section>
      {!isFullscreen && <Footer />}

      {/* ===== CREATE DIALOG ===== */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={16} /> New — {selectedDate && format(selectedDate, "MMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant={createType === "session" ? "default" : "outline"} size="sm" onClick={() => setCreateType("session")} className="text-xs gap-1"><Clock size={12} /> Session</Button>
              <Button variant={createType === "task" ? "default" : "outline"} size="sm" onClick={() => setCreateType("task")} className="text-xs gap-1"><ListTodo size={12} /> Task</Button>
            </div>

            {createType === "session" ? (
              <>
                <div><Label>Title</Label><Input value={newSession.title} onChange={(e) => setNewSession({ ...newSession, title: e.target.value })} placeholder="Session title" /></div>
                <div>
                  <Label>Client</Label>
                  <Select value={newSession.client_id} onValueChange={(v) => setNewSession({ ...newSession, client_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Time</Label><Input type="time" value={newSession.time} onChange={(e) => setNewSession({ ...newSession, time: e.target.value })} /></div>
                  <div><Label>Duration (min)</Label><Input type="number" value={newSession.duration_minutes} onChange={(e) => setNewSession({ ...newSession, duration_minutes: parseInt(e.target.value) || 60 })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="flex items-center gap-1"><Video size={12} /> Meeting Platform</Label>
                    <Select value={newSession.meeting_platform || "none"} onValueChange={(v) => setNewSession({ ...newSession, meeting_platform: v === "none" ? "" : v })}>
                      <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="teams">Microsoft Teams</SelectItem>
                        <SelectItem value="google-meet">Google Meet</SelectItem>
                        <SelectItem value="in-person">In Person</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="flex items-center gap-1"><Link2 size={12} /> Meeting Link</Label>
                    <Input value={newSession.meeting_url} onChange={(e) => setNewSession({ ...newSession, meeting_url: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-1 mb-1.5"><UserPlus size={12} /> Invite Team Members</Label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-[120px] overflow-y-auto border border-border/50 rounded-lg p-2">
                    {staffMembers.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                        <Checkbox
                          checked={newSession.attendee_ids.includes(s.id)}
                          onCheckedChange={(checked) => {
                            setNewSession((prev) => ({
                              ...prev,
                              attendee_ids: checked
                                ? [...prev.attendee_ids, s.id]
                                : prev.attendee_ids.filter((id) => id !== s.id),
                            }));
                          }}
                        />
                        {s.full_name}
                      </label>
                    ))}
                  </div>
                </div>
                <div><Label>Notes</Label><Textarea value={newSession.description} onChange={(e) => setNewSession({ ...newSession, description: e.target.value })} placeholder="Optional" rows={2} /></div>
                <Button className="w-full" onClick={handleCreateSession}>Create Session</Button>
              </>
            ) : (
              <>
                <div><Label>Title</Label><Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title" /></div>
                <div>
                  <Label>Assign To</Label>
                  <Select value={newTask.assigned_to} onValueChange={(v) => setNewTask({ ...newTask, assigned_to: v })}>
                    <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                    <SelectContent>{staffMembers.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Description</Label><Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Optional" rows={2} /></div>
                <Button className="w-full" onClick={handleCreateTask}>Create Task</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== EVENT DETAIL DIALOG ===== */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: selectedEvent?.color }}>
              {selectedEvent?.type === "session" ? "📅" : "✅"} {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={14} />
                {format(selectedEvent.start, "HH:mm")} – {format(selectedEvent.end, "HH:mm")}
                <span className="text-xs">({differenceInMinutes(selectedEvent.end, selectedEvent.start)} min)</span>
              </div>
              {selectedEvent.clientName && (
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-muted-foreground" /> {selectedEvent.clientName}
                </div>
              )}
              {selectedEvent.assignedName && (
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-muted-foreground" /> Assigned to: {selectedEvent.assignedName}
                </div>
              )}
              <Badge variant="outline" className="capitalize">{selectedEvent.type}</Badge>
              {selectedEvent.status && (
                <>
                  <Badge variant="secondary" className="capitalize ml-1">{selectedEvent.status}</Badge>
                  <div className="mt-2">
                    <Label className="text-xs">Change Status</Label>
                    <Select value={selectedEvent.status} onValueChange={(v) => { handleStatusChange(selectedEvent.id, v); setSelectedEvent({ ...selectedEvent, status: v }); }}>
                      <SelectTrigger className="w-full text-xs h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no-show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {selectedEvent.meetingPlatform && (
                <div className="flex items-center gap-2 text-sm">
                  <Video size={14} className="text-muted-foreground" />
                  <span className="capitalize">{selectedEvent.meetingPlatform.replace("-", " ")}</span>
                  {selectedEvent.meetingUrl && (
                    <a href={selectedEvent.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                      <ExternalLink size={10} /> Join
                    </a>
                  )}
                </div>
              )}
              {selectedEvent.attendeeIds && selectedEvent.attendeeIds.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground flex items-center gap-1 mb-1"><UserPlus size={14} /> Attendees:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedEvent.attendeeIds.map((id) => (
                      <Badge key={id} variant="secondary" className="text-xs">{nameMap.get(id) || "Unknown"}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedEvent.description && <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>}
              {selectedEvent.notes && (
                <div className="mt-2 border-t border-border pt-3">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">📝 Session Notes</Label>
                  <div className="bg-muted/50 rounded p-3 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto font-light">
                    {selectedEvent.notes}
                  </div>
                  {selectedEvent.plaudRecordingId && (
                    <p className="text-[10px] text-muted-foreground mt-1">Plaud Recording: {selectedEvent.plaudRecordingId}</p>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {selectedEvent.type === "session" && (
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(selectedEvent)}>
                    <Edit size={14} /> Edit
                  </Button>
                )}
                <Button variant="destructive" size="sm" className="gap-1" onClick={() => handleDelete(selectedEvent)}>
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== EDIT SESSION DIALOG ===== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Edit Session</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date</Label><Input type="date" value={editForm.session_date} onChange={(e) => setEditForm({ ...editForm, session_date: e.target.value })} /></div>
              <div><Label>Time</Label><Input type="time" value={editForm.session_time} onChange={(e) => setEditForm({ ...editForm, session_time: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Duration (min)</Label><Input type="number" value={editForm.duration_minutes} onChange={(e) => setEditForm({ ...editForm, duration_minutes: parseInt(e.target.value) || 60 })} /></div>
              <div>
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="flex items-center gap-1"><Video size={12} /> Platform</Label>
                <Select value={editForm.meeting_platform || "none"} onValueChange={(v) => setEditForm({ ...editForm, meeting_platform: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="google-meet">Google Meet</SelectItem>
                    <SelectItem value="in-person">In Person</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="flex items-center gap-1"><Link2 size={12} /> Meeting Link</Label>
                <Input value={editForm.meeting_url} onChange={(e) => setEditForm({ ...editForm, meeting_url: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-1 mb-1.5"><UserPlus size={12} /> Attendees</Label>
              <div className="grid grid-cols-2 gap-1.5 max-h-[100px] overflow-y-auto border border-border/50 rounded-lg p-2">
                {staffMembers.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                    <Checkbox
                      checked={editForm.attendee_ids.includes(s.id)}
                      onCheckedChange={(checked) => {
                        setEditForm((prev) => ({
                          ...prev,
                          attendee_ids: checked
                            ? [...prev.attendee_ids, s.id]
                            : prev.attendee_ids.filter((id) => id !== s.id),
                        }));
                      }}
                    />
                    {s.full_name}
                  </label>
                ))}
              </div>
            </div>
            <div><Label>Notes</Label><Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} /></div>
            <Button className="w-full" onClick={handleUpdate}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== AI SUGGESTIONS DIALOG ===== */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" /> AI Schedule Suggestions
            </DialogTitle>
          </DialogHeader>
          {aiSummary && (
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">{aiSummary}</p>
          )}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {aiSuggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No suggestions generated</p>
            ) : (
              aiSuggestions.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">{s.suggested_time}</Badge>
                      <span className="text-sm font-medium">{s.title}</span>
                    </div>
                    {s.client_name && <p className="text-xs text-muted-foreground mt-0.5">{s.client_name} · {s.duration_minutes}min</p>}
                    {!s.client_name && <p className="text-xs text-muted-foreground mt-0.5">{s.duration_minutes}min</p>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => applyAiSuggestion(s)} className="h-7 gap-1 text-xs">
                    <Check size={12} /> Apply
                  </Button>
                </div>
              ))
            )}
          </div>
          {aiSuggestions.length > 0 && (
            <Button className="w-full gap-2" onClick={applyAllAiSuggestions}>
              <Check size={14} /> Apply All Suggestions
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCalendar;
