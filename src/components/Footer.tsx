import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-background">
      <div className="container py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <h3 className="text-2xl mb-4">Binyan</h3>
            <p className="text-background/60 max-w-md text-sm leading-relaxed">
              {t.footer.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-background/40">
              <span>UKBA (Cert)</span>
              <span>•</span>
              <span>UK-SBA Member</span>
              <span>•</span>
              <span>ACBS Member</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-sans font-semibold uppercase tracking-wider mb-4 text-background/50">{t.footer.servicesTitle}</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/education" className="text-background/60 hover:text-background transition-colors">{t.footer.links.education}</Link>
              <Link to="/therapy" className="text-background/60 hover:text-background transition-colors">{t.footer.links.therapy}</Link>
              <Link to="/families" className="text-background/60 hover:text-background transition-colors">{t.footer.links.families}</Link>
              <Link to="/organisations" className="text-background/60 hover:text-background transition-colors">{t.footer.links.organisations}</Link>
              <Link to="/supervision" className="text-background/60 hover:text-background transition-colors">{t.footer.links.supervision}</Link>
            </nav>
          </div>

          <div>
            <h4 className="text-sm font-sans font-semibold uppercase tracking-wider mb-4 text-background/50">{t.footer.contactTitle}</h4>
            <div className="flex flex-col gap-2 text-sm text-background/60">
              <span>{t.contact.location}</span>
              <a className="hover:text-background transition-colors" href="mailto:adamdayan@bacbs.com">adamdayan@bacbs.com</a>
              <Link to="/contact" className="hover:text-background transition-colors">{t.footer.links.bookConsultation}</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-background/10 text-xs text-background/30 text-center">
          © {new Date().getFullYear()} {t.footer.copyright}
        </div>
      </div>
    </footer>);

};

export default Footer;