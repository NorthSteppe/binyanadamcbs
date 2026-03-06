import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Calendar, Users, UserPlus, Settings, ImageIcon, FileEdit, ListTodo, BookOpen, Wrench, UserCog } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

const adminTools = [
  { label: "Users", path: "/admin/users", icon: UserCog, description: "Manage all users, roles, and access" },
  { label: "Calendar", path: "/admin/calendar", icon: Calendar, description: "View and manage all scheduled sessions" },
  { label: "Clients", path: "/admin/clients", icon: Users, description: "Manage client profiles and records" },
  { label: "Assignments", path: "/admin/assignments", icon: UserPlus, description: "Assign staff to clients" },
  { label: "Service Options", path: "/admin/service-options", icon: Settings, description: "Define available session types and pricing" },
  { label: "Hero Images", path: "/admin/hero-images", icon: ImageIcon, description: "Manage landing page visuals" },
  { label: "Site Content", path: "/admin/site-content", icon: FileEdit, description: "Edit site-wide content and quotes" },
  { label: "Team Members", path: "/admin/team-members", icon: Users, description: "Manage team member profiles" },
  { label: "Team Requests", path: "/admin/team-requests", icon: UserPlus, description: "Review pending team access requests" },
];

const therapistTools = [
  { label: "Staff To-Dos", path: "/admin/staff-todos", icon: ListTodo, description: "Personal task list for staff" },
  { label: "Client To-Dos", path: "/staff/todos", icon: ListTodo, description: "Manage client task lists" },
  { label: "Resources", path: "/staff/resources", icon: BookOpen, description: "Manage the resource library" },
  { label: "ACT Matrix", path: "/staff/toolkit/act-matrix", icon: Wrench, description: "Fill in ACT Matrix for clients" },
];

const AdminDashboard = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                <Shield size={22} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Admin Portal</h1>
            </div>
            <p className="text-muted-foreground mb-10 ml-14">
              Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}. Manage your practice from here.
            </p>
          </motion.div>

          <h2 className="text-lg font-semibold text-foreground mb-4">Administration</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {adminTools.map((tool, i) => (
              <motion.div key={tool.path} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Link to={tool.path} className="bg-card border border-border/50 rounded-2xl p-5 flex items-start gap-4 hover:border-primary/30 hover:shadow-sm transition-all block h-full">
                  <div className="bg-primary/10 text-primary rounded-xl p-3 shrink-0">
                    <tool.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{tool.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-foreground mb-4">Therapist Tools</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {therapistTools.map((tool, i) => (
              <motion.div key={tool.path} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Link to={tool.path} className="bg-card border border-border/50 rounded-2xl p-5 flex items-start gap-4 hover:border-primary/30 hover:shadow-sm transition-all block h-full">
                  <div className="bg-accent text-accent-foreground rounded-xl p-3 shrink-0">
                    <tool.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{tool.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
