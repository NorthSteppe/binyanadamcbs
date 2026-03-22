import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, ClipboardList, Upload, Calendar, BookOpen, ListTodo, Wrench, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import NotificationSettings from "@/components/portal/NotificationSettings";

const tools = [
  { label: "Case Logs", path: "/supervisee/case-logs", icon: ClipboardList, description: "Log client session details, targets, and interventions" },
  { label: "My Documents", path: "/supervisee/documents", icon: FileText, description: "Upload and view supervision documents" },
  { label: "Calendar", path: "/supervisee/calendar", icon: Calendar, description: "View your session schedule" },
  { label: "Clinical Tools", path: "/supervisee/clinical-tools", icon: Wrench, description: "ABC data sheets, functional assessments & more" },
  { label: "Resources", path: "/supervisee/resources", icon: BookOpen, description: "Access shared learning resources" },
  { label: "My To-Dos", path: "/supervisee/todos", icon: ListTodo, description: "Track your supervision tasks" },
];

const SuperviseeDashboard = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-accent/20 text-accent-foreground rounded-xl p-2.5">
                <GraduationCap size={22} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Supervisee Portal</h1>
            </div>
            <p className="text-muted-foreground mb-10 ml-14">
              Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}. Track your cases and supervision progress.
            </p>
          </motion.div>

          <h2 className="text-lg font-semibold text-foreground mb-4">Your Tools</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool, i) => (
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

          <div className="mt-8">
            <NotificationSettings />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SuperviseeDashboard;
