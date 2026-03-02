import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogIn, UserPlus, CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";

const Index = () => {
  const { t } = useLanguage();
  const [showBigLogo, setShowBigLogo] = useState(true);

  useEffect(() => {
    const onScroll = () => setShowBigLogo(window.scrollY <= 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header hidelogo={showBigLogo} />

      <section className="flex-1 flex items-center pt-20">
        <div className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text column */}
            <div>
              <div className="mb-6">
                <img
                  src="/lovable-uploads/ed0abcc5-2b9d-4294-a3b6-3d6945c02959.png"
                  alt="Binyan Adam"
                  className={`h-16 md:h-20 drop-shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-opacity duration-300 ${showBigLogo ? "opacity-100" : "opacity-0"}`}
                />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-4">
                {t.landing.title}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                {t.landing.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild className="rounded-full px-8">
                  <Link to="/services" className="inline-flex items-center gap-2">
                    {t.landing.exploreServices} <CirclePlus size={18} />
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
            </div>

            {/* Image carousel column */}
            <div className="hidden lg:block">
              <div className="relative">
                <HeroCarousel />
                <div className="absolute -bottom-6 -left-6 rtl:-left-auto rtl:-right-6 bg-card rounded-2xl p-5 shadow-lg border border-border/50 max-w-xs">
                  <blockquote className="text-sm text-foreground italic leading-relaxed mb-1">
                    {t.landing.quote}
                  </blockquote>
                  <p className="text-xs text-muted-foreground font-medium">{t.landing.quoteAuthor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
