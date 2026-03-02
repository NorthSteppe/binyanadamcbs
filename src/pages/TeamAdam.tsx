import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mail, GraduationCap, Award, BookOpen, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const TeamAdam = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container">
          <Link to="/about" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft size={16} /> Back to About
          </Link>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/lovable-uploads/20251210_082121.jpg"
                  alt="Adam Dayan — Director & Clinical Behaviour Analyst"
                  className="w-full h-auto object-cover aspect-[3/4]"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
                Director & Clinical Behaviour Analyst
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-6">
                Adam Dayan
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Adam is the founder and director of Binyan Adam Clinical Behaviour Services. With over 15 years of experience across education, therapy, and organisational settings, Adam brings a deeply constructional and ethical approach to behaviour analysis.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-start gap-3">
                  <GraduationCap size={20} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">MSc Applied Behaviour Analysis</p>
                    <p className="text-sm text-muted-foreground">Queen's University Belfast</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <GraduationCap size={20} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">MEd Psychology of Education (candidate)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award size={20} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">UKBA (Cert) Registered</p>
                    <p className="text-sm text-muted-foreground">UK Board of Applied Behaviour Analytic Practice</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen size={20} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">UK-SBA & ACBS Member</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase size={20} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">15+ Years' Experience</p>
                    <p className="text-sm text-muted-foreground">Senior Leadership Team member in specialist education settings</p>
                  </div>
                </div>
              </div>

              <a
                href="mailto:adamdayan@bacbs.com"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Mail size={16} /> adamdayan@bacbs.com
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={0}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
                Clinical Philosophy
              </h2>
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  Adam's practice is rooted in the constructional approach to behaviour analysis — the principle that lasting change comes from building new capabilities, not suppressing existing behaviour. He is committed to working with individuals and systems in a way that respects dignity, promotes autonomy, and leads to measurable outcomes.
                </p>
                <p>
                  Drawing on Acceptance and Commitment Therapy (ACT), Positive Behaviour Support (PBS), and Organisational Behaviour Management (OBM), Adam works across multiple contexts — from individual therapy and family support to whole-school transformation and organisational culture change.
                </p>
                <p>
                  Whether supporting a child in school, coaching a parent at home, or advising a leadership team on behaviour strategy, Adam's approach is always collaborative, transparent, and grounded in the science of behaviour.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={0}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Work with Adam
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Book a consultation to discuss how Adam can support your needs.
            </p>
            <Button size="lg" asChild className="rounded-full px-8">
              <Link to="/contact" className="inline-flex items-center gap-2">
                Book a Consultation <ArrowRight size={18} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TeamAdam;
