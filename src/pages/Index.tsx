import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroLanding from "@/assets/hero-landing.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero */}
      <section className="flex-1 flex items-center pt-20">
        <div className="container py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] mb-6">
                Welcome to Binyan
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg">
                Constructional Behaviour Analysis for Education, Families, Therapy, and Organisations.
                Grounded in ethics. Driven by evidence. Built to last.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="rounded-full px-8">
                  <Link to="/services" className="inline-flex items-center gap-2">
                    Explore Services <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-full px-8">
                  <Link to="/login" className="inline-flex items-center gap-2">
                    <LogIn size={18} /> Log In
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" asChild className="rounded-full px-8">
                  <Link to="/signup" className="inline-flex items-center gap-2">
                    <UserPlus size={18} /> Sign Up
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={heroLanding} 
                    alt="A caring professional supporting a child in a warm, bright setting" 
                    className="w-full h-auto object-cover aspect-square"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-6 shadow-lg border border-border/50 max-w-xs">
                  <blockquote className="text-sm text-foreground italic leading-relaxed mb-2">
                    "We do not remove behaviour. We build capability."
                  </blockquote>
                  <p className="text-xs text-muted-foreground font-medium">Adam Dayan, MSc</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
