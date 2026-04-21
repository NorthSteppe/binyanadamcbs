import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Shield, Users, LayoutDashboard, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import BadgeMarquee from "@/components/BadgeMarquee";
import LandingCalendarWidget from "@/components/LandingCalendarWidget";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const Index = () => {
  const { t } = useLanguage();
  const { user, isAdmin, isTeamMember } = useAuth();
  const [showBigLogo, setShowBigLogo] = useState(true);
  const [quote, setQuote] = useState({ text: "", author: "" });

  const handleQuoteChange = useCallback((q: { text: string; author: string }) => {
    setQuote(q);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBigLogo(window.scrollY <= 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header hidelogo={showBigLogo} />

      {/* Full-bleed hero section */}
      <section className="relative min-h-screen flex items-end">
        {/* Background carousel */}
        <div className="absolute inset-0 z-0">
          <HeroCarousel onQuoteChange={handleQuoteChange} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 to-transparent" />
        </div>

        <div className="container relative z-10 pb-24 md:pb-32 pt-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            {/* Logo */}
            <div className={`mb-8 transition-opacity duration-500 ${showBigLogo ? "opacity-100" : "opacity-0"}`}>
              <EditableImage
                contentKey="landing.logo"
                defaultSrc="/lovable-uploads/ed0abcc5-2b9d-4294-a3b6-3d6945c02959.png"
                alt="Binyan Adam"
                className="h-12 md:h-14 w-auto inline-block"
                imgClassName="h-12 md:h-14 w-auto mix-blend-multiply dark:mix-blend-screen dark:invert"
              />
            </div>

            <EditableText
              contentKey="landing.title"
              defaultValue={t.landing.title}
              as="h1"
              className="text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.05] mb-6 font-display tracking-tight"
            />

            <EditableText
              contentKey="landing.subtitle"
              defaultValue={t.landing.subtitle}
              as="p"
              className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-12 text-[14px] font-medium shadow-apple-lg">
                <Link to="/services" className="inline-flex items-center gap-3">
                  <EditableText contentKey="landing.exploreBtn" defaultValue={t.landing.exploreServices} as="span" /> <ArrowRight size={16} />
                </Link>
              </Button>

              {user ? (
                <Button size="lg" variant="outline" asChild className="border-border text-foreground hover:bg-accent rounded-full px-8 h-12 text-[14px] font-medium">
                  <Link to={isAdmin ? "/admin" : isTeamMember ? "/staff" : "/portal"} className="inline-flex items-center gap-3">
                    {isAdmin ? <><Shield size={16} /> Admin Portal</> : isTeamMember ? <><Users size={16} /> Therapist Portal</> : <><LayoutDashboard size={16} /> My Portal</>}
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="outline" asChild className="border-border text-foreground hover:bg-accent rounded-full px-8 h-12 text-[14px] font-medium">
                  <Link to="/contact" className="inline-flex items-center gap-3">
                    <EditableText contentKey="landing.contactBtn" defaultValue="Get in Touch" as="span" />
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>

          {/* Quote overlay */}
          {(quote.text || t.landing.quote) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute bottom-24 right-8 hidden xl:block max-w-xs"
            >
              <blockquote className="text-sm text-foreground/50 italic leading-relaxed border-l-2 border-foreground/10 pl-4">
                <EditableText contentKey="landing.quoteText" defaultValue={quote.text || t.landing.quote} as="span" />
              </blockquote>
              <p className="text-xs text-foreground/30 mt-2 pl-4">
                <EditableText contentKey="landing.quoteAuthor" defaultValue={quote.author || t.landing.quoteAuthor} as="span" />
              </p>
            </motion.div>
          )}
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 right-8 z-10 hidden md:flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 [writing-mode:vertical-lr]">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-muted-foreground/30 to-transparent" />
        </motion.div>
      </section>

      {/* Badge marquee */}
      <BadgeMarquee />

      {/* Personal calendar for signed-in users */}
      {user && <LandingCalendarWidget />}

      {/* Blog CTA */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-10 md:p-16 text-center"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-foreground/10 mb-6">
                <BookOpen className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 font-display">
                Insights &amp; Resources
              </h2>
              <p className="text-primary-foreground/70 max-w-lg mx-auto mb-8 text-base md:text-lg font-light">
                Evidence-based strategies for schools, families, and professionals — translated into practical, everyday systems.
              </p>
              <Button size="lg" asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-10 h-13 text-[15px] font-medium shadow-apple-lg">
                <Link to="/insights" className="inline-flex items-center gap-3">
                  Explore the Blog <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-foreground/5" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-primary-foreground/5" />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
