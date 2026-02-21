import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast({ title: t.contact.successTitle, description: t.contact.successDescription });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-sans font-semibold uppercase tracking-widest text-accent mb-3">{t.contact.tagline}</p>
              <h1 className="text-4xl md:text-5xl mb-6">{t.contact.title}</h1>
              <p className="text-muted-foreground leading-relaxed mb-10 max-w-md">
                {t.contact.subtitle}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={18} className="text-accent" />
                  <span className="text-muted-foreground">{t.contact.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={18} className="text-accent" />
                  <a href="mailto:info@binyancbs.co.uk" className="text-muted-foreground hover:text-foreground transition-colors">
                    info@binyancbs.co.uk
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="bg-card rounded-2xl p-8 border border-border space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1.5 block">{t.contact.nameLabel}</label>
                  <Input required placeholder={t.contact.namePlaceholder} />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1.5 block">{t.contact.emailLabel}</label>
                  <Input required type="email" placeholder={t.contact.emailPlaceholder} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1.5 block">{t.contact.interestedLabel}</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue=""
                >
                  <option value="" disabled>{t.contact.selectService}</option>
                  {t.contact.serviceOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1.5 block">{t.contact.messageLabel}</label>
                <Textarea required rows={5} placeholder={t.contact.messagePlaceholder} />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? t.contact.sending : t.contact.sendButton}
              </Button>
            </motion.form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
