import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar, MessageSquare, BookOpen, Upload, FileText,
  CheckCircle2, ListTodo, Phone, Mail, Timer, Sparkles,
  Files, ArrowRight, TrendingUp, Bell, ChevronRight, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ClientTodo {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
  due_date: string | null;
}

interface ClientDoc {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

// ── Mock data for local preview ───────────────────────────────────────────────
const DEV_SESSIONS = [
  {
    id: "1",
    title: "CBT Session",
    session_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    duration_minutes: 50,
    status: "scheduled",
  },
  {
    id: "2",
    title: "Follow-up Review",
    session_date: new Date(Date.now() + 9 * 86400000).toISOString(),
    duration_minutes: 50,
    status: "scheduled",
  },
];
const DEV_TODOS: ClientTodo[] = [
  { id: "1", title: "Complete thought journal", description: "Write 3 entries this week", is_completed: false, due_date: new Date(Date.now() + 3 * 86400000).toISOString() },
  { id: "2", title: "Practice mindfulness (10 min daily)", description: "", is_completed: true, due_date: null },
  { id: "3", title: "Read Chapter 4 of workbook", description: "", is_completed: false, due_date: null },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

const daysUntil = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
};

// ── Floating card wrapper ─────────────────────────────────────────────────────
const FloatCard = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 22 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
    className={`bg-white/80 backdrop-blur-md border border-white/70 rounded-2xl overflow-hidden
      shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.06)]
      hover:shadow-[0_16px_48px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.08)]
      transition-shadow duration-500 ease-out
      ${className}`}
  >
    {children}
  </motion.div>
);

// ── Widget header strip ───────────────────────────────────────────────────────
const WidgetHeader = ({
  icon: Icon,
  title,
  subtitle,
  accentColor = "#6366f1",
  action,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  accentColor?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.05]">
    <div className="flex items-center gap-3">
      <div
        className="w-1 h-7 rounded-full shrink-0"
        style={{ background: accentColor }}
      />
      <Icon size={15} className="text-muted-foreground" />
      <div>
        <h3 className="text-sm font-semibold text-foreground leading-none">{title}</h3>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>(import.meta.env.DEV ? DEV_SESSIONS : []);
  const [unreadCount, setUnreadCount] = useState(import.meta.env.DEV ? 2 : 0);
  const [todos, setTodos] = useState<ClientTodo[]>(import.meta.env.DEV ? DEV_TODOS : []);
  const [documents, setDocuments] = useState<ClientDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const portalT = (t as any).portal || {};
  const firstName = profile?.full_name?.split(" ")[0] || (import.meta.env.DEV ? "Adam" : "");

  useEffect(() => {
    if (!user || import.meta.env.DEV) return;
    supabase.from("sessions").select("*").eq("client_id", user.id)
      .gte("session_date", new Date().toISOString()).order("session_date", { ascending: true }).limit(3)
      .then(({ data }) => { if (data) setUpcomingSessions(data); });
    supabase.from("messages").select("id", { count: "exact" }).eq("recipient_id", user.id).eq("read", false)
      .then(({ count }) => { if (count) setUnreadCount(count); });
    supabase.from("client_todos").select("*").eq("client_id", user.id).order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setTodos(data as ClientTodo[]); });
    supabase.from("client_documents").select("*").eq("client_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setDocuments(data as ClientDoc[]); });
  }, [user]);

  const toggleTodo = async (todo: ClientTodo) => {
    if (import.meta.env.DEV) {
      setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t));
      return;
    }
    const { error } = await supabase.from("client_todos").update({ is_completed: !todo.is_completed }).eq("id", todo.id);
    if (!error) setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);
    const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: "Invalid file type", description: `"${file.name}" is not allowed.`, variant: "destructive" });
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: `"${file.name}" exceeds 10 MB.`, variant: "destructive" });
        continue;
      }
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("client-documents").upload(filePath, file);
      if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); continue; }
      await supabase.from("client_documents").insert({ client_id: user.id, file_name: file.name, file_url: filePath, file_type: file.type, uploaded_by: user.id });
    }
    const { data } = await supabase.from("client_documents").select("*").eq("client_id", user.id).order("created_at", { ascending: false });
    if (data) setDocuments(data as ClientDoc[]);
    setUploading(false);
    toast({ title: "Uploaded successfully" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteDocument = async (doc: ClientDoc) => {
    const { error: storageErr } = await supabase.storage.from("client-documents").remove([doc.file_url]);
    if (storageErr) { toast({ title: "Delete failed", description: storageErr.message, variant: "destructive" }); return; }
    await supabase.from("client_documents").delete().eq("id", doc.id);
    setDocuments(prev => prev.filter(d => d.id !== doc.id));
    toast({ title: "Document removed" });
  };

  const completedTasks = todos.filter(t => t.is_completed).length;
  const totalTasks = todos.length;
  const taskProgress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  const nextSession = upcomingSessions[0];
  const nextSessionDays = nextSession ? daysUntil(nextSession.session_date) : null;

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          repeating-linear-gradient(
            82deg,
            transparent 0px,
            transparent 1px,
            rgba(255,255,255,0.028) 1px,
            rgba(255,255,255,0.028) 1.5px,
            transparent 1.5px,
            transparent 4px
          ),
          repeating-linear-gradient(
            79deg,
            transparent 0px,
            transparent 3px,
            rgba(255,255,255,0.014) 3px,
            rgba(255,255,255,0.014) 3.5px,
            transparent 3.5px,
            transparent 9px
          ),
          repeating-linear-gradient(
            75deg,
            transparent 0px,
            transparent 7px,
            rgba(255,255,255,0.009) 7px,
            rgba(255,255,255,0.009) 8px,
            transparent 8px,
            transparent 18px
          ),
          repeating-linear-gradient(
            85deg,
            transparent 0px,
            transparent 0.5px,
            rgba(255,255,255,0.04) 0.5px,
            rgba(255,255,255,0.04) 1px,
            transparent 1px,
            transparent 22px
          ),
          radial-gradient(ellipse 55% 45% at 25% 22%, rgba(175,182,190,0.28) 0%, rgba(120,128,138,0.10) 45%, transparent 70%),
          radial-gradient(ellipse 40% 55% at 60% 60%, rgba(80,86,95,0.18) 0%, transparent 65%),
          radial-gradient(ellipse 70% 30% at 80% 10%, rgba(150,158,168,0.12) 0%, transparent 60%),
          linear-gradient(
            168deg,
            #15171a 0%,
            #1e2125 12%,
            #2b2f34 28%,
            #1c1f23 42%,
            #333840 55%,
            #202327 70%,
            #191b1e 85%,
            #141618 100%
          )
        `,
      }}
    >
      <Header />

      {/* ── Page header bar ─────────────────────────────────────────────── */}
      <div
        className="border-b pt-20"
        style={{
          background: "rgba(20,22,26,0.72)",
          backdropFilter: "blur(24px)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="container max-w-5xl py-5 flex items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-xl font-semibold text-white">
              {getGreeting()}{firstName ? `, ${firstName}` : ""} 👋
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2"
          >
            {unreadCount > 0 && (
              <Link to="/portal/messages">
                <Button variant="outline" size="sm" className="gap-2 rounded-full h-9 text-xs relative border-white/20 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm">
                  <Bell size={13} />
                  Messages
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                </Button>
              </Link>
            )}
            <Link to="/portal/booking">
              <Button size="sm" className="gap-2 rounded-full h-9 text-xs shadow-md">
                <Calendar size={13} />
                Book Session
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-5xl py-8 space-y-5">

        {/* ── At a Glance stat tiles ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Sessions Ahead",
              value: upcomingSessions.length,
              icon: Calendar,
              accentColor: "#3b82f6",
              iconBg: "rgba(59,130,246,0.10)",
              note: nextSession ? `Next: ${formatDay(nextSession.session_date)}` : "None scheduled",
            },
            {
              label: "Pending Tasks",
              value: todos.filter(t => !t.is_completed).length,
              icon: ListTodo,
              accentColor: "#8b5cf6",
              iconBg: "rgba(139,92,246,0.10)",
              note: `${completedTasks} of ${totalTasks} done`,
            },
            {
              label: "Messages",
              value: unreadCount,
              icon: MessageSquare,
              accentColor: "#10b981",
              iconBg: "rgba(16,185,129,0.10)",
              note: unreadCount > 0 ? "Unread waiting" : "All read",
            },
            {
              label: "Documents",
              value: documents.length,
              icon: Files,
              accentColor: "#f59e0b",
              iconBg: "rgba(245,158,11,0.10)",
              note: "Shared securely",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
              className="rounded-2xl p-5 overflow-hidden relative
                bg-white/75 backdrop-blur-md border border-white/70
                shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.06)]
                hover:shadow-[0_14px_40px_rgba(0,0,0,0.13),0_2px_8px_rgba(0,0,0,0.07)]
                transition-shadow duration-500 ease-out"
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                style={{ background: stat.accentColor }}
              />
              <div className="flex items-start justify-between mb-3 pt-1">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: stat.iconBg }}
                >
                  <stat.icon size={16} style={{ color: stat.accentColor }} />
                </div>
                <span className="text-2xl font-bold" style={{ color: stat.accentColor }}>
                  {stat.value}
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{stat.note}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Sessions + Tasks ──────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-5 gap-5">

          {/* Upcoming Sessions */}
          <FloatCard className="lg:col-span-3 flex flex-col" delay={0.18}>
            <WidgetHeader
              icon={Calendar}
              title="Upcoming Sessions"
              subtitle={`${upcomingSessions.length} scheduled`}
              accentColor="#3b82f6"
              action={
                <Link
                  to="/portal/productivity?tab=calendar"
                  className="text-[11px] text-primary font-medium flex items-center gap-1 hover:underline transition-colors duration-300"
                >
                  View calendar <ArrowRight size={11} />
                </Link>
              }
            />
            <div className="flex-1 p-5">
              {upcomingSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Calendar size={32} className="text-muted-foreground/25 mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">No sessions yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Book your first session to get started.</p>
                  <Link to="/portal/booking">
                    <Button size="sm" className="rounded-full gap-2 text-xs shadow-md">
                      <Calendar size={12} /> Book a Session
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-black/[0.05]">
                  {upcomingSessions.map((s, i) => {
                    const days = daysUntil(s.session_date);
                    return (
                      <div key={s.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                        <div className={`shrink-0 w-11 text-center rounded-xl py-2 ${i === 0 ? "bg-blue-500 text-white" : "bg-black/[0.05] text-foreground"}`}>
                          <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                            {new Date(s.session_date).toLocaleDateString(undefined, { month: "short" })}
                          </p>
                          <p className="text-lg font-bold leading-tight">
                            {new Date(s.session_date).getDate()}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{s.title || "Session"}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {formatDay(s.session_date)} · {formatTime(s.session_date)}
                            {s.duration_minutes ? ` · ${s.duration_minutes} min` : ""}
                          </p>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide shrink-0 ${
                          days === 0
                            ? "bg-green-100 text-green-700"
                            : days === 1
                            ? "bg-amber-100 text-amber-700"
                            : "bg-black/[0.05] text-muted-foreground"
                        }`}>
                          {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days}d`}
                        </span>
                      </div>
                    );
                  })}
                  <div className="pt-3.5">
                    <Link
                      to="/portal/booking"
                      className="text-[11px] text-primary font-medium hover:underline flex items-center gap-1.5 transition-colors duration-300"
                    >
                      <Calendar size={11} /> Book another session
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </FloatCard>

          {/* My Tasks */}
          <FloatCard className="lg:col-span-2 flex flex-col" delay={0.24}>
            <WidgetHeader
              icon={ListTodo}
              title="My Tasks"
              subtitle={`${completedTasks} of ${totalTasks} done`}
              accentColor="#8b5cf6"
              action={
                totalTasks > 0 ? (
                  <span className="text-[11px] font-bold" style={{ color: "#8b5cf6" }}>
                    {Math.round(taskProgress)}%
                  </span>
                ) : undefined
              }
            />
            {totalTasks > 0 && (
              <div className="px-5 pt-3">
                <Progress value={taskProgress} className="h-1 rounded-full" />
              </div>
            )}
            <div className="flex-1 p-5 overflow-hidden">
              {todos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Sparkles size={28} className="text-muted-foreground/25 mb-3" />
                  <p className="text-sm font-medium text-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">Tasks from your therapist appear here.</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {todos.map((todo) => (
                    <button
                      key={todo.id}
                      onClick={() => toggleTodo(todo)}
                      className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300 ${
                        todo.is_completed
                          ? "border-transparent bg-black/[0.03] opacity-50"
                          : "border-black/[0.06] bg-white/50 hover:border-violet-300 hover:bg-violet-50/50"
                      }`}
                    >
                      <div className={`shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        todo.is_completed ? "border-violet-500 bg-violet-500" : "border-border"
                      }`}>
                        {todo.is_completed && <CheckCircle2 size={10} className="text-white fill-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-snug ${todo.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {todo.title}
                        </p>
                        {todo.due_date && !todo.is_completed && (
                          <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                            Due {new Date(todo.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FloatCard>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <FloatCard delay={0.3}>
          <WidgetHeader
            icon={TrendingUp}
            title="Quick Actions"
            subtitle="Jump to a section"
            accentColor="#94a3b8"
          />
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                to: "/portal/messages",
                label: "Messages",
                desc: unreadCount > 0 ? `${unreadCount} unread` : "Chat with therapist",
                icon: MessageSquare,
                color: "#10b981",
                bg: "rgba(16,185,129,0.08)",
                badge: unreadCount,
              },
              {
                to: "/portal/resources",
                label: "Resources",
                desc: "Notes & materials",
                icon: BookOpen,
                color: "#f59e0b",
                bg: "rgba(245,158,11,0.08)",
              },
              {
                to: "/portal/toolkit",
                label: "Toolkit",
                desc: "Exercises & tools",
                icon: Timer,
                color: "#ef4444",
                bg: "rgba(239,68,68,0.08)",
              },
              {
                to: "/portal/productivity",
                label: "Task Board",
                desc: "All tasks & calendar",
                icon: ListTodo,
                color: "#8b5cf6",
                bg: "rgba(139,92,246,0.08)",
              },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="relative flex items-center gap-3 rounded-xl border border-black/[0.06] px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: item.bg }}
              >
                {item.badge ? (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-white/70"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                >
                  <item.icon size={14} style={{ color: item.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                </div>
                <ChevronRight size={12} className="ml-auto text-muted-foreground/30 shrink-0" />
              </Link>
            ))}
          </div>
        </FloatCard>

        {/* ── Documents ─────────────────────────────────────────────────── */}
        <FloatCard delay={0.36}>
          <WidgetHeader
            icon={Files}
            title="Documents"
            subtitle="Shared files with your therapist"
            accentColor="#64748b"
            action={
              <>
                <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5 h-7 text-[11px] bg-white/60 backdrop-blur-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload size={11} />
                  {uploading ? "Uploading…" : "Upload"}
                </Button>
              </>
            }
          />
          <div className="p-5">
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <Files className="mx-auto h-7 w-7 text-muted-foreground/25 mb-3" />
                <p className="text-sm font-medium text-foreground">No documents yet</p>
                <p className="text-xs text-muted-foreground mt-1">Upload files to share securely with your therapist.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {documents.slice(0, 6).map((doc) => (
                  <div
                    key={doc.id}
                    className="group flex items-center gap-3 p-3 rounded-xl border border-black/[0.06] bg-white/40 hover:bg-white/70 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                  >
                    <button
                      onClick={async () => {
                        const { data, error } = await supabase.storage.from("client-documents").download(doc.file_url);
                        if (error || !data) return;
                        const url = URL.createObjectURL(data);
                        const a = document.createElement("a");
                        a.href = url; a.download = doc.file_name; a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{doc.file_name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FloatCard>

        {/* ── Footer strip ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[11px] pb-4" style={{ color: "rgba(255,255,255,0.35)" }}
        >
          <span className="font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Need help?</span>
          <a href="tel:+447715460054" className="flex items-center gap-1.5 hover:text-primary transition-colors duration-300">
            <Phone size={11} /> +44 7715 460054
          </a>
          <a href="mailto:adamdayan@bacbs.com" className="flex items-center gap-1.5 hover:text-primary transition-colors duration-300">
            <Mail size={11} /> adamdayan@bacbs.com
          </a>
        </motion.div>

      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
