import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative flex-1 flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/80" />
        </div>
        <div className="container relative z-10 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl text-primary-foreground leading-tight mb-6 font-extrabold">
              Welcome To Binyan
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed mb-10 max-w-2xl mx-auto">
              Constructional Behaviour Analysis for Education, Families, Therapy, and Organisations.
              Grounded in ethics. Driven by evidence. Built to last.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/services" className="inline-flex items-center gap-2">
                  Explore Services <ArrowRight size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
