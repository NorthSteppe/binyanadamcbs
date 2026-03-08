import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Leaf, UsersRound, Landmark, Compass, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";

const Services = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-40 pb-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <p className="text-[11px] font-sans uppercase tracking-[0.25em] text-primary mb-4">{t.services.tagline}</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.05] mb-6">{t.services.title}</h1>
            <p className="text-foreground/60 max-w-xl text-lg font-light">{t.services.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* Cards */}
      <section className="pb-24">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
             <ServiceCard title={t.services.cards.education.title} description={t.services.cards.education.description} icon={BookOpen} path="/education" colorClass="" />
            <ServiceCard title={t.services.cards.therapy.title} description={t.services.cards.therapy.description} icon={Leaf} path="/therapy" colorClass="" />
            <ServiceCard title={t.services.cards.family.title} description={t.services.cards.family.description} icon={UsersRound} path="/families" colorClass="" />
            <ServiceCard title={t.services.cards.organisations.title} description={t.services.cards.organisations.description} icon={Landmark} path="/organisations" colorClass="" />
            <ServiceCard title={t.services.cards.supervision.title} description={t.services.cards.supervision.description} icon={Compass} path="/supervision" colorClass="" />
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[11px] font-sans uppercase tracking-[0.25em] text-primary mb-4">{t.services.approachTagline}</p>
              <h2 className="text-4xl md:text-5xl font-serif mb-8">{t.services.approachTitle}</h2>
              <p className="text-foreground/60 leading-relaxed mb-8 font-light">{t.services.approachText}</p>
              <div className="space-y-4">
                {t.services.approachPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <Check className="text-primary mt-0.5 flex-shrink-0" size={16} strokeWidth={1.5} />
                    <p className="text-foreground/80 font-light">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card border border-border p-10"
            >
              <blockquote className="text-2xl font-serif leading-relaxed text-foreground mb-6 italic">
                {t.services.quoteText}
              </blockquote>
              <div>
                <p className="text-sm font-medium text-foreground">{t.services.quoteAuthor}</p>
                <p className="text-xs text-muted-foreground">{t.services.quoteRole}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-[11px] font-sans uppercase tracking-[0.25em] text-primary mb-4">{t.services.credentialsTagline}</p>
            <h2 className="text-4xl md:text-5xl font-serif">{t.services.credentialsTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {t.services.credentials.map((cred, i) => (
              <motion.div
                key={cred}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-card border border-border px-6 py-5 text-sm text-foreground/80 font-light"
              >
                {cred}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif text-primary-foreground mb-4">{t.services.ctaTitle}</h2>
            <p className="text-primary-foreground/60 mb-10 max-w-md mx-auto font-light">{t.services.ctaText}</p>
            <Button size="lg" asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-none px-10 h-12 text-[13px] uppercase tracking-wider font-sans">
              <Link to="/contact" className="inline-flex items-center gap-3">
                {t.services.ctaButton} <ArrowRight size={16} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
