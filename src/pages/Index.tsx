import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
              className="hidden lg:flex items-center justify-center"
            >
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 rounded-full bg-primary/10" />
                <div className="absolute inset-8 rounded-full bg-primary/15" />
                <div className="absolute inset-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="text-center px-8">
                    <blockquote className="text-xl text-foreground italic leading-relaxed mb-3">
                      "We do not remove behaviour. We build capability."
                    </blockquote>
                    <p className="text-sm text-muted-foreground font-medium">Adam Dayan, MSc</p>
                  </div>
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
