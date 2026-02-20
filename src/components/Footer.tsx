import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <h3 className="text-2xl mb-4">Binyan</h3>
            <p className="text-primary-foreground/70 max-w-md text-sm leading-relaxed">
              Clinical Behaviour Services. Building behavioural capability through constructional, 
              ethical, and evidence-based practice. We do not remove behaviour. We build capability.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-primary-foreground/50">
              <span>UKBA (Cert)</span>
              <span>•</span>
              <span>UK-SBA Member</span>
              <span>•</span>
              <span>ACBS Member</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-sans font-semibold uppercase tracking-wider mb-4 text-primary-foreground/60">Services</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/education" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">PBS in Education</Link>
              <Link to="/therapy" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Therapy</Link>
              <Link to="/families" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Family Support</Link>
              <Link to="/organisations" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Organisations</Link>
              <Link to="/supervision" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Supervision</Link>
            </nav>
          </div>

          <div>
            <h4 className="text-sm font-sans font-semibold uppercase tracking-wider mb-4 text-primary-foreground/60">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <span>Manchester, UK</span>
              <a href="mailto:info@binyancbs.co.uk" className="hover:text-primary-foreground transition-colors">info@binyancbs.co.uk</a>
              <Link to="/contact" className="hover:text-primary-foreground transition-colors">Book a Consultation</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/10 text-xs text-primary-foreground/40 text-center">
          © {new Date().getFullYear()} Binyan Clinical Behaviour Services. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
