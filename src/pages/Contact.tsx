import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <section className="pt-40 pb-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-20">
            <ScrollReveal direction="left">
              <p className="text-[11px] font-sans uppercase tracking-[0.25em] text-primary mb-4">{t.contact.tagline}</p>
              <h1 className="text-5xl md:text-6xl font-serif mb-6">{t.contact.title}</h1>
              <p className="text-foreground/60 leading-relaxed mb-12 max-w-md font-light">{t.contact.subtitle}</p>

              <div className="space-y-4">
                <ScrollReveal delay={0.1} distance={12}>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={16} className="text-primary" />
                    <span className="text-foreground/50 font-light">{t.contact.location}</span>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.15} distance={12}>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={16} className="text-primary" />
                    <a href="mailto:adamdayan@bacbs.com" className="text-foreground/50 hover:text-primary transition-colors duration-300 font-light">
                      adamdayan@bacbs.com
                    </a>
                  </div>
                </ScrollReveal>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.1}>
              <form
                onSubmit={handleSubmit}
                className="bg-card border border-border p-8 space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2 block">{t.contact.nameLabel}</label>
                    <Input required placeholder={t.contact.namePlaceholder} className="rounded-none bg-background border-border h-11" />
                  </div>
                  <div>
                    <label className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2 block">{t.contact.emailLabel}</label>
                    <Input required type="email" placeholder={t.contact.emailPlaceholder} className="rounded-none bg-background border-border h-11" />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2 block">{t.contact.interestedLabel}</label>
                  <select
                    className="w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    defaultValue=""
                  >
                    <option value="" disabled>{t.contact.selectService}</option>
                    {t.contact.serviceOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2 block">{t.contact.messageLabel}</label>
                  <Textarea required rows={5} placeholder={t.contact.messagePlaceholder} className="rounded-none bg-background border-border" />
                </div>
                <Button type="submit" className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 h-11 text-[13px] uppercase tracking-wider" size="lg" disabled={submitting}>
                  {submitting ? t.contact.sending : t.contact.sendButton}
                </Button>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
