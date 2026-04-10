import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield, Calendar, Users, UserPlus, Settings, ImageIcon, FileEdit,
  UserCog, ArrowRight, KeyRound, Pencil, GraduationCap, ShieldAlert, BarChart3, BookOpen, FileText,
  ListTodo, Wrench, LayoutDashboard, Palette, Globe, Type, Megaphone, CreditCard, ClipboardList, Briefcase, Activity, Bot
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useEditMode } from "@/hooks/useEditMode";
import NotificationSettings from "@/components/portal/NotificationSettings";

interface ToolItem {
  label: string;
  path: string;
  icon: React.ElementType;
  description: string;
}

interface ToolCategory {
  title: string;
  description: string;
  iconBgClass: string;
  tools: ToolItem[];
}

const categories: ToolCategory[] = [
  {
    title: "AI Assistant",
    description: "Configure and monitor the Binyan AI assistant that appears on the site",
    iconBgClass: "bg-primary/10 text-primary",
    tools: [
      { label: "Assistant Manager", path: "/admin/assistant", icon: Bot, description: "Configure greetings, toggle the assistant on/off, review conversations, and view collected data" },
    ],
  },
  {
    title: "Business & Finance",
    description: "Track revenue, expenses, profit, and business growth",
    iconBgClass: "bg-primary/10 text-primary",
    tools: [
      { label: "Business Dashboard", path: "/admin/business", icon: BarChart3, description: "Revenue analytics, profit tracking, forecasts, and client growth" },
    ],
  },
  {
    title: "Website Design & Content",
    description: "Control how your website looks and what it says",
    iconBgClass: "bg-primary/10 text-primary",
    tools: [
      { label: "Hero Images", path: "/admin/hero-images", icon: ImageIcon, description: "Manage the landing page slideshow images, quotes, and timing" },
      { label: "Site Content", path: "/admin/site-content", icon: FileEdit, description: "Edit page images, quotes, and text across all service pages" },
      { label: "Therapist Profiles", path: "/admin/team-members", icon: Users, description: "Add, edit, or remove therapist bios shown on the About page" },
      { label: "Blog Manager", path: "/admin/blog", icon: BookOpen, description: "Create, schedule, and manage Insights articles, categories, and authors" },
      { label: "Partner Badges", path: "/admin/badges", icon: Shield, description: "Manage accreditation logos on the landing page, add links to external sites" },
    ],
  },
  {
    title: "Task Management",
    description: "Delegate, track, and manage tasks across the team",
    iconBgClass: "bg-primary/10 text-primary",
    tools: [
      { label: "Task Board", path: "/admin/task-board", icon: Settings, description: "Kanban board to delegate and track team tasks" },
      { label: "Staff To-Dos", path: "/admin/staff-todos", icon: Settings, description: "Legacy list view of staff tasks" },
    ],
  },
  {
    title: "Services & Booking",
    description: "Configure what clients can book and how much it costs",
    iconBgClass: "bg-secondary text-secondary-foreground",
    tools: [
      { label: "Service Options", path: "/admin/service-options", icon: Settings, description: "Define session types, durations, and pricing" },
      { label: "Calendar", path: "/admin/calendar", icon: Calendar, description: "View and manage all scheduled sessions" },
      { label: "Note Templates", path: "/admin/note-templates", icon: FileText, description: "Design session note templates for voice transcription summaries" },
      { label: "Course Manager", path: "/admin/courses", icon: GraduationCap, description: "Create and manage online courses, lessons, and videos" },
    ],
  },
  {
    title: "Users & Access",
    description: "Manage who can access what across the platform",
    iconBgClass: "bg-muted text-muted-foreground",
    tools: [
      { label: "User Management", path: "/admin/users", icon: UserCog, description: "Manage all users, roles, therapist assignments, and view client portals" },
      { label: "Manual Clients", path: "/admin/manual-clients", icon: UserPlus, description: "Add clients and supervisees who don't have an account" },
      { label: "Auth Settings", path: "/admin/auth-settings", icon: KeyRound, description: "Configure sign-up, sign-in methods, and security" },
      { label: "Security Dashboard", path: "/admin/security", icon: ShieldAlert, description: "Run security scans and review vulnerabilities" },
      { label: "Team Requests", path: "/admin/team-requests", icon: UserPlus, description: "Review pending therapist access requests" },
    ],
  },
];

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { setEditMode } = useEditMode();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ activeClients: 0, upcomingSessions: 0, pendingTodos: 0, loading: true });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsRes, sessionsRes, todosRes] = await Promise.all([
          supabase.from("user_roles").select("id", { count: "exact" }).eq("role", "client"),
          supabase.from("sessions").select("id", { count: "exact" }).gte("session_date", new Date().toISOString()),
          supabase.from("client_todos").select("id", { count: "exact" }).eq("is_completed", false)
        ]);
        setStats({
          activeClients: clientsRes.count || 0,
          upcomingSessions: sessionsRes.count || 0,
          pendingTodos: todosRes.count || 0,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
  }, []);

  const handleEnterEditMode = () => {
    setEditMode(true);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-5xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                  <Shield size={22} />
                </div>
                <h1 className="text-3xl md:text-4xl font-serif text-foreground">Admin Portal</h1>
              </div>
              <button
                onClick={handleEnterEditMode}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full shadow-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <Pencil size={16} />
                Edit Website
              </button>
            </div>
            <p className="text-muted-foreground mb-12 ml-14 font-light">
              Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}. Manage your practice website and users.
            </p>
          </motion.div>

          {/* Quick Stats */}
          {!stats.loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <Card className="bg-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeClients}</div>
                  <p className="text-xs text-muted-foreground">Registered in portal</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
                  <p className="text-xs text-muted-foreground">Scheduled in future</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Client Tasks</CardTitle>
                  <ListTodo className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingTodos}</div>
                  <p className="text-xs text-muted-foreground">Incomplete client to-dos</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Categories */}
          <div className="space-y-12">
            {categories.map((cat, catIdx) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIdx * 0.08, duration: 0.5 }}
              >
                <div className="mb-4">
                  <h2 className="text-xl font-serif text-foreground">{cat.title}</h2>
                  <p className="text-sm text-muted-foreground font-light">{cat.description}</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cat.tools.map((tool, i) => (
                    <motion.div
                      key={tool.path}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIdx * 0.08 + i * 0.04, duration: 0.4 }}
                    >
                      <Link
                        to={tool.path}
                        className="group bg-card border border-border/50 p-5 flex items-start gap-4 hover:border-primary/30 transition-all block h-full"
                      >
                        <div className={`${cat.iconBgClass} rounded-lg p-2.5 shrink-0`}>
                          <tool.icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">{tool.label}</p>
                          <p className="text-xs text-muted-foreground mt-1 font-light leading-relaxed">{tool.description}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Portal Switcher - only Therapist Portal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-14"
          >
            <div className="mb-4">
              <h2 className="text-xl font-serif text-foreground">Switch Portal</h2>
              <p className="text-sm text-muted-foreground font-light">Access your therapist tools and workspace</p>
            </div>
            <Link
              to="/staff"
              className="group bg-card border border-border/50 p-5 flex items-center gap-4 hover:border-primary/30 transition-all max-w-md"
            >
              <div className="bg-accent text-accent-foreground rounded-lg p-2.5 shrink-0">
                <Users size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">Therapist Portal</p>
                <p className="text-xs text-muted-foreground font-light">Clinical tools, productivity, messages, and caseload</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>

          <div className="mt-8">
            <NotificationSettings />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
