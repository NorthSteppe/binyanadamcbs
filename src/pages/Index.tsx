import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Shield, Users, LayoutDashboard, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import { motion } from "framer-motion";

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
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
        </div>

        <div className="container relative z-10 pb-24 md:pb-32 pt-40">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            {/* Logo */}
            <div className="mb-8">
              <img
                src="/lovable-uploads/ed0abcc5-2b9d-4294-a3b6-3d6945c02959.png"
                alt="Binyan Adam"
                className={`h-14 md:h-16 transition-opacity duration-500 ${showBigLogo ? "opacity-100" : "opacity-0"}`}
              />
            </div>

            <EditableText
              contentKey="landing.title"
              defaultValue={t.landing.title}
              as="h1"
              className="text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.05] mb-6 font-serif"
            />

            <EditableText
              contentKey="landing.subtitle"
              defaultValue={t.landing.subtitle}
              as="p"
              className="text-base md:text-lg text-foreground/60 leading-relaxed mb-10 max-w-lg font-light"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="bg-foreground text-background hover:bg-foreground/90 rounded-none px-8 h-12 text-[13px] uppercase tracking-wider font-sans">
                <Link to="/services" className="inline-flex items-center gap-3">
                  {t.landing.exploreServices} <ArrowRight size={16} />
                </Link>
              </Button>

              {user ? (
                <Button size="lg" variant="outline" asChild className="border-foreground/20 text-foreground hover:bg-foreground/10 rounded-none px-8 h-12 text-[13px] uppercase tracking-wider font-sans">
                  <Link to={isAdmin ? "/admin" : isTeamMember ? "/staff" : "/portal"} className="inline-flex items-center gap-3">
                    {isAdmin ? <><Shield size={16} /> Admin Portal</> : isTeamMember ? <><Users size={16} /> Therapist Portal</> : <><LayoutDashboard size={16} /> My Portal</>}
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="outline" asChild className="border-foreground/20 text-foreground hover:bg-foreground/10 rounded-none px-8 h-12 text-[13px] uppercase tracking-wider font-sans">
                  <Link to="/contact" className="inline-flex items-center gap-3">
                    Get in Touch
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
              <blockquote className="text-sm text-foreground/50 italic leading-relaxed border-l border-primary/30 pl-4">
                {quote.text || t.landing.quote}
              </blockquote>
              <p className="text-xs text-foreground/30 mt-2 pl-4">{quote.author || t.landing.quoteAuthor}</p>
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
          <span className="text-[10px] uppercase tracking-[0.3em] text-foreground/30 [writing-mode:vertical-lr]">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-foreground/30 to-transparent" />
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
