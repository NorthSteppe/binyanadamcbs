import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Globe, LogOut, LayoutDashboard, Shield, Users, Waves, LogIn, UserPlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/NotificationBell";

const Header = ({ hidelogo = false }: { hidelogo?: boolean }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, isTeamMember, isStaff, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: t.nav.services, path: "/services" },
    { label: t.nav.education, path: "/education" },
    { label: t.nav.therapy, path: "/therapy" },
    { label: t.nav.families, path: "/families" },
    { label: t.nav.organisations, path: "/organisations" },
    { label: t.nav.supervision, path: "/supervision" },
    { label: (t as any).about?.tagline || "About Us", path: "/about" },
  ];

  const portalT = (t as any).portal || {};
  const toggleLanguage = () => setLanguage(language === "en" ? "he" : "en");

  const getPortalLink = () => {
    if (isAdmin) return { path: "/admin", label: "Admin Portal", icon: Shield };
    if (isTeamMember) return { path: "/staff", label: "Therapist Portal", icon: Users };
    return { path: "/portal", label: portalT.portal || "Portal", icon: LayoutDashboard };
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b border-border/30 transition-all duration-300 ${scrolled ? "bg-background/70 backdrop-blur-xl backdrop-saturate-150 shadow-sm" : "bg-background/40 backdrop-blur-md"}`}>
      <div className={`container flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14 md:h-16" : "h-20 md:h-24"}`}>
        <Link to="/" className="flex items-center gap-3">
          <img alt="Binyan Adam Clinical Behaviour Services" className={`transition-all duration-300 ${hidelogo ? "opacity-0 scale-75" : "opacity-100 scale-100"} ${scrolled ? "h-9 md:h-10" : "h-14 md:h-16"}`} src="/lovable-uploads/ed0abcc5-2b9d-4294-a3b6-3d6945c02959.png" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors hover:bg-primary/10 ${location.pathname === link.path ? "text-primary font-semibold bg-primary/10" : "text-muted-foreground"}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
            <Globe size={16} />
            {language === "en" ? "עברית" : "English"}
          </Button>

          {user ? (
            <>
              <NotificationBell />
              {(() => {
                const portal = getPortalLink();
                return (
                  <Button variant="default" size="sm" asChild className="rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link to={portal.path}><portal.icon size={14} /> {portal.label}</Link>
                  </Button>
                );
              })()}
              <Button variant="ghost" size="sm" onClick={signOut} className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
                <LogOut size={14} /> {portalT.logOut || "Log Out"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="rounded-full gap-2">
                <Link to="/login"><LogIn size={14} /> Log In</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="rounded-full gap-2">
                <Link to="/signup"><UserPlus2 size={14} /> Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center gap-2">
          {user && <NotificationBell />}
          <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-full text-muted-foreground"><Globe size={18} /></Button>
          <button className="p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <Waves size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-background border-b border-border">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className={`px-4 py-3 text-sm font-medium rounded-xl transition-colors ${location.pathname === link.path ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-primary/5"}`}>
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  {(() => {
                    const portal = getPortalLink();
                    return (
                      <Link to={portal.path} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl text-primary bg-primary/10">
                        <portal.icon size={14} /> {portal.label}
                      </Link>
                    );
                  })()}
                  <Button variant="ghost" size="sm" onClick={() => { signOut(); setMobileOpen(false); }} className="rounded-full gap-2">
                    <LogOut size={14} /> {portalT.logOut || "Log Out"}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl text-muted-foreground hover:bg-primary/5">
                    <LogIn size={14} /> Log In
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl text-muted-foreground hover:bg-primary/5">
                    <UserPlus2 size={14} /> Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
