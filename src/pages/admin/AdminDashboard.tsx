import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Calendar, Users, UserPlus, Settings, ImageIcon, FileEdit,
  ListTodo, BookOpen, Wrench, UserCog, LayoutDashboard, ArrowRight,
  Palette, Globe, Type, Megaphone, CreditCard, ClipboardList, ShieldAlert, KeyRound, Pencil,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useEditMode } from "@/hooks/useEditMode";

interface ToolItem {
  label: string;
  path: string;
  icon: React.ElementType;
  description: string;
}

interface ToolCategory {
  title: string;
  description: string;
  accentClass: string;
  iconBgClass: string;
  tools: ToolItem[];
}

const categories: ToolCategory[] = [
  {
    title: "Website Design & Content",
    description: "Control how your website looks and what it says",
    accentClass: "text-primary",
    iconBgClass: "bg-primary/10 text-primary",
    tools: [
      { label: "Hero Images", path: "/admin/hero-images", icon: ImageIcon, description: "Manage the landing page slideshow images, quotes, and timing" },
      { label: "Site Content", path: "/admin/site-content", icon: FileEdit, description: "Edit page images, quotes, and text across all service pages" },
      { label: "Team Profiles", path: "/admin/team-members", icon: Users, description: "Add, edit, or remove staff bios shown on the About page" },
    ],
  },
  {
    title: "Services & Booking",
    description: "Configure what clients can book and how much it costs",
    accentClass: "text-primary",
    iconBgClass: "bg-secondary text-secondary-foreground",
    tools: [
      { label: "Service Options", path: "/admin/service-options", icon: Settings, description: "Define session types, durations, and pricing" },
      { label: "Calendar", path: "/admin/calendar", icon: Calendar, description: "View and manage all scheduled sessions" },
    ],
  },
  {
    title: "Users & Access",
    description: "Manage who can access what across the platform",
    accentClass: "text-primary",
    iconBgClass: "bg-muted text-muted-foreground",
    tools: [
      { label: "User Management", path: "/admin/users", icon: UserCog, description: "Search users, assign or revoke roles" },
      { label: "Auth Settings", path: "/admin/auth-settings", icon: KeyRound, description: "Configure sign-up, sign-in methods, and security" },
      { label: "Security Dashboard", path: "/admin/security", icon: ShieldAlert, description: "Run security scans and review vulnerabilities" },
      { label: "Client Management", path: "/admin/clients", icon: Users, description: "View client profiles, notes, and documents" },
      { label: "Client Assignments", path: "/admin/assignments", icon: UserPlus, description: "Assign therapists to clients" },
      { label: "Team Requests", path: "/admin/team-requests", icon: UserPlus, description: "Review pending staff access requests" },
    ],
  },
  {
    title: "Therapist Tools",
    description: "Day-to-day tools for clinical and administrative work",
    accentClass: "text-primary",
    iconBgClass: "bg-accent text-accent-foreground",
    tools: [
      { label: "Staff To-Dos", path: "/admin/staff-todos", icon: ListTodo, description: "Manage and assign tasks to staff" },
      { label: "Client To-Dos", path: "/staff/todos", icon: ClipboardList, description: "Manage task lists for clients" },
      { label: "Resources", path: "/staff/resources", icon: BookOpen, description: "Upload and manage the resource library" },
      { label: "ACT Matrix", path: "/staff/toolkit/act-matrix", icon: Wrench, description: "Fill in ACT Matrix for clients" },
    ],
  },
];

const portalLinks = [
  { path: "/portal", label: "Client Portal", description: "View as a client — dashboard, booking, toolkit", icon: LayoutDashboard, iconBg: "bg-primary/10 text-primary" },
  { path: "/staff", label: "Therapist Portal", description: "View as a therapist — clients, calendar, tools", icon: Users, iconBg: "bg-accent text-accent-foreground" },
];

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { setEditMode } = useEditMode();
  const navigate = useNavigate();

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
              Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}. Manage your practice from here.
            </p>
          </motion.div>

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

          {/* Portal Switcher */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-14"
          >
            <div className="mb-4">
              <h2 className="text-xl font-serif text-foreground">Switch Portal</h2>
              <p className="text-sm text-muted-foreground font-light">Preview the platform from a different perspective</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {portalLinks.map((p) => (
                <Link
                  key={p.path}
                  to={p.path}
                  className="group bg-card border border-border/50 p-5 flex items-center gap-4 hover:border-primary/30 transition-all"
                >
                  <div className={`${p.iconBg} rounded-lg p-2.5 shrink-0`}>
                    <p.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">{p.label}</p>
                    <p className="text-xs text-muted-foreground font-light">{p.description}</p>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
