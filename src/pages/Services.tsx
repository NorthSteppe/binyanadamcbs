import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { School, Heart, Users, Building2, GraduationCap, CheckCircle2, ArrowRight } from "lucide-react";
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

      <section className="pt-32 pb-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-sans font-semibold uppercase tracking-widest text-primary mb-3">{t.services.tagline}</p>
            <h2 className="text-4xl md:text-5xl mb-5">{t.services.title}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">{t.services.subtitle}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard title={t.services.cards.education.title} description={t.services.cards.education.description} icon={School} path="/education" colorClass="bg-education text-education-foreground" />
            <ServiceCard title={t.services.cards.therapy.title} description={t.services.cards.therapy.description} icon={Heart} path="/therapy" colorClass="bg-therapy text-therapy-foreground" />
            <ServiceCard title={t.services.cards.family.title} description={t.services.cards.family.description} icon={Users} path="/families" colorClass="bg-family text-family-foreground" />
            <ServiceCard title={t.services.cards.organisations.title} description={t.services.cards.organisations.description} icon={Building2} path="/organisations" colorClass="bg-business text-business-foreground" />
            <ServiceCard title={t.services.cards.supervision.title} description={t.services.cards.supervision.description} icon={GraduationCap} path="/supervision" colorClass="bg-supervision text-supervision-foreground" />
          </div>
        </div>
      </section>

      <section className="py-24 bg-card">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-sans font-semibold uppercase tracking-widest text-primary mb-3">{t.services.approachTagline}</p>
              <h2 className="text-3xl md:text-4xl mb-6">{t.services.approachTitle}</h2>
              <p className="text-muted-foreground leading-relaxed mb-6 text-base">{t.services.approachText}</p>
              <div className="space-y-4">
                {t.services.approachPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary mt-0.5 flex-shrink-0" size={20} />
                    <p className="text-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-background rounded-3xl p-10 border border-border/50"
            >
              <blockquote className="text-2xl leading-relaxed text-foreground mb-6 italic">
                {t.services.quoteText}
              </blockquote>
              <div>
                <p className="font-sans font-semibold text-foreground">{t.services.quoteAuthor}</p>
                <p className="text-sm text-muted-foreground">{t.services.quoteRole}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container text-center">
          <p className="text-sm font-sans font-semibold uppercase tracking-widest text-primary mb-3">{t.services.credentialsTagline}</p>
          <h2 className="text-3xl md:text-4xl mb-12">{t.services.credentialsTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {t.services.credentials.map((cred, i) => (
              <motion.div
                key={cred}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="bg-card rounded-2xl px-6 py-5 text-sm font-medium text-foreground border border-border/50"
              >
                {cred}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl text-primary-foreground mb-4">{t.services.ctaTitle}</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">{t.services.ctaText}</p>
            <Button size="lg" variant="secondary" asChild className="rounded-full px-8">
              <Link to="/contact" className="inline-flex items-center gap-2">
                {t.services.ctaButton} <ArrowRight size={18} />
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
