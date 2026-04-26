import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ClientProfileHeader from "@/components/clinical/ClientProfileHeader";
import SupportPathwayBoard from "@/components/clinical/SupportPathwayBoard";

const PortalSupportPathway = () => {
  const { user } = useAuth();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setName(data?.full_name ?? ""));
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Your Support Pathway</h1>
            <p className="text-sm text-muted-foreground mt-1">
              A clear, step-by-step view of your journey with us. Tap any step to open the relevant tool or document.
            </p>
          </div>

          <ClientProfileHeader clientId={user.id} audience="client" fallbackName={name} />
          <SupportPathwayBoard clientId={user.id} pathwayKind="support" audience="client" />
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PortalSupportPathway;
