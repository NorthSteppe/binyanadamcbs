import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroLanding from "@/assets/hero-landing.jpg";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <section className="flex-1 flex items-center pt-20">
        <div className="container py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}>

              <h1 className="text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] mb-6">
                {t.landing.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg">
                {t.landing.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="rounded-full px-8">
                  <Link to="/services" className="inline-flex items-center gap-2">
                    {t.landing.exploreServices} <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-full px-8">
                  <Link to="/login" className="inline-flex items-center gap-2">
                    <LogIn size={18} /> {t.landing.logIn}
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" asChild className="rounded-full px-8">
                  <Link to="/signup" className="inline-flex items-center gap-2">
                    <UserPlus size={18} /> {t.landing.signUp}
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block">

              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img

                    alt="A professional guiding a child in a hands-on learning activity"
                    className="w-full h-auto object-cover aspect-square" src="/lovable-uploads/20251210_082121.jpg" />

                </div>
                <div className="absolute -bottom-6 -left-6 rtl:-left-auto rtl:-right-6 bg-card rounded-2xl p-6 shadow-lg border border-border/50 max-w-xs">
                  <blockquote className="text-sm text-foreground italic leading-relaxed mb-2">
                    {t.landing.quote}
                  </blockquote>
                  <p className="text-xs text-muted-foreground font-medium">{t.landing.quoteAuthor}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>);

};

export default Index;