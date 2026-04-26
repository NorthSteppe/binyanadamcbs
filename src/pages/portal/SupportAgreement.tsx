import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const SupportAgreement = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold">Support Agreement</h1>
          <p className="text-sm text-muted-foreground mt-1">
            The contract that formalises our work together.
          </p>

          <Card className="mt-6 p-8 text-center space-y-3">
            <Sparkles className="mx-auto text-primary" />
            <h2 className="text-lg font-semibold">Coming next</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              An editable template, e-signature capture, and PDF export will appear here. Your basic details from the
              FBA intake will be used to pre-fill the agreement automatically.
            </p>
            <Link to="/portal/support-pathway" className="text-sm text-primary hover:underline">← Back to your pathway</Link>
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SupportAgreement;
