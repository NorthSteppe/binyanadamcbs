import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { School, Heart, Users, Building2, GraduationCap, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import heroBg from "@/assets/hero-bg.jpg";

const credentials = [
"UKBA (Cert) Registered",
"15+ Years' Experience",
"Senior Leadership Team Member",
"MSc Applied Behaviour Analysis",
"MEd Psychology of Education (candidate)",
"UK-SBA & ACBS Member"];


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/80" />
        </div>
        <div className="container relative z-10 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl">

            <h1 className="text-4xl lg:text-6xl text-primary-foreground leading-tight mb-6 text-center md:text-6xl font-extrabold">Welcome To Our Website

            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed mb-10 max-w-2xl">
              Constructional Behaviour Analysis for Education, Families, Therapy, and Organisations. 
              Grounded in ethics. Driven by evidence. Built to last.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/education">Explore Services</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/contact">Book a Consultation</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16">

            <p className="text-sm font-sans font-semibold uppercase tracking-widest text-accent mb-3">What We Do</p>
            <h2 className="text-3xl md:text-4xl mb-4">Specialist Behavioural Services</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Five distinct pathways of support, each designed with clarity, dignity, and measurable outcomes at the centre.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              title="PBS in Education"
              description="Whole-school behavioural culture built on clarity and dignity. From policy to practice."
              icon={School}
              path="/education"
              colorClass="bg-education text-education-foreground" />

            <ServiceCard
              title="Therapy"
              description="Understanding behaviour through context, not blame. ACT-informed, constructional, and person-centred."
              icon={Heart}
              path="/therapy"
              colorClass="bg-therapy text-therapy-foreground" />

            <ServiceCard
              title="Family Support"
              description="Support for families navigating complexity. Practical, personalised, and blame-free."
              icon={Users}
              path="/families"
              colorClass="bg-family text-family-foreground" />

            <ServiceCard
              title="Organisations"
              description="Behavioural science applied to systems. Culture change, governance, and performance."
              icon={Building2}
              path="/organisations"
              colorClass="bg-business text-business-foreground" />

            <ServiceCard
              title="Supervision"
              description="Developing thoughtful, ethical practitioners. UKBA supervision, mentoring, and reflective practice."
              icon={GraduationCap}
              path="/supervision"
              colorClass="bg-supervision text-supervision-foreground" />

          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-24 bg-secondary">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}>

              <p className="text-sm font-sans font-semibold uppercase tracking-widest text-accent mb-3">Our Approach</p>
              <h2 className="text-3xl md:text-4xl mb-6">Constructional, Not Reductional</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We don't seek to suppress, control, or eliminate behaviour. Instead, we build new capabilities, 
                skills, and repertoires that make meaningful change possible. Every intervention starts with 
                understanding context and ends with measurable growth.
              </p>
              <div className="space-y-4">
                {[
                "Build repertoires, don't suppress behaviour",
                "Behaviour as communication, not defiance",
                "System-wide thinking for sustainable change",
                "Ethical, evidence-based, and culturally sensitive"].
                map((point) =>
                <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="text-accent mt-0.5 flex-shrink-0" size={18} />
                    <p className="text-sm text-foreground">{point}</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card rounded-2xl p-10 border border-border">

              <blockquote className="text-2xl leading-relaxed text-card-foreground mb-6 italic">
                "We do not remove behaviour. We build capability."
              </blockquote>
              <div>
                <p className="font-sans font-semibold text-card-foreground">Adam Dayan, MSc</p>
                <p className="text-sm text-muted-foreground">UKBA (Cert) · Clinical Behaviour Analyst & Consultant</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-24">
        <div className="container text-center">
          <p className="text-sm font-sans font-semibold uppercase tracking-widest text-accent mb-3">Evidence & Credentials</p>
          <h2 className="text-3xl md:text-4xl mb-12">Grounded in Science. Led with Integrity.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {credentials.map((cred, i) =>
            <motion.div
              key={cred}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-secondary rounded-lg px-5 py-4 text-sm font-medium text-secondary-foreground">

                {cred}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}>

            <h2 className="text-3xl md:text-4xl text-primary-foreground mb-4">Let's Start a Conversation</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">
              Whether you're a school, family, organisation, or practitioner — we're here to help build capability.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contact" className="inline-flex items-center gap-2">
                Book a Consultation <ArrowRight size={18} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>);

};

export default Index;