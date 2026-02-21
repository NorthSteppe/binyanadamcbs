import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "./Header";
import Footer from "./Footer";

interface ServicePackage {
  name: string;
  description: string;
  includes: string[];
  ideal: string;
}

interface ServicePageLayoutProps {
  title: string;
  subtitle: string;
  tagline: string;
  bgColorClass: string;
  accentColorClass: string;
  textOnBgClass: string;
  heroImage?: string;
  services: string[];
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
  services,
  packages,
  ctaText = "Book a Consultation",
}: ServicePageLayoutProps) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className={`relative pt-32 pb-20 overflow-hidden ${bgColorClass}`}>
        {heroImage && (
          <div className="absolute inset-0">
            <img src={heroImage} alt="" className="w-full h-full object-cover opacity-20" />
          </div>
        )}
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className={`text-sm font-sans font-semibold uppercase tracking-widest mb-4 ${textOnBgClass} opacity-70`}>
              {subtitle}
            </p>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 ${textOnBgClass}`}>
              {title}
            </h1>
            <p className={`text-lg md:text-xl leading-relaxed ${textOnBgClass} opacity-80 max-w-2xl`}>
              {tagline}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl mb-12">{t.serviceLayout.whatWeOffer}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, i) => (
              <motion.div
                key={service}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="rounded-2xl p-6 border border-border/50 bg-card"
              >
                <div className={`w-2.5 h-2.5 rounded-full mb-3 ${accentColorClass}`} />
                <p className="text-sm font-medium text-card-foreground">{service}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container">
          <h2 className="text-3xl mb-4">{t.serviceLayout.packages}</h2>
          <p className="text-muted-foreground mb-12 max-w-xl">{t.serviceLayout.packagesSubtitle}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-2xl p-8 bg-background border border-border/50"
              >
                <h3 className="text-xl mb-2 text-foreground">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground mb-5">{pkg.description}</p>
                <ul className="space-y-2 mb-5">
                  {pkg.includes.map((item) => (
                    <li key={item} className="text-sm text-foreground flex items-start gap-2">
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${accentColorClass}`} />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground italic">{t.serviceLayout.idealFor} {pkg.ideal}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container text-center">
          <h2 className="text-3xl mb-4">{t.serviceLayout.readyTitle}</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t.serviceLayout.readyText}</p>
          <Button size="lg" asChild className="rounded-full px-8">
            <Link to="/contact">{ctaText}</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicePageLayout;
