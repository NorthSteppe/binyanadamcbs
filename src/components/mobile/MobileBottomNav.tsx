import { useLocation, useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Info, User, LogIn, Shield, Users,
  Briefcase, MessageSquare, BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isTeamMember } = useAuth();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  // Hide on messaging/chat pages to avoid covering the input
  const hideOnRoutes = ["/portal/messages", "/staff/messages", "/portal/chat"];
  if (hideOnRoutes.some((r) => location.pathname === r)) return null;

  type NavItem = { icon: React.ElementType; label: string; path: string };

  const getNavItems = (): NavItem[] => {
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
        { icon: BarChart3, label: "Stats", path: "/staff/productivity" },
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
    const items: NavItem[] = [
      { icon: Home, label: "Home", path: "/" },
      { icon: BookOpen, label: "Services", path: "/services" },
      { icon: Info, label: "About", path: "/about" },
    ];
    if (user) {
      if (isAdmin) items.push({ icon: Shield, label: "Admin", path: "/admin" });
      else if (isTeamMember) items.push({ icon: Briefcase, label: "Staff", path: "/staff" });
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
    // Outer wrapper: pushes bar above home indicator / safe area
    <div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pointer-events-none"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
      }}
    >
      {/* Floating pill container */}
      <div className="flex justify-center px-4 pb-3 pointer-events-auto">
        <nav
          className="
            bg-background/85 backdrop-blur-3xl
            rounded-[22px]
            shadow-[0_8px_32px_-4px_rgba(0,0,0,0.18),0_2px_8px_-2px_rgba(0,0,0,0.10)]
            border border-white/20
            dark:border-white/8
            overflow-hidden
          "
          style={{ WebkitBackdropFilter: "blur(40px)" }}
        >
          <div className="flex items-center h-[60px] px-1.5 gap-0.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  aria-label={item.label}
                  className="
                    relative flex flex-col items-center justify-center
                    no-select rounded-[16px] px-3.5 h-[46px] min-w-[60px]
                    focus:outline-none active:scale-95 transition-transform duration-100
                  "
                >
                  {/* Active background pill */}
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        layoutId="navActivePill"
                        className="absolute inset-0 rounded-[16px] bg-foreground/[0.08] dark:bg-foreground/[0.12]"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 500, damping: 32, mass: 0.6 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Icon */}
                  <motion.div
                    animate={{
                      scale: active ? 1.12 : 1,
                      y: active ? -1 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 26 }}
                    className="relative z-10"
                  >
                    <item.icon
                      size={21}
                      strokeWidth={active ? 2.25 : 1.65}
                      className={`transition-colors duration-200 ${
                        active ? "text-foreground" : "text-muted-foreground/70"
                      }`}
                    />
                  </motion.div>

                  {/* Label */}
                  <motion.span
                    animate={{ opacity: active ? 1 : 0.55 }}
                    transition={{ duration: 0.15 }}
                    className={`relative z-10 text-[9.5px] font-medium tracking-wide leading-none mt-0.5 ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </motion.span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileBottomNav;
