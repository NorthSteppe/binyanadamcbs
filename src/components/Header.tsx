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
      { path: "/supervisee", label: "Supervisee", icon: LayoutDashboard },
      { path: "/portal", label: "Client View", icon: LayoutDashboard },
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/90 backdrop-blur-xl border-b border-border/40" : "bg-transparent"}`}>
      <div className={`container flex items-center justify-between transition-all duration-500 ${scrolled ? "h-16" : "h-20 md:h-24"}`}>
        <Link to="/" className="flex items-center gap-3">
          <img
            alt="Binyan Adam"
            className={`transition-all duration-500 ${hidelogo ? "opacity-0 scale-75" : "opacity-100 scale-100"} ${scrolled ? "h-8 md:h-9" : "h-10 md:h-12"}`}
            src="/lovable-uploads/ed0abcc5-2b9d-4294-a3b6-3d6945c02959.png"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.path} className="relative group">
                <Link
                  to={link.path}
                  className={`px-4 py-2 text-[13px] font-sans font-light tracking-wide uppercase transition-colors duration-300 inline-flex items-center gap-1
                    ${[link.path, ...link.children.map(c => c.path)].includes(location.pathname)
                      ? "text-primary"
                      : "text-foreground/60 hover:text-foreground"
                    }`}
                >
                  {link.label}
                  <svg className="w-3 h-3 opacity-50 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </Link>
                <div className="absolute left-0 top-full pt-1 opacity-0 translate-x-[-8px] pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-300 ease-out">
                  <div className="bg-card/95 backdrop-blur-xl border border-border/40 py-2 min-w-[180px]">
                    {link.children.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className={`block px-5 py-2.5 text-[12px] font-light tracking-wide uppercase transition-all duration-200
                          ${location.pathname === sub.path
                            ? "text-primary bg-primary/5"
                            : "text-foreground/60 hover:text-foreground hover:bg-muted/50 hover:translate-x-1"
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
                className={`px-4 py-2 text-[13px] font-sans font-light tracking-wide uppercase transition-colors duration-300
                  ${location.pathname === link.path
                    ? "text-primary"
                    : "text-foreground/60 hover:text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-[13px] font-light tracking-wide text-foreground/60 hover:text-foreground hover:bg-transparent"
          >
            {language === "en" ? "HE" : "EN"}
          </Button>

          <span className="text-border mx-1">|</span>

          {user ? (
            <>
              <NotificationBell />
              {portalLinks.length > 1 ? (
                <div className="relative group">
                  <Button variant="ghost" size="sm" asChild className="text-[13px] font-light tracking-wide text-foreground/60 hover:text-foreground hover:bg-transparent">
                    <Link to={currentPortal.path}>{currentPortal.label} ▾</Link>
                  </Button>
                  <div className="absolute right-0 top-full pt-1 hidden group-hover:block">
                    <div className="bg-card border border-border/50 backdrop-blur-xl py-1 min-w-[160px]">
                      {portalLinks.map((p) => (
                        <Link
                          key={p.path}
                          to={p.path}
                          className={`flex items-center gap-2 px-4 py-2 text-[12px] font-light tracking-wide uppercase transition-colors
                            ${location.pathname.startsWith(p.path) ? "text-primary" : "text-foreground/60 hover:text-foreground hover:bg-muted/50"}`}
                        >
                          <p.icon size={14} />
                          {p.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Button variant="ghost" size="sm" asChild className="text-[13px] font-light tracking-wide text-foreground/60 hover:text-foreground hover:bg-transparent">
                  <Link to={portalLinks[0].path}>{portalLinks[0].label}</Link>
                </Button>
              )}
              <Button
                size="sm"
                onClick={signOut}
                className="border border-foreground/20 bg-transparent text-foreground/80 hover:bg-foreground/10 text-[13px] font-light tracking-wide rounded-none px-5"
              >
                {portalT.logOut || "Log Out"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-[13px] font-light tracking-wide text-foreground/60 hover:text-foreground hover:bg-transparent">
                <Link to="/login">Log In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="border border-foreground/20 bg-transparent text-foreground/80 hover:bg-foreground/10 text-[13px] font-light tracking-wide rounded-none px-5"
              >
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile — simplified since we have bottom nav */}
        <div className="lg:hidden flex items-center gap-2">
          {user && <NotificationBell />}
          <Button variant="ghost" size="icon" onClick={toggleLanguage} className="text-foreground/60">
            <Globe size={18} />
          </Button>
        </div>
      </div>

    </header>
  );
};

export default Header;
