import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, Timer, Grid3x3, Headphones } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingAIChat from "@/components/FloatingAIChat";

const clientTools = [
  { label: "ACT Matrix", path: "/portal/toolkit/act-matrix", icon: Grid3x3, description: "Map your values, obstacles, and committed actions using the ACT framework." },
  { label: "Pomodoro Timer", path: "/portal/toolkit/pomodoro", icon: Timer, description: "Stay focused with timed work and break intervals." },
  { label: "Mindfulness Sounds", path: "/portal/toolkit/mindfulness", icon: Headphones, description: "Ambient nature sounds for relaxation and mindful breathing exercises." },
];

const Toolkit = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                <Wrench size={22} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Client Toolkit</h1>
            </div>
            <p className="text-muted-foreground mb-10 ml-14">Tools to support your focus and wellbeing.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {clientTools.map((tool, i) => (
              <motion.div key={tool.path} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Link to={tool.path} className="bg-card border border-border/50 rounded-2xl p-6 flex items-start gap-4 hover:border-primary/30 hover:shadow-sm transition-all block h-full">
                  <div className="bg-primary/10 text-primary rounded-xl p-3 shrink-0">
                    <tool.icon size={22} />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-card-foreground">{tool.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
      <FloatingAIChat />
    </div>
  );
};

export default Toolkit;
