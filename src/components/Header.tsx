import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Globe, LogOut, LayoutDashboard, Shield, Users, X, LogIn, UserPlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/NotificationBell";

const Header = ({ hidelogo = false }: { hidelogo?: boolean }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, isTeamMember, isSupervisee, isStaff, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const serviceSubLinks = [
    { label: t.nav.education, path: "/education" },
    { label: t.nav.therapy, path: "/therapy" },
    { label: t.nav.families, path: "/families" },
    { label: t.nav.organisations, path: "/organisations" },
    { label: t.nav.supervision, path: "/supervision" },
  ];

  const navLinks = [
    { label: t.nav.services, path: "/services", children: serviceSubLinks },
    { label: "Courses", path: "/courses" },
    { label: (t as any).about?.tagline || "About Us", path: "/about" },
  ];

  const portalT = (t as any).portal || {};
  const toggleLanguage = () => setLanguage(language === "en" ? "he" : "en");

  const getPortalLinks = () => {
    if (isAdmin) return [
      { path: "/admin", label: "Admin", icon: Shield },
      { path: "/staff", label: "Therapist", icon: Users },
    ];
    if (isTeamMember) return [
      { path: "/staff", label: "Therapist Portal", icon: Users },
    ];
    if (isSupervisee) return [
      { path: "/supervisee", label: "Supervisee Portal", icon: LayoutDashboard },
    ];
    return [
      { path: "/portal", label: portalT.portal || "Portal", icon: LayoutDashboard },
    ];
  };

  const portalLinks = getPortalLinks();
  const currentPortal = portalLinks.find(p => location.pathname.startsWith(p.path)) || portalLinks[0];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "glass shadow-apple"
        : "bg-transparent"
    }`}>
      <div className={`container flex items-center justify-between transition-all duration-500 ${scrolled ? "h-14" : "h-16 md:h-20"}`}>
        <Link to="/" className="flex items-center gap-3">
          <img
            alt="Binyan Adam"
            className={`transition-all duration-500 mix-blend-multiply dark:mix-blend-screen dark:invert ${hidelogo ? "opacity-0 scale-90" : "opacity-100 scale-100"} ${scrolled ? "h-7 md:h-8" : "h-9 md:h-10"}`}
            src="/lovable-uploads/ed0abcc5-2b9d-4294-a3b6-3d6945c02959.png"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.path} className="relative group">
                <Link
                  to={link.path}
                  className={`px-4 py-2 text-[13px] font-medium tracking-tight transition-colors duration-300 inline-flex items-center gap-1.5 rounded-full
                    ${[link.path, ...link.children.map(c => c.path)].includes(location.pathname)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {link.label}
                  <svg className="w-3 h-3 opacity-40 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </Link>
                <div className="absolute left-0 top-full pt-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out">
                  <div className="glass rounded-2xl py-2 min-w-[200px] shadow-apple-lg">
                    {link.children.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className={`block px-4 py-2.5 text-[13px] font-medium tracking-tight transition-all duration-200 rounded-lg mx-1
                          ${location.pathname === sub.path
                            ? "text-foreground bg-accent"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-[13px] font-medium tracking-tight transition-colors duration-300 rounded-full
                  ${location.pathname === link.path
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-full h-8 px-3"
          >
            {language === "en" ? "HE" : "EN"}
          </Button>

          {user ? (
            <>
              <NotificationBell />
              {portalLinks.length > 1 ? (
                <div className="relative group">
                  <Button variant="ghost" size="sm" asChild className="text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-full h-8 px-3">
                    <Link to={currentPortal.path}>{currentPortal.label} ▾</Link>
                  </Button>
                  <div className="absolute right-0 top-full pt-2 hidden group-hover:block">
                    <div className="glass rounded-2xl py-2 min-w-[180px] shadow-apple-lg">
                      {portalLinks.map((p) => (
                        <Link
                          key={p.path}
                          to={p.path}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium tracking-tight transition-colors rounded-lg mx-1
                            ${location.pathname.startsWith(p.path) ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                        >
                          <p.icon size={14} />
                          {p.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Button variant="ghost" size="sm" asChild className="text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-full h-8 px-3">
                  <Link to={portalLinks[0].path}>{portalLinks[0].label}</Link>
                </Button>
              )}
              <Button
                size="sm"
                onClick={signOut}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] font-medium rounded-full px-5 h-8 shadow-apple"
              >
                {portalT.logOut || "Log Out"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-full h-8 px-3">
                <Link to="/login">Log In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] font-medium rounded-full px-5 h-8 shadow-apple"
              >
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex items-center gap-2">
          {user && <NotificationBell />}
          <Button variant="ghost" size="icon" onClick={toggleLanguage} className="text-muted-foreground rounded-full">
            <Globe size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
