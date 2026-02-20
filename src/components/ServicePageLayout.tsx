import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
  services,
  packages,
  ctaText = "Book a Consultation",
}: ServicePageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className={`pt-32 pb-20 ${bgColorClass}`}>
        <div className="container">
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

      {/* Services */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl mb-12">What We Offer</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, i) => (
              <motion.div
                key={service}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className={`rounded-lg p-5 border border-border bg-card`}
              >
                <div className={`w-2 h-2 rounded-full mb-3 ${accentColorClass}`} />
                <p className="text-sm font-medium text-card-foreground">{service}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <h2 className="text-3xl mb-4">Packages</h2>
          <p className="text-muted-foreground mb-12 max-w-xl">
            Clear, structured support tailored to your needs. Every package includes measurable outcomes and a collaborative approach.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-xl p-8 bg-card border border-border"
              >
                <h3 className="text-xl mb-2 text-card-foreground">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground mb-5">{pkg.description}</p>
                <ul className="space-y-2 mb-5">
                  {pkg.includes.map((item) => (
                    <li key={item} className="text-sm text-card-foreground flex items-start gap-2">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${accentColorClass}`} />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground italic">Ideal for: {pkg.ideal}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="text-3xl mb-4">Ready to Begin?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            We do not remove behaviour. We build capability. Let's start with a conversation.
          </p>
          <Button size="lg" asChild>
            <Link to="/contact">{ctaText}</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicePageLayout;
