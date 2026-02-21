import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: t.signup.title, description: error.message, variant: "destructive" });
    } else {
      toast({ title: t.signup.successTitle, description: t.signup.successDescription });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-32 pb-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto px-6"
        >
          <div className="bg-card rounded-3xl p-10 border border-border/50">
            <h1 className="text-3xl md:text-4xl mb-2 text-center">{t.signup.title}</h1>
            <p className="text-muted-foreground text-center mb-8">{t.signup.subtitle}</p>
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">{t.signup.emailLabel}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.signup.passwordLabel}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="rounded-xl" />
              </div>
              <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
                {loading ? t.signup.loading : t.signup.button}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground text-center mt-6">
              {t.signup.hasAccount}{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">{t.signup.logInLink}</Link>
            </p>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default Signup;
