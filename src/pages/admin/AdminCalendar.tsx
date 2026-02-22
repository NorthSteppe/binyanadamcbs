import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface ClientProfile {
  id: string;
  full_name: string;
}

const AdminCalendar = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    client_id: "",
    session_date: "",
    session_time: "09:00",
    duration_minutes: 60,
    description: "",
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
      // Fetch client names
      const clientIds = [...new Set(data.map((s) => s.client_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", clientIds);
      const nameMap = Object.fromEntries((profiles || []).map((p) => [p.id, p.full_name]));
      setSessions(data.map((s) => ({ ...s, client_name: nameMap[s.client_id] || "Unknown" })));
    }
  };

  const fetchClients = async () => {
    const { data } = await supabase.from("profiles").select("id, full_name");
    if (data) setClients(data);
  };

  useEffect(() => {
    fetchSessions();
  }, [currentMonth]);

  useEffect(() => {
    fetchClients();
  }, []);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDay = startOfMonth(currentMonth).getDay();

  const sessionsForDay = (date: Date) => sessions.filter((s) => isSameDay(new Date(s.session_date), date));

  const handleCreate = async () => {
    if (!newSession.title || !newSession.client_id || !newSession.session_date) return;
    const dateTime = `${newSession.session_date}T${newSession.session_time}:00`;
    const { error } = await supabase.from("sessions").insert({
      title: newSession.title,
      client_id: newSession.client_id,
      session_date: dateTime,
      duration_minutes: newSession.duration_minutes,
      description: newSession.description || null,
    });
    if (error) {
      toast.error("Failed to create session");
    } else {
      toast.success("Session created");
      setDialogOpen(false);
      setNewSession({ title: "", client_id: "", session_date: "", session_time: "09:00", duration_minutes: 60, description: "" });
      fetchSessions();
    }
  };

  const handleStatusChange = async (sessionId: string, status: string) => {
    await supabase.from("sessions").update({ status }).eq("id", sessionId);
    fetchSessions();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Team Calendar</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage sessions and appointments</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full gap-2">
                  <Plus size={16} /> New Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input placeholder="Session title" value={newSession.title} onChange={(e) => setNewSession({ ...newSession, title: e.target.value })} />
                  <Select value={newSession.client_id} onValueChange={(v) => setNewSession({ ...newSession, client_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                      ))}
                    </SelectContent>
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

          {/* Calendar header */}
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={18} /></Button>
              <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={18} /></Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border/30">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-3">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border/20 bg-muted/20" />
              ))}
              {days.map((day) => {
                const daySessions = sessionsForDay(day);
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(isSameDay(day, selectedDate!) ? null : day)}
                    className={`min-h-[100px] border-b border-r border-border/20 p-2 cursor-pointer transition-colors hover:bg-primary/5 ${
                      isToday(day) ? "bg-primary/10" : ""
                    } ${selectedDate && isSameDay(day, selectedDate) ? "ring-2 ring-primary ring-inset" : ""}`}
                  >
                    <span className={`text-xs font-medium ${isToday(day) ? "text-primary" : "text-muted-foreground"}`}>
                      {format(day, "d")}
                    </span>
                    <div className="mt-1 space-y-1">
                      {daySessions.slice(0, 3).map((s) => (
                        <div key={s.id} className="text-[10px] bg-primary/15 text-primary rounded px-1.5 py-0.5 truncate font-medium">
                          {format(new Date(s.session_date), "HH:mm")} {s.client_name}
                        </div>
                      ))}
                      {daySessions.length > 3 && (
                        <div className="text-[10px] text-muted-foreground">+{daySessions.length - 3} more</div>
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
              {sessionsForDay(selectedDate).length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {sessionsForDay(selectedDate).map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-background rounded-xl p-4 border border-border/30">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center bg-primary/10 rounded-lg px-3 py-2">
                          <Clock size={14} className="text-primary" />
                          <span className="text-xs font-semibold text-primary mt-1">{format(new Date(s.session_date), "HH:mm")}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{s.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><User size={12} /> {s.client_name} · {s.duration_minutes} min</p>
                        </div>
                      </div>
                      <Select value={s.status} onValueChange={(v) => handleStatusChange(s.id, v)}>
                        <SelectTrigger className="w-[130px] text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no-show">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdminCalendar;
