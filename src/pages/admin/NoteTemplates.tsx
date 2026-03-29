import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NoteTemplateManager from "@/components/NoteTemplateManager";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const NoteTemplates = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                <FileText size={22} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Note Templates</h1>
                <p className="text-muted-foreground text-sm">Design structured templates for session notes and voice transcription summaries</p>
              </div>
            </div>
          </motion.div>
          <NoteTemplateManager mode="manage" />
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default NoteTemplates;
