import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Globe, LogOut, LayoutDashboard, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/binyan-logo.png";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();

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
  { label: t.nav.supervision, path: "/supervision" }];


  const portalT = (t as any).portal || {};

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "he" : "en");
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b border-border/30 transition-all duration-300 ${scrolled ? "bg-background/70 backdrop-blur-xl backdrop-saturate-150 shadow-sm" : "bg-background/40 backdrop-blur-md"}`}>
      <div className={`container flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14 md:h-16" : "h-20 md:h-24"}`}>
        <Link to="/" className="flex items-center gap-3">
          <img alt="Binyan Clinical Behaviour Services" className={`transition-all duration-300 ${scrolled ? "h-9 md:h-10" : "h-14 md:h-16"}`} src="/lovable-uploads/ed0abcc5-2b9d-4294-a3b6-3d6945c02959.png" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) =>
          <Link
            key={link.path}
            to={link.path}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors hover:bg-primary/10 ${
            location.pathname === link.path ?
            "text-primary font-semibold bg-primary/10" :
            "text-muted-foreground"}`
            }>

              {link.label}
            </Link>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="rounded-full gap-2 text-muted-foreground hover:text-foreground">

            <Globe size={16} />
            {language === "en" ? "עברית" : "English"}
          </Button>

          {user ?
          <>
              {isAdmin &&
            <>
                  <Button variant="outline" size="sm" asChild className="rounded-full gap-2 border-primary/30 text-primary">
                    <Link to="/admin/calendar">
                      <Shield size={14} />
                      Admin
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
                    <Link to="/admin/team-requests">
                      <Users size={14} />
                      Requests
                    </Link>
                  </Button>
                </>
            }
              {!isAdmin &&
            <Button variant="outline" size="sm" asChild className="rounded-full gap-2">
                  <Link to="/portal">
                    <LayoutDashboard size={14} />
                    {portalT.portal || "Portal"}
                  </Link>
                </Button>
            }
              <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="rounded-full gap-2 text-muted-foreground hover:text-foreground">

                <LogOut size={14} />
                {portalT.logOut || "Log Out"}
              </Button>
            </> :

          <Button variant="outline" size="sm" asChild className="rounded-full">
              <Link to="/contact">{t.nav.bookConsultation}</Link>
            </Button>
          }
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="rounded-full text-muted-foreground">

            <Globe size={18} />
          </Button>
          <button
            className="p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu">

            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen &&
      <div className="lg:hidden bg-background border-b border-border">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) =>
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setMobileOpen(false)}
            className={`px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
            location.pathname === link.path ?
            "bg-primary/10 text-primary font-semibold" :
            "text-muted-foreground hover:bg-primary/5"}`
            }>

                {link.label}
              </Link>
          )}
            <div className="pt-2 border-t border-border mt-2 flex flex-col gap-2">
              {user ?
            <>
                  {isAdmin &&
              <>
                      <Button variant="outline" size="sm" asChild className="rounded-full gap-2 border-primary/30 text-primary">
                        <Link to="/admin/calendar" onClick={() => setMobileOpen(false)}>
                          <Shield size={14} />
                          Admin
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="rounded-full gap-2 text-muted-foreground">
                        <Link to="/admin/team-requests" onClick={() => setMobileOpen(false)}>
                          <Users size={14} />
                          Requests
                        </Link>
                      </Button>
                    </>
              }
                  {!isAdmin &&
              <Button variant="outline" size="sm" asChild className="rounded-full gap-2">
                      <Link to="/portal" onClick={() => setMobileOpen(false)}>
                        <LayoutDashboard size={14} />
                        {portalT.portal || "Portal"}
                      </Link>
                    </Button>
              }
                  <Button variant="ghost" size="sm" onClick={() => {signOut();setMobileOpen(false);}} className="rounded-full gap-2">
                    <LogOut size={14} />
                    {portalT.logOut || "Log Out"}
                  </Button>
                </> :

            <Button variant="outline" size="sm" asChild className="rounded-full">
                  <Link to="/contact" onClick={() => setMobileOpen(false)}>{t.nav.bookConsultation}</Link>
                </Button>
            }
            </div>
          </nav>
        </div>
      }
    </header>);

};

export default Header;