import ServicePageLayout from "@/components/ServicePageLayout";
import organisationsHero from "@/assets/organisations-hero.jpg";

const Organisations = () => (
  <ServicePageLayout
    title="Behavioural Science Applied to Systems"
    subtitle="Organisations & Leadership"
    tagline="Evidence-based organisational behaviour management. We help leadership teams build culture, governance, and performance frameworks that work."
    bgColorClass="bg-business"
    accentColorClass="bg-business"
    textOnBgClass="text-business-foreground"
    heroImage={organisationsHero}
    services={[
      "Organisational Behaviour Management (OBM)",
      "Behaviour Strategy Design",
      "Culture Change Projects",
      "Staff Performance Systems",
      "Risk Governance Frameworks",
      "Clinical Governance Structures",
      "Safeguarding & Behaviour Audits",
      "Behaviour Data Systems",
    ]}
    packages={[
      {
        name: "Behaviour Systems Audit",
        description: "A thorough audit of your current behavioural systems, policies, and practices.",
        includes: ["Document review", "Staff interviews", "Observational assessment", "Audit report with recommendations"],
        ideal: "Organisations seeking an independent behavioural review",
      },
      {
        name: "Strategic Implementation Partnership",
        description: "A collaborative programme to design and implement behaviour-led systems across your organisation.",
        includes: ["Strategy co-design", "Policy development", "Staff training", "Implementation support", "Quarterly reviews"],
        ideal: "Organisations committing to systemic behavioural change",
      },
      {
        name: "Clinical Supervision Framework",
        description: "Design and embed a clinical supervision framework for your practitioner team.",
        includes: ["Framework design", "Supervisor training", "Documentation templates", "Quality assurance system"],
        ideal: "Care providers and clinical services",
      },
      {
        name: "Training & Accreditation Pathways",
        description: "Bespoke training programmes aligned to your organisation's needs and professional standards.",
        includes: ["Training needs analysis", "Programme design", "Delivery & assessment", "Accreditation guidance"],
        ideal: "Organisations investing in workforce development",
      },
    ]}
    ctaText="Request an Organisational Assessment"
  />
);

export default Organisations;
