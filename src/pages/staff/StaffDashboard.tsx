import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, ListTodo, BookOpen, Wrench, Calendar, ClipboardList, MessageSquare, Timer, LayoutDashboard, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import NotificationSettings from "@/components/portal/NotificationSettings";
import LinearTasksPanel from "@/components/staff/LinearTasksPanel";

const clinicalTools = [
  { label: "Calendar", path: "/staff/calendar", icon: Calendar, description: "View and manage all sessions" },
  { label: "Clinical Tools", path: "/staff/clinical-tools", icon: ClipboardList, description: "CBS data collection: ABC, functional assessment, hexaflex & more" },
  { label: "Client To-Dos", path: "/staff/todos", icon: ListTodo, description: "Manage task lists for your assigned clients" },
  { label: "ACT Matrix", path: "/staff/toolkit/act-matrix", icon: Wrench, description: "Fill in ACT Matrix for assigned clients" },
];

const personalTools = [
  { label: "Productivity Hub", path: "/staff/productivity", icon: BarChart3, description: "Task board, calendar, projects & AI suggestions" },
  { label: "Resources", path: "/staff/resources", icon: BookOpen, description: "Browse and manage the resource library" },
  { label: "Toolkit", path: "/staff/toolkit", icon: Timer, description: "Pomodoro timer, ACT Matrix & more" },
  { label: "Messages", path: "/staff/messages", icon: MessageSquare, description: "Secure messaging with clients and team" },
  { label: "Booking", path: "/staff/booking", icon: Calendar, description: "View and manage your own sessions" },
];

const StaffDashboard = () => {
  const { profile } = useAuth();

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

              <NotificationSettings />
            </div>

            {/* Right column: Linear tasks */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-foreground mb-3">Practice Tasks</h2>
              <div className="bg-card border border-border/50 rounded-2xl p-5">
                <LinearTasksPanel />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default StaffDashboard;
