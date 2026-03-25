import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import {
  Users, ListTodo, BookOpen, Wrench, Calendar, ClipboardList, MessageSquare,
  Timer, BarChart3, Settings, Circle, CheckCircle2, Clock, Plus, MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { usePreferences } from "@/hooks/usePreferences";
import LinearTasksPanel from "@/components/staff/LinearTasksPanel";
import { supabase } from "@/integrations/supabase/client";

interface StaffTodo {
  id: string; title: string; description: string; is_completed: boolean;
  due_date: string | null; assigned_to: string; created_by: string; created_at: string;
}

const clinicalTools = [
  { label: "Calendar", path: "/staff/calendar", icon: Calendar, description: "View and manage all sessions" },
  { label: "Clinical Tools", path: "/staff/clinical-tools", icon: ClipboardList, description: "CBS data collection tools" },
  { label: "Client To-Dos", path: "/staff/todos", icon: ListTodo, description: "Manage client task lists" },
  { label: "ACT Matrix", path: "/staff/toolkit/act-matrix", icon: Wrench, description: "ACT Matrix for clients" },
];

const personalTools = [
  { label: "Productivity Hub", path: "/staff/productivity", icon: BarChart3, description: "Task board, calendar & AI" },
  { label: "Resources", path: "/staff/resources", icon: BookOpen, description: "Resource library" },
  { label: "Toolkit", path: "/staff/toolkit", icon: Timer, description: "Pomodoro, ACT Matrix & more" },
  { label: "Messages", path: "/staff/messages", icon: MessageSquare, description: "Secure messaging" },
  { label: "Booking", path: "/staff/booking", icon: Calendar, description: "Manage your sessions" },
  { label: "Settings", path: "/settings", icon: Settings, description: "Preferences & notifications" },
];

const StaffDashboard = () => {
  const { profile, user } = useAuth();
  const { prefs } = usePreferences();
  const [myTasks, setMyTasks] = useState<StaffTodo[]>([]);

  const fetchMyTasks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("staff_todos")
      .select("*")
      .eq("assigned_to", user.id)
      .eq("is_completed", false)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setMyTasks(data);
  }, [user]);

  useEffect(() => { fetchMyTasks(); }, [fetchMyTasks]);

  const toggleTask = async (id: string) => {
    await supabase.from("staff_todos").update({ is_completed: true }).eq("id", id);
    fetchMyTasks();
  };

  const showWidget = (id: string) => prefs.dashboardWidgets.includes(id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                <Users size={22} />
              </div>
              <h1 className="text-3xl md:text-4xl font-display tracking-tight text-foreground">Therapist Portal</h1>
            </div>
            <p className="text-muted-foreground mb-10 ml-14">
              Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}. Your tools, caseload, and workspace.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left column: tools */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Clinical Tools</h2>
                <div className="space-y-2">
                  {clinicalTools.map((tool, i) => (
                    <motion.div key={tool.path} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                      <Link to={tool.path} className="bg-card border border-border/50 rounded-xl p-4 flex items-center gap-3 hover:border-primary/30 transition-all block">
                        <div className="bg-primary/10 text-primary rounded-lg p-2 shrink-0">
                          <tool.icon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{tool.label}</p>
                          <p className="text-[11px] text-muted-foreground">{tool.description}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">My Workspace</h2>
                <div className="space-y-2">
                  {personalTools.map((tool, i) => (
                    <motion.div key={tool.path} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.2 }}>
                      <Link to={tool.path} className="bg-card border border-border/50 rounded-xl p-4 flex items-center gap-3 hover:border-primary/30 transition-all block">
                        <div className="bg-accent text-accent-foreground rounded-lg p-2 shrink-0">
                          <tool.icon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{tool.label}</p>
                          <p className="text-[11px] text-muted-foreground">{tool.description}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: tasks */}
            <div className="lg:col-span-2 space-y-6">
              {/* My Internal Tasks */}
              {showWidget("tasks") && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-foreground">My Tasks</h2>
                    <Link to="/staff/staff-todos">
                      <Button variant="ghost" size="sm" className="text-xs gap-1">
                        View All <span className="text-muted-foreground">→</span>
                      </Button>
                    </Link>
                  </div>
                  <div className="bg-card border border-border/50 rounded-2xl p-5">
                    {myTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No pending tasks assigned to you.</p>
                    ) : (
                      <div className="space-y-2">
                        {myTasks.map(task => (
                          <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                            <button onClick={() => toggleTask(task.id)} className="shrink-0">
                              <Circle size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                              {task.due_date && (
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Calendar size={10} />
                                  Due {new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Linear tasks */}
              {showWidget("linear") && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">Practice Tasks</h2>
                  <div className="bg-card border border-border/50 rounded-2xl p-5">
                    <LinearTasksPanel />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default StaffDashboard;
