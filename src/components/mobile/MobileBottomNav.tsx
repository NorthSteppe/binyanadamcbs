import { useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Info, User, LogIn, Shield, Users, Briefcase, MessageSquare, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isTeamMember } = useAuth();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  // Hide bottom nav on messages/chat pages to avoid overlapping input
  const hideOnRoutes = ["/portal/messages", "/staff/messages"];
  if (hideOnRoutes.some((r) => location.pathname === r)) return null;

  const getNavItems = () => {
    if (location.pathname.startsWith("/admin")) {
      return [
        { icon: Shield, label: "Admin", path: "/admin" },
        { icon: Users, label: "Therapist", path: "/staff" },
        { icon: Home, label: "Home", path: "/" },
      ];
    }
    if (location.pathname.startsWith("/staff")) {
      return [
        { icon: Briefcase, label: "Dashboard", path: "/staff" },
        { icon: BarChart3, label: "Productivity", path: "/staff/productivity" },
        { icon: MessageSquare, label: "Messages", path: "/staff/messages" },
        { icon: BookOpen, label: "Tools", path: "/staff/clinical-tools" },
      ];
    }
    if (location.pathname.startsWith("/portal")) {
      return [
        { icon: Home, label: "Portal", path: "/portal" },
        { icon: BookOpen, label: "Resources", path: "/portal/resources" },
        { icon: Briefcase, label: "Toolkit", path: "/portal/toolkit" },
        { icon: User, label: "Profile", path: "/portal" },
      ];
    }
    // Public pages
    const items = [
      { icon: Home, label: "Home", path: "/" },
      { icon: BookOpen, label: "Services", path: "/services" },
      { icon: Info, label: "About", path: "/about" },
    ];
    if (user) {
      if (isAdmin) items.push({ icon: Shield, label: "Admin", path: "/admin" });
      else if (isTeamMember) items.push({ icon: Briefcase, label: "Therapist", path: "/staff" });
      else items.push({ icon: User, label: "Portal", path: "/portal" });
    } else {
      items.push({ icon: LogIn, label: "Log In", path: "/login" });
    }
    return items;
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div
        className="bg-background/80 backdrop-blur-2xl border-t border-border/50"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-14 px-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 no-select"
              >
                <div className="relative">
                  <item.icon
                    size={20}
                    className={`transition-colors duration-200 ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        layoutId="bottomNavIndicator"
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <span
                  className={`text-[10px] font-light tracking-wide ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
