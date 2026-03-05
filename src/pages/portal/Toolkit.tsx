import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingAIChat from "@/components/FloatingAIChat";
import PomodoroTimer from "@/components/portal/PomodoroTimer";

const Toolkit = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                <Timer size={22} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Toolkit</h1>
            </div>
            <p className="text-muted-foreground mb-12 ml-14">Tools to support your focus and wellbeing.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="bg-card border border-border/50 rounded-2xl p-8">
              <h2 className="text-lg font-semibold text-foreground mb-6 text-center">Pomodoro Timer</h2>
              <PomodoroTimer />
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
      <FloatingAIChat />
    </div>
  );
};

export default Toolkit;
