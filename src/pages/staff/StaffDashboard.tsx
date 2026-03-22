import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, ListTodo, BookOpen, Wrench, Calendar, ClipboardList } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import NotificationSettings from "@/components/portal/NotificationSettings";

const therapistTools = [
  { label: "Calendar", path: "/staff/calendar", icon: Calendar, description: "View and manage sessions" },
  { label: "Clinical Tools", path: "/staff/clinical-tools", icon: ClipboardList, description: "CBS data collection: ABC, functional assessment, hexaflex & more" },
  { label: "Staff To-Dos", path: "/staff/staff-todos", icon: ListTodo, description: "Personal task list for staff" },
  { label: "Client To-Dos", path: "/staff/todos", icon: ListTodo, description: "Manage task lists for your assigned clients" },
  { label: "Resources", path: "/staff/resources", icon: BookOpen, description: "Manage the resource library" },
  { label: "ACT Matrix", path: "/staff/toolkit/act-matrix", icon: Wrench, description: "Fill in ACT Matrix for assigned clients" },
];

const StaffDashboard = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                <Users size={22} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Therapist Portal</h1>
            </div>
            <p className="text-muted-foreground mb-10 ml-14">
              Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}. Your tools and caseload.
            </p>
          </motion.div>

          <h2 className="text-lg font-semibold text-foreground mb-4">Therapist Tools</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {therapistTools.map((tool, i) => (
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

export default StaffDashboard;
