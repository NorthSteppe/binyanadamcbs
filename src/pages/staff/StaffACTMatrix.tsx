import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ACTMatrix from "@/components/portal/ACTMatrix";

const StaffACTMatrix = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/staff" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
              <ArrowLeft size={16} /> Back to Therapist Portal
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">ACT Matrix</h1>
            <p className="text-muted-foreground mb-10">Fill in ACT Matrix for your assigned clients.</p>
          </motion.div>
          <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8">
            <ACTMatrix />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default StaffACTMatrix;
