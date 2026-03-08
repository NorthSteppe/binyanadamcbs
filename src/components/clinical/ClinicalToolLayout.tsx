import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

interface ClinicalToolLayoutProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: ReactNode;
  backPath?: string;
}

const ClinicalToolLayout = ({ title, description, icon: Icon, children, backPath = "/staff/clinical-tools" }: ClinicalToolLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to={backPath} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft size={16} /> Back to Clinical Tools
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                <Icon size={22} />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif text-foreground">{title}</h1>
            </div>
            <p className="text-muted-foreground mb-8 ml-14 font-light">{description}</p>
          </motion.div>
          {children}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ClinicalToolLayout;
