import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PomodoroTimer from "@/components/portal/PomodoroTimer";
import { useLanguage } from "@/i18n/LanguageContext";

const ToolkitPomodoro = () => {
  const { t } = useLanguage();
  const portalT = (t as any).portalPomodoro || {};
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/portal/toolkit" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
              <ArrowLeft size={16} /> Back to Toolkit
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{portalT.title || "Pomodoro Timer"}</h1>
            <p className="text-muted-foreground mb-10">{portalT.subtitle || "Stay focused with timed work and break intervals."}</p>
          </motion.div>
          <div className="bg-card border border-border/50 rounded-2xl p-8">
            <PomodoroTimer />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ToolkitPomodoro;
