import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import ScrollReveal from "@/components/ScrollReveal";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-20">
        <div className="grid md:grid-cols-4 gap-12">
          <ScrollReveal direction="up" className="md:col-span-2">
            <h3 className="text-3xl font-serif mb-4 text-foreground">Binyan Adam</h3>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              {t.footer.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-xs text-muted-foreground/60 uppercase tracking-widest">
              <span>UKBA (Cert)</span>
              <span className="text-border">·</span>
              <span>UK-SBA Member</span>
              <span className="text-border">·</span>
              <span>ACBS Member</span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1}>
            <h4 className="text-[11px] font-sans uppercase tracking-[0.2em] mb-6 text-muted-foreground">
              {t.footer.servicesTitle}
            </h4>
            <nav className="flex flex-col gap-3 text-sm">
              <Link to="/education" className="text-foreground/50 hover:text-primary transition-colors duration-300">{t.footer.links.education}</Link>
              <Link to="/therapy" className="text-foreground/50 hover:text-primary transition-colors duration-300">{t.footer.links.therapy}</Link>
              <Link to="/families" className="text-foreground/50 hover:text-primary transition-colors duration-300">{t.footer.links.families}</Link>
              <Link to="/organisations" className="text-foreground/50 hover:text-primary transition-colors duration-300">{t.footer.links.organisations}</Link>
              <Link to="/supervision" className="text-foreground/50 hover:text-primary transition-colors duration-300">{t.footer.links.supervision}</Link>
            </nav>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <h4 className="text-[11px] font-sans uppercase tracking-[0.2em] mb-6 text-muted-foreground">
              {t.footer.contactTitle}
            </h4>
            <div className="flex flex-col gap-3 text-sm text-foreground/50">
              <span>{t.contact.location}</span>
              <a className="hover:text-primary transition-colors duration-300" href="mailto:adamdayan@bacbs.com">adamdayan@bacbs.com</a>
              <Link to="/contact" className="hover:text-primary transition-colors duration-300">{t.footer.links.bookConsultation}</Link>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-16 pt-8 border-t border-border text-[11px] text-muted-foreground/40 text-center uppercase tracking-[0.15em]">
            © {new Date().getFullYear()} {t.footer.copyright}
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};

export default Footer;
