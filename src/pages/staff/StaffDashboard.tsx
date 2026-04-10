import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, ListTodo, BookOpen, Wrench, Calendar, ClipboardList, MessageSquare,
  Timer, BarChart3, Settings, CheckCircle2, Clock, Briefcase, ArrowRight, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { usePreferences } from "@/hooks/usePreferences";
import LinearTasksPanel from "@/components/staff/LinearTasksPanel";
import {
  METAL_BG, FloatCard, WidgetHeader, StatTile, PortalTopBar,
} from "@/components/portal/PortalShell";

interface StaffTodo {
  id: string; title: string; description: string; is_completed: boolean;
  due_date: string | null; assigned_to: string; created_by: string; created_at: string;
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const clinicalTools = [
  { label: "Calendar", path: "/staff/calendar", icon: Calendar, description: "View and manage all sessions", accentColor: "#3b82f6", iconBg: "rgba(59,130,246,0.10)" },
  { label: "Clinical Tools", path: "/staff/clinical-tools", icon: ClipboardList, description: "CBS data collection tools", accentColor: "#8b5cf6", iconBg: "rgba(139,92,246,0.10)" },
  { label: "Client To-Dos", path: "/staff/todos", icon: ListTodo, description: "Manage client task lists", accentColor: "#f59e0b", iconBg: "rgba(245,158,11,0.10)" },
  { label: "ACT Matrix", path: "/staff/toolkit/act-matrix", icon: Wrench, description: "ACT Matrix for clients", accentColor: "#10b981", iconBg: "rgba(16,185,129,0.10)" },
  { label: "Business Planner", path: "/planner", icon: Briefcase, description: "Financials, TME matrix, and roadmap", accentColor: "#6366f1", iconBg: "rgba(99,102,241,0.10)" },
];

const workspaceTools = [
  { label: "Productivity Hub", path: "/staff/productivity", icon: BarChart3, description: "Task board, calendar & AI", accentColor: "#6366f1", iconBg: "rgba(99,102,241,0.10)" },
  { label: "Resources", path: "/staff/resources", icon: BookOpen, description: "Resource library", accentColor: "#f59e0b", iconBg: "rgba(245,158,11,0.10)" },
  { label: "Toolkit", path: "/staff/toolkit", icon: Timer, description: "Pomodoro, ACT Matrix & more", accentColor: "#ef4444", iconBg: "rgba(239,68,68,0.10)" },
  { label: "Messages", path: "/staff/messages", icon: MessageSquare, description: "Secure messaging", accentColor: "#10b981", iconBg: "rgba(16,185,129,0.10)" },
  { label: "Booking", path: "/staff/booking", icon: Calendar, description: "Manage your sessions", accentColor: "#3b82f6", iconBg: "rgba(59,130,246,0.10)" },
  { label: "Settings", path: "/settings", icon: Settings, description: "Preferences & notifications", accentColor: "#94a3b8", iconBg: "rgba(148,163,184,0.10)" },
];

const StaffDashboard = () => {
  const { profile, user } = useAuth();
  const { prefs } = usePreferences();
  const [myTasks, setMyTasks] = useState<StaffTodo[]>([]);
  const [stats, setStats] = useState({ upcomingSessions: 0, pendingStaffTodos: 0, pendingClientTodos: 0, loading: true });
  const firstName = profile?.full_name?.split(" ")[0] || "";

  const fetchMyTasks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("staff_todos").select("*")
      .eq("assigned_to", user.id).eq("is_completed", false)
      .order("created_at", { ascending: false }).limit(10);
    if (data) setMyTasks(data);
  }, [user]);

  useEffect(() => { fetchMyTasks(); }, [fetchMyTasks]);

  const toggleTask = async (id: string) => {
    await supabase.from("staff_todos").update({ is_completed: true }).eq("id", id);
    fetchMyTasks();
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [sessionsRes, staffTodosRes, clientTodosRes] = await Promise.all([
          supabase.from("sessions").select("id", { count: "exact" }).gte("session_date", new Date().toISOString()),
          supabase.from("staff_todos").select("id", { count: "exact" }).eq("is_completed", false),
          supabase.from("client_todos").select("id", { count: "exact" }).eq("is_completed", false),
        ]);
        setStats({ upcomingSessions: sessionsRes.count || 0, pendingStaffTodos: staffTodosRes.count || 0, pendingClientTodos: clientTodosRes.count || 0, loading: false });
      } catch { setStats(p => ({ ...p, loading: false })); }
    })();
  }, [user]);

  const showWidget = (id: string) => prefs.dashboardWidgets.includes(id);

  return (
    <div className="min-h-screen" style={METAL_BG}>
      <Header />

      <PortalTopBar
        greeting={`${getGreeting()}${firstName ? `, ${firstName}` : ""} 👋`}
        date={new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      />

      <div className="container max-w-5xl py-8 space-y-6">

        {/* Stats */}
        {!stats.loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatTile label="Upcoming Sessions" value={stats.upcomingSessions} note="Scheduled in future" icon={Calendar} accentColor="#3b82f6" iconBg="rgba(59,130,246,0.10)" delay={0} />
            <StatTile label="My Tasks" value={stats.pendingStaffTodos} note="Incomplete staff to-dos" icon={ListTodo} accentColor="#8b5cf6" iconBg="rgba(139,92,246,0.10)" delay={0.07} />
            <StatTile label="Client Homework" value={stats.pendingClientTodos} note="Pending from clients" icon={ClipboardList} accentColor="#f59e0b" iconBg="rgba(245,158,11,0.10)" delay={0.14} />
          </div>
        )}

        {/* Tools row */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Clinical Tools */}
          <FloatCard delay={0.18} className="flex flex-col">
            <WidgetHeader icon={ClipboardList} title="Clinical Tools" subtitle="Client-facing clinical work" accentColor="#3b82f6" />
            <div className="p-4 space-y-2 flex-1">
              {clinicalTools.map((tool, i) => (
                <motion.div
                  key={tool.path}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.18 + i * 0.05 }}
                  whileHover={{ x: 3, transition: { duration: 0.25 } }}
                >
                  <Link
                    to={tool.path}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-black/[0.05] bg-white/40
                      hover:bg-white/80 hover:shadow-[0_3px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: tool.iconBg }}>
                      <tool.icon size={13} style={{ color: tool.accentColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">{tool.label}</p>
                      <p className="text-[10px] text-muted-foreground">{tool.description}</p>
                    </div>
                    <ChevronRight size={12} className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </FloatCard>

          {/* My Workspace */}
          <FloatCard delay={0.22} className="flex flex-col">
            <WidgetHeader icon={Users} title="My Workspace" subtitle="Personal tools & settings" accentColor="#8b5cf6" />
            <div className="p-4 space-y-2 flex-1">
              {workspaceTools.map((tool, i) => (
                <motion.div
                  key={tool.path}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.22 + i * 0.05 }}
                  whileHover={{ x: 3, transition: { duration: 0.25 } }}
                >
                  <Link
                    to={tool.path}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-black/[0.05] bg-white/40
                      hover:bg-white/80 hover:shadow-[0_3px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: tool.iconBg }}>
                      <tool.icon size={13} style={{ color: tool.accentColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">{tool.label}</p>
                      <p className="text-[10px] text-muted-foreground">{tool.description}</p>
                    </div>
                    <ChevronRight size={12} className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </FloatCard>
        </div>

        {/* My Tasks widget */}
        {showWidget("tasks") && (
          <FloatCard delay={0.28} className="flex flex-col">
            <WidgetHeader
              icon={ListTodo}
              title="My Tasks"
              subtitle={`${myTasks.length} pending`}
              accentColor="#f59e0b"
              action={
                <Link to="/staff/staff-todos">
                  <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 rounded-full">
                    View all <ArrowRight size={11} />
                  </Button>
                </Link>
              }
            />
            <div className="p-5">
              {myTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No pending tasks assigned to you.</p>
              ) : (
                <div className="space-y-1.5">
                  {myTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border border-black/[0.05]
                        bg-white/40 hover:bg-white/70 transition-all duration-300 group"
                    >
                      <div className="w-4 h-4 rounded-full border-2 border-border group-hover:border-amber-400 transition-colors flex items-center justify-center shrink-0">
                        <CheckCircle2 size={10} className="opacity-0 group-hover:opacity-40 text-amber-500 transition-opacity" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{task.title}</p>
                        {task.due_date && (
                          <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-0.5">
                            <Clock size={9} />
                            Due {new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FloatCard>
        )}

        {/* Linear / Practice Tasks */}
        {showWidget("linear") && (
          <FloatCard delay={0.33}>
            <WidgetHeader icon={BarChart3} title="Practice Tasks" subtitle="Team task board" accentColor="#6366f1" />
            <div className="p-5">
              <LinearTasksPanel />
            </div>
          </FloatCard>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pb-4"
          style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}
        >
          Therapist Portal · Binyan Adam CBS
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default StaffDashboard;
