import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import ScrollReveal from "@/components/ScrollReveal";
import EditableText from "@/components/editable/EditableText";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-20">
        <div className="grid md:grid-cols-4 gap-12">
          <ScrollReveal direction="up" className="md:col-span-2">
            <EditableText contentKey="footer.brand" defaultValue="Binyan Adam" as="h3" className="text-2xl font-display mb-4 text-foreground tracking-tight" />
            <EditableText contentKey="footer.description" defaultValue={t.footer.description} as="p" className="text-muted-foreground max-w-md text-sm leading-relaxed" />
            <div className="mt-8 flex flex-wrap gap-4 text-xs text-muted-foreground/50 tracking-wide">
              <EditableText contentKey="footer.cred1" defaultValue="UKBA (Cert)" as="span" />
              <span className="text-border">·</span>
              <EditableText contentKey="footer.cred2" defaultValue="UK-SBA Member" as="span" />
              <span className="text-border">·</span>
              <EditableText contentKey="footer.cred3" defaultValue="ACBS Member" as="span" />
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1}>
            <EditableText contentKey="footer.servicesTitle" defaultValue={t.footer.servicesTitle} as="h4" className="text-[12px] font-medium uppercase tracking-widest mb-6 text-muted-foreground" />
            <nav className="flex flex-col gap-3 text-sm">
              <Link to="/education" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                <EditableText contentKey="footer.link.education" defaultValue={t.footer.links.education} />
              </Link>
              <Link to="/therapy" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                <EditableText contentKey="footer.link.therapy" defaultValue={t.footer.links.therapy} />
              </Link>
              <Link to="/families" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                <EditableText contentKey="footer.link.families" defaultValue={t.footer.links.families} />
              </Link>
              <Link to="/organisations" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                <EditableText contentKey="footer.link.organisations" defaultValue={t.footer.links.organisations} />
              </Link>
              <Link to="/supervision" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                <EditableText contentKey="footer.link.supervision" defaultValue={t.footer.links.supervision} />
              </Link>
            </nav>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <EditableText contentKey="footer.contactTitle" defaultValue={t.footer.contactTitle} as="h4" className="text-[12px] font-medium uppercase tracking-widest mb-6 text-muted-foreground" />
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <EditableText contentKey="footer.location" defaultValue={t.contact.location} as="span" />
              <a className="hover:text-foreground transition-colors duration-300" href="mailto:adamdayan@bacbs.com">
                <EditableText contentKey="footer.email" defaultValue="adamdayan@bacbs.com" as="span" />
              </a>
              <Link to="/contact" className="hover:text-foreground transition-colors duration-300">
                <EditableText contentKey="footer.bookConsultation" defaultValue={t.footer.links.bookConsultation} />
              </Link>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-16 pt-8 border-t border-border text-[11px] text-muted-foreground/40 text-center tracking-wide">
            © {new Date().getFullYear()} <EditableText contentKey="footer.copyright" defaultValue={t.footer.copyright} as="span" />
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};

export default Footer;
