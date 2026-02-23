import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, GraduationCap, Award, BookOpen, Heart } from "lucide-react";
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

const TeamBrionny = () => {
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
                  src="/lovable-uploads/e9e3cfd8-13a3-4fe0-b61e-fe115682b95d.jpg"
                  alt="Brionny Pearson — Therapist & Educator"
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
                Therapist & Educator
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-6">
                Brionny Pearson
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Brionny is a talented therapist and an exceptional educator who brings warmth, dedication, and rigour to everything she does. With a strong foundation in both classroom teaching and behavioural science, she bridges the gap between education and therapeutic practice.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-start gap-3">
                  <GraduationCap size={20} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Qualified Teacher Status (QTS)</p>
                    <p className="text-sm text-muted-foreground">Experienced classroom teacher with an undergraduate degree in education</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen size={20} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">MSc Applied Behaviour Analysis (in progress)</p>
                    <p className="text-sm text-muted-foreground">Bangor University — deepening her expertise in the science of behaviour</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart size={20} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Therapist at Binyan</p>
                    <p className="text-sm text-muted-foreground">Providing person-centred, constructional support across education and clinical settings</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award size={20} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Outstanding Educator</p>
                    <p className="text-sm text-muted-foreground">Known for her ability to connect with learners and create environments where everyone can thrive</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Brionny */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={0}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
                A Unique Combination
              </h2>
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  Brionny's strength lies in her rare combination of teaching experience and therapeutic skill. With Qualified Teacher Status and years of hands-on classroom experience, she understands the realities of educational environments — the pressures on staff, the complexity of pupil needs, and the importance of practical, implementable strategies.
                </p>
                <p>
                  Now pursuing her Masters in Applied Behaviour Analysis at Bangor University, Brionny is deepening her understanding of the science that underpins effective practice. This academic grounding, combined with her natural warmth and ability to build rapport, makes her an invaluable member of the Binyan team.
                </p>
                <p>
                  Whether she is delivering therapy, supporting a school team, or working alongside families, Brionny brings the same commitment to dignity, evidence, and building capability that defines the Binyan approach.
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
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Reach out to learn more about how our team can support you.
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

export default TeamBrionny;
