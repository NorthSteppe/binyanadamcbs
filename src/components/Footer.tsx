import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <h3 className="text-2xl mb-4">Binyan</h3>
            <p className="text-background/60 max-w-md text-sm leading-relaxed">
              Clinical Behaviour Services. Building behavioural capability through constructional, 
              ethical, and evidence-based practice. We do not remove behaviour. We build capability.
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
            <h4 className="text-sm font-sans font-semibold uppercase tracking-wider mb-4 text-background/50">Services</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/education" className="text-background/60 hover:text-background transition-colors">PBS in Education</Link>
              <Link to="/therapy" className="text-background/60 hover:text-background transition-colors">Therapy</Link>
              <Link to="/families" className="text-background/60 hover:text-background transition-colors">Family Support</Link>
              <Link to="/organisations" className="text-background/60 hover:text-background transition-colors">Organisations</Link>
              <Link to="/supervision" className="text-background/60 hover:text-background transition-colors">Supervision</Link>
            </nav>
          </div>

          <div>
            <h4 className="text-sm font-sans font-semibold uppercase tracking-wider mb-4 text-background/50">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-background/60">
              <span>Manchester, UK</span>
              <a href="mailto:info@binyancbs.co.uk" className="hover:text-background transition-colors">info@binyancbs.co.uk</a>
              <Link to="/contact" className="hover:text-background transition-colors">Book a Consultation</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-background/10 text-xs text-background/30 text-center">
          © {new Date().getFullYear()} Binyan Clinical Behaviour Services. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
