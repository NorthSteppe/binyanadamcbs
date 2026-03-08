import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, GraduationCap, Heart, Building2, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePageContent } from "@/hooks/useSiteContent";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

const About = () => {
  const { t } = useLanguage();
  const about = (t as any).about;
  const { data: content } = usePageContent("about");
  const { data: teamMembers } = useTeamMembers();

  const specialisations = [
    { icon: GraduationCap, label: about.specialisations[0] },
    { icon: Heart, label: about.specialisations[1] },
    { icon: Users, label: about.specialisations[2] },
    { icon: Building2, label: about.specialisations[3] },
    { icon: BookOpen, label: about.specialisations[4] },
  ];

  const values = about.values as Array<{ title: string; description: string }>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={content?.image_url || "/lovable-uploads/93c59eae-410f-4380-a222-312d8d41af41.jpg"}
            alt={content?.alt_text || "Binyan Adam"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
        </div>
        <div className="container relative z-10 pb-16 md:pb-24 pt-40">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-3xl">
            <p className="text-[11px] font-sans uppercase tracking-[0.25em] text-primary mb-4">{about.tagline}</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.05] mb-6 text-foreground">{about.title}</h1>
            <p className="text-lg md:text-xl text-foreground/60 leading-relaxed max-w-lg font-light">{about.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-8">{about.missionTitle}</h2>
              <p className="text-lg text-foreground/60 leading-relaxed font-light">{about.missionText}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Specialisations */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">{about.specialisationsTitle}</h2>
            <p className="text-foreground/50 max-w-2xl mx-auto font-light">{about.specialisationsSubtitle}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {specialisations.map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1}
                className="flex items-center gap-4 p-5 bg-card border border-border">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10">
                  <item.icon size={18} className="text-primary" />
                </div>
                <span className="text-sm text-foreground/80 font-light">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground">{about.valuesTitle}</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {values.map((value, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1} className="text-center">
                <div className="w-10 h-10 flex items-center justify-center mx-auto mb-4 bg-primary/10">
                  <CheckCircle2 size={18} className="text-primary" />
                </div>
                <h3 className="text-xl font-serif text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-foreground/50 leading-relaxed font-light">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">{about.teamTitle}</h2>
            <p className="text-foreground/50 max-w-2xl mx-auto font-light">{about.teamSubtitle}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {(teamMembers || []).map((member, i) => {
              const cardContent = (
                <motion.div key={member.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1}
                  className="group text-center p-8 bg-card border border-border hover:border-primary/20 transition-colors duration-500 cursor-pointer">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-5" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 text-2xl font-serif text-primary group-hover:bg-primary/20 transition-colors">
                      {member.initials}
                    </div>
                  )}
                  <h3 className="text-xl font-serif text-foreground mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-3">{member.role}</p>
                  <p className="text-sm text-foreground/50 leading-relaxed font-light">{member.bio}</p>
                </motion.div>
              );

              return member.slug ? (
                <Link key={member.id} to={`/team/${member.slug}`} className="no-underline">{cardContent}</Link>
              ) : (
                <div key={member.id}>{cardContent}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif text-primary-foreground mb-4">{about.ctaTitle}</h2>
            <p className="text-primary-foreground/60 mb-10 font-light">{about.ctaText}</p>
            <Button size="lg" asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-none px-10 h-12 text-[13px] uppercase tracking-wider font-sans">
              <Link to="/contact" className="inline-flex items-center gap-3">
                {about.ctaButton} <ArrowRight size={16} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
