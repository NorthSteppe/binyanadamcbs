import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ClipboardList } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FBAIntakeManager from "@/components/clinical/FBAIntakeManager";

const FBAIntakes = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <Link
            to="/staff"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to staff portal
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                <ClipboardList size={22} />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif text-foreground">
                Parent FBA intakes
              </h1>
            </div>
            <p className="text-muted-foreground mb-8 ms-14 font-light">
              Send the open-ended Hanley FBA interview to a parent or carer and review their answers
              once submitted.
            </p>
          </motion.div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <FBAIntakeManager />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FBAIntakes;
