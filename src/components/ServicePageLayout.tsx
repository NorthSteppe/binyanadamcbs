import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePageContent } from "@/hooks/useSiteContent";
import Header from "./Header";
import Footer from "./Footer";
import ScrollReveal from "./ScrollReveal";
import EditableText from "./editable/EditableText";
import EditableImage from "./editable/EditableImage";

interface ServicePackage {
  name: string;
  description: string;
  includes: string[];
  ideal: string;
}

export interface ServiceOffer {
  name: string;
  slug: string;
}

interface ServicePageLayoutProps {
  title: string;
  subtitle: string;
  tagline: string;
  bgColorClass: string;
  accentColorClass: string;
  textOnBgClass: string;
  heroImage?: string;
  pageKey: string;
  basePath: string;
  services: (string | ServiceOffer)[];
  packages: ServicePackage[];
  ctaText?: string;
  children?: ReactNode;
}

const ServicePageLayout = ({
  title,
  subtitle,
  tagline,
  bgColorClass,
  accentColorClass,
  textOnBgClass,
  heroImage,
  pageKey,
  basePath,
  services,
  packages,
  ctaText = "Book a Consultation",
}: ServicePageLayoutProps) => {
  const { t } = useLanguage();
  const { data: content } = usePageContent(pageKey);
  const displayImage = content?.image_url || heroImage;

  const getServiceName = (service: string | ServiceOffer) =>
    typeof service === "string" ? service : service.name;
  const getServiceLink = (service: string | ServiceOffer) =>
    typeof service === "string" ? "#" : `${basePath}/${service.slug}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Full-bleed hero */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        {displayImage && (
          <EditableImage
            contentKey={`${pageKey}.hero`}
            defaultSrc={displayImage}
            alt={content?.alt_text || ""}
            className="absolute inset-0"
            imgClassName="w-full h-full object-cover"
          />
        )}
        {displayImage && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
          </>
        )}
        {!displayImage && <div className={`absolute inset-0 ${bgColorClass} opacity-20`} />}
        <div className="container relative z-10 pb-16 md:pb-24 pt-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <EditableText contentKey={`${pageKey}.subtitle`} defaultValue={subtitle} as="p" className="text-[11px] font-sans uppercase tracking-[0.25em] mb-4 text-primary" />
            <EditableText contentKey={`${pageKey}.title`} defaultValue={title} as="h1" className="text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 text-foreground font-serif" />
            <EditableText contentKey={`${pageKey}.tagline`} defaultValue={tagline} as="p" className="text-lg md:text-xl leading-relaxed text-foreground/60 max-w-2xl font-light" />
            {content?.quote_text && (
              <blockquote className="mt-8 border-l border-primary/30 pl-4 text-foreground/50 italic">
                <p className="text-base">{content.quote_text}</p>
                {content.quote_author && <footer className="text-sm mt-2 not-italic text-foreground/30">— {content.quote_author}</footer>}
              </blockquote>
            )}
          </motion.div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-24">
        <div className="container">
          <ScrollReveal>
            <EditableText contentKey={`${pageKey}.whatWeOffer`} defaultValue={t.serviceLayout.whatWeOffer} as="h2" className="text-4xl md:text-5xl font-serif mb-16 text-foreground" />
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, i) => (
              <ScrollReveal key={getServiceName(service)} delay={i * 0.06} distance={16}>
                <Link
                  to={getServiceLink(service)}
                  className="group block border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${accentColorClass}`} />
                      <p className="text-sm text-card-foreground font-light">{getServiceName(service)}</p>
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container">
          <ScrollReveal>
            <EditableText contentKey={`${pageKey}.packagesTitle`} defaultValue={t.serviceLayout.packages} as="h2" className="text-4xl md:text-5xl font-serif mb-4 text-foreground" />
            <EditableText contentKey={`${pageKey}.packagesSubtitle`} defaultValue={t.serviceLayout.packagesSubtitle} as="p" className="text-muted-foreground mb-16 max-w-xl font-light" />
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-6">
            {packages.map((pkg, i) => (
              <ScrollReveal key={pkg.name} delay={i * 0.1}>
                <div className="border border-border bg-background p-8">
                  <h3 className="text-2xl font-serif mb-2 text-foreground">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6 font-light">{pkg.description}</p>
                  <ul className="space-y-3 mb-6">
                    {pkg.includes.map((item) => (
                      <li key={item} className="text-sm text-foreground/80 flex items-start gap-3 font-light">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${accentColorClass}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground italic">{t.serviceLayout.idealFor} {pkg.ideal}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container text-center">
          <ScrollReveal>
            <EditableText contentKey={`${pageKey}.readyTitle`} defaultValue={t.serviceLayout.readyTitle} as="h2" className="text-4xl md:text-5xl font-serif mb-4 text-foreground" />
            <EditableText contentKey={`${pageKey}.readyText`} defaultValue={t.serviceLayout.readyText} as="p" className="text-muted-foreground mb-10 max-w-md mx-auto font-light" />
            <Button size="lg" asChild className="bg-foreground text-background hover:bg-foreground/90 rounded-none px-10 h-12 text-[13px] uppercase tracking-wider font-sans">
              <Link to="/contact">{ctaText}</Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicePageLayout;
