import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, GraduationCap, Heart, Building2, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const About = () => {
  const { t } = useLanguage();
  const about = (t as any).about;

  const specialisations = [
    { icon: GraduationCap, label: about.specialisations[0] },
    { icon: Heart, label: about.specialisations[1] },
    { icon: Users, label: about.specialisations[2] },
    { icon: Building2, label: about.specialisations[3] },
    { icon: BookOpen, label: about.specialisations[4] },
  ];

  const team = about.team as Array<{
    name: string;
    role: string;
    bio: string;
    initials: string;
    slug?: string;
  }>;

  const values = about.values as Array<{ title: string; description: string }>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">
                {about.tagline}
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] mb-6">
                {about.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                {about.subtitle}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/lovable-uploads/93c59eae-410f-4380-a222-312d8d41af41.jpg"
                  alt="Binyan team working with clients"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
                {about.missionTitle}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {about.missionText}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Specialisations */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              {about.specialisationsTitle}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {about.specialisationsSubtitle}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {specialisations.map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
                className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/50 shadow-sm"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon size={20} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              {about.valuesTitle}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={22} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              {about.teamTitle}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {about.teamSubtitle}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, i) => {
              const cardContent = (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i + 1}
                  className="group text-center p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                >
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 text-2xl font-bold text-primary group-hover:bg-primary/20 transition-colors">
                    {member.initials}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-sm text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                </motion.div>
              );

              return member.slug ? (
                <Link key={i} to={`/team/${member.slug}`} className="no-underline">
                  {cardContent}
                </Link>
              ) : (
                cardContent
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              {about.ctaTitle}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {about.ctaText}
            </p>
            <Button size="lg" asChild className="rounded-full px-8">
              <Link to="/contact" className="inline-flex items-center gap-2">
                {about.ctaButton} <ArrowRight size={18} />
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
