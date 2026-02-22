import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string | null;
  external_url: string | null;
  created_at: string;
}

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState("all");
  const { t } = useLanguage();
  const portalT = (t as any).portal || {};

  useEffect(() => {
    supabase.from("resources").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setResources(data);
    });
  }, []);

  const categories = ["all", ...Array.from(new Set(resources.map((r) => r.category)))];
  const filtered = filter === "all" ? resources : resources.filter((r) => r.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl mb-2 flex items-center gap-3">
              <BookOpen className="text-primary" size={28} />
              {portalT.resourceLibrary || "Resource Library"}
            </h1>
            <p className="text-muted-foreground mb-8">{portalT.resourceSubtitle || "Articles, guides, and materials to support your journey."}</p>
          </motion.div>

          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                size="sm"
                className="rounded-full capitalize"
                onClick={() => setFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="mx-auto text-muted-foreground mb-4" size={40} />
              <p className="text-muted-foreground">{portalT.noResources || "No resources available yet."}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((resource, i) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl border border-border/50 p-6 flex flex-col"
                >
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">{resource.category}</span>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{resource.title}</h3>
                  {resource.description && <p className="text-sm text-muted-foreground mb-4 flex-1">{resource.description}</p>}
                  <div className="flex gap-2 mt-auto">
                    {resource.file_url && (
                      <Button asChild variant="outline" size="sm" className="rounded-full gap-2">
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer"><Download size={14} /> Download</a>
                      </Button>
                    )}
                    {resource.external_url && (
                      <Button asChild variant="outline" size="sm" className="rounded-full gap-2">
                        <a href={resource.external_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> View</a>
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Resources;
