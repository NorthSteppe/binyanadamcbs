import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Clock, User, Edit, Trash2, CheckCircle, XCircle, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface Session {
  id: string;
  title: string;
  session_date: string;
  duration_minutes: number;
  status: string;
  client_id: string;
  description: string | null;
  client_name?: string;
}

interface StaffTodo {
  id: string;
  title: string;
  due_date: string | null;
  is_completed: boolean;
  assigned_to: string;
  assigned_name?: string;
}

interface ClientProfile {
  id: string;
  full_name: string;
}

const AdminCalendar = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [todos, setTodos] = useState<StaffTodo[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [staffMembers, setStaffMembers] = useState<ClientProfile[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "", client_id: "", session_date: "", session_time: "09:00", duration_minutes: 60, description: "",
  });
  const [editForm, setEditForm] = useState({
    title: "", session_date: "", session_time: "09:00", duration_minutes: 60, description: "", status: "scheduled",
  });

  const fetchSessions = async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .gte("session_date", start.toISOString())
      .lte("session_date", end.toISOString())
      .order("session_date", { ascending: true });

    if (data) {
      const clientIds = [...new Set(data.map((s) => s.client_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", clientIds);
      const nameMap = Object.fromEntries((profiles || []).map((p) => [p.id, p.full_name]));
      setSessions(data.map((s) => ({ ...s, client_name: nameMap[s.client_id] || "Unknown" })));
    }
  };

  const fetchTodos = async () => {
    const { data } = await supabase.from("staff_todos").select("*").eq("is_completed", false);
    if (data) {
      const userIds = [...new Set(data.map(t => t.assigned_to))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
      const nameMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]));
      setTodos(data.map(t => ({ ...t, assigned_name: nameMap[t.assigned_to] || "Unknown" })));
    }
  };

  const fetchClients = async () => {
    const { data } = await supabase.from("profiles").select("id, full_name");
    if (data) setClients(data);
  };

  const fetchStaff = async () => {
    const { data } = await supabase.from("user_roles").select("user_id").in("role", ["admin", "team_member"]);
    if (data) {
      const ids = data.map(r => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      if (profiles) setStaffMembers(profiles);
    }
  };

  useEffect(() => { fetchSessions(); fetchTodos(); }, [currentMonth]);
  useEffect(() => { fetchClients(); fetchStaff(); }, []);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDay = startOfMonth(currentMonth).getDay();

  const sessionsForDay = (date: Date) => sessions.filter((s) => isSameDay(new Date(s.session_date), date));
  const todosForDay = (date: Date) => todos.filter((t) => t.due_date && isSameDay(new Date(t.due_date), date));

  const handleCreate = async () => {
    if (!newSession.title || !newSession.client_id || !newSession.session_date) return;
    const dateTime = `${newSession.session_date}T${newSession.session_time}:00`;
    const { error } = await supabase.from("sessions").insert({
      title: newSession.title, client_id: newSession.client_id, session_date: dateTime,
      duration_minutes: newSession.duration_minutes, description: newSession.description || null,
    });
    if (error) toast.error("Failed to create session");
    else {
      toast.success("Session created");
      setCreateOpen(false);
      setNewSession({ title: "", client_id: "", session_date: "", session_time: "09:00", duration_minutes: 60, description: "" });
      fetchSessions();
    }
  };

  const openEdit = (s: Session) => {
    const d = new Date(s.session_date);
    setEditSession(s);
    setEditForm({
      title: s.title,
      session_date: format(d, "yyyy-MM-dd"),
      session_time: format(d, "HH:mm"),
      duration_minutes: s.duration_minutes,
      description: s.description || "",
      status: s.status,
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editSession) return;
    const dateTime = `${editForm.session_date}T${editForm.session_time}:00`;
    const { error } = await supabase.from("sessions").update({
      title: editForm.title, session_date: dateTime, duration_minutes: editForm.duration_minutes,
      description: editForm.description || null, status: editForm.status,
    }).eq("id", editSession.id);
    if (error) toast.error("Failed to update session");
    else { toast.success("Session updated"); setEditOpen(false); fetchSessions(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    if (error) toast.error("Failed to delete session");
    else { toast.success("Session deleted"); fetchSessions(); }
  };

  const handleStatusChange = async (sessionId: string, status: string) => {
    await supabase.from("sessions").update({ status }).eq("id", sessionId);
    fetchSessions();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/15 text-green-700";
      case "cancelled": return "bg-red-500/15 text-red-700";
      case "no-show": return "bg-yellow-500/15 text-yellow-700";
      default: return "bg-primary/15 text-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Team Calendar</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage sessions, appointments & tasks</p>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full gap-2"><Plus size={16} /> New Session</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Session</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input placeholder="Session title" value={newSession.title} onChange={(e) => setNewSession({ ...newSession, title: e.target.value })} />
                  <Select value={newSession.client_id} onValueChange={(v) => setNewSession({ ...newSession, client_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="date" value={newSession.session_date} onChange={(e) => setNewSession({ ...newSession, session_date: e.target.value })} />
                    <Input type="time" value={newSession.session_time} onChange={(e) => setNewSession({ ...newSession, session_time: e.target.value })} />
                  </div>
                  <Select value={String(newSession.duration_minutes)} onValueChange={(v) => setNewSession({ ...newSession, duration_minutes: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                      <SelectItem value="120">120 min</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Description (optional)" value={newSession.description} onChange={(e) => setNewSession({ ...newSession, description: e.target.value })} />
                  <Button onClick={handleCreate} className="w-full rounded-full">Create Session</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Calendar */}
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={18} /></Button>
              <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={18} /></Button>
            </div>
            <div className="grid grid-cols-7 border-b border-border/30">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-3">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[110px] border-b border-r border-border/20 bg-muted/20" />
              ))}
              {days.map((day) => {
                const daySessions = sessionsForDay(day);
                const dayTodos = todosForDay(day);
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(isSameDay(day, selectedDate!) ? null : day)}
                    className={`min-h-[110px] border-b border-r border-border/20 p-2 cursor-pointer transition-colors hover:bg-primary/5 ${
                      isToday(day) ? "bg-primary/10" : ""
                    } ${selectedDate && isSameDay(day, selectedDate) ? "ring-2 ring-primary ring-inset" : ""}`}
                  >
                    <span className={`text-xs font-medium ${isToday(day) ? "text-primary" : "text-muted-foreground"}`}>
                      {format(day, "d")}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {daySessions.slice(0, 2).map((s) => (
                        <div key={s.id} className={`text-[10px] rounded px-1.5 py-0.5 truncate font-medium ${statusColor(s.status)}`}>
                          {format(new Date(s.session_date), "HH:mm")} {s.client_name}
                        </div>
                      ))}
                      {dayTodos.slice(0, 2).map((t) => (
                        <div key={t.id} className="text-[10px] bg-accent text-accent-foreground rounded px-1.5 py-0.5 truncate font-medium flex items-center gap-1">
                          <ListTodo size={8} /> {t.title}
                        </div>
                      ))}
                      {(daySessions.length + dayTodos.length) > 4 && (
                        <div className="text-[10px] text-muted-foreground">+{daySessions.length + dayTodos.length - 4} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected day detail */}
          {selectedDate && (
            <div className="mt-6 bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>

              {/* Sessions */}
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2"><Clock size={14} /> Sessions</h4>
              {sessionsForDay(selectedDate).length === 0 ? (
                <p className="text-sm text-muted-foreground mb-4">No sessions scheduled.</p>
              ) : (
                <div className="space-y-3 mb-6">
                  {sessionsForDay(selectedDate).map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-background rounded-xl p-4 border border-border/30">
                      <div className="flex items-center gap-4">
                        <div className={`flex flex-col items-center rounded-lg px-3 py-2 ${statusColor(s.status)}`}>
                          <Clock size={14} />
                          <span className="text-xs font-semibold mt-1">{format(new Date(s.session_date), "HH:mm")}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{s.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <User size={12} /> {s.client_name} · {s.duration_minutes} min
                          </p>
                          {s.description && <p className="text-xs text-muted-foreground mt-1">{s.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={s.status} onValueChange={(v) => handleStatusChange(s.id, v)}>
                          <SelectTrigger className="w-[120px] text-xs h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="no-show">No Show</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(s)}>
                          <Edit size={14} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Todos for this day */}
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2"><ListTodo size={14} /> Tasks Due</h4>
              {todosForDay(selectedDate).length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks due.</p>
              ) : (
                <div className="space-y-2">
                  {todosForDay(selectedDate).map((t) => (
                    <div key={t.id} className="flex items-center justify-between bg-background rounded-xl p-3 border border-border/30">
                      <div>
                        <p className="text-sm font-medium">{t.title}</p>
                        <p className="text-xs text-muted-foreground">Assigned to: {t.assigned_name}</p>
                      </div>
                      {t.is_completed ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <XCircle size={16} className="text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit Session Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Edit Session</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Date</Label>
                    <Input type="date" value={editForm.session_date} onChange={(e) => setEditForm({ ...editForm, session_date: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Time</Label>
                    <Input type="time" value={editForm.session_time} onChange={(e) => setEditForm({ ...editForm, session_time: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Duration</Label>
                  <Select value={String(editForm.duration_minutes)} onValueChange={(v) => setEditForm({ ...editForm, duration_minutes: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                      <SelectItem value="120">120 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
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
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdate}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdminCalendar;
