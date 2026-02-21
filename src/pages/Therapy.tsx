import ServicePageLayout from "@/components/ServicePageLayout";
import therapyHero from "@/assets/therapy-hero.jpg";

const Therapy = () => (
  <ServicePageLayout
    title="Understanding Behaviour Through Context, Not Blame"
    subtitle="Therapy & Intervention"
    tagline="ACT-informed, constructional, and person-centred. We help individuals build the skills and flexibility to live a values-driven life."
    bgColorClass="bg-therapy"
    accentColorClass="bg-therapy"
    textOnBgClass="text-therapy-foreground"
    heroImage={therapyHero}
    services={[
      "ACT-Informed Therapy",
      "Constructional Behavioural Intervention",
      "Emotional Regulation Support",
      "Parent Coaching",
      "Functional Communication Training",
      "Anxiety & Avoidance Patterns",
      "Values-Based Behaviour Building",
      "Trauma-Informed Behaviour Planning",
    ]}
    packages={[
      {
        name: "Initial Behavioural Assessment",
        description: "A comprehensive assessment to understand the individual's context, needs, and strengths.",
        includes: ["Clinical interview", "Functional assessment", "Contextual analysis", "Written formulation & recommendations"],
        ideal: "Individuals or families seeking clarity before intervention",
      },
      {
        name: "Short-Term Focused Intervention",
        description: "A structured 8–12 week programme targeting specific behavioural goals.",
        includes: ["Weekly sessions", "Collaborative goal setting", "Skill building activities", "Progress reviews"],
        ideal: "Specific, focused concerns with clear goals",
      },
      {
        name: "Extended Therapeutic Partnership",
        description: "Longer-term support for complex or multi-layered needs.",
        includes: ["Flexible session schedule", "Ongoing formulation", "Multi-system coordination", "Regular outcome reviews"],
        ideal: "Complex presentations requiring sustained, adaptive support",
      },
      {
        name: "Parent Guidance Package",
        description: "Empowering parents with practical strategies grounded in behavioural science.",
        includes: ["Parent coaching sessions", "Contextual analysis at home", "Strategy development", "Follow-up support"],
        ideal: "Parents seeking evidence-based guidance and confidence",
      },
    ]}
    ctaText="Book a Consultation"
  />
);

export default Therapy;
