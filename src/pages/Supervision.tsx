import ServicePageLayout from "@/components/ServicePageLayout";
import supervisionHero from "@/assets/supervision-hero.jpg";

const Supervision = () => (
  <ServicePageLayout
    title="Developing Thoughtful, Ethical Practitioners"
    subtitle="Supervision & Development"
    tagline="Reflective, rigorous, and values-aligned. Supporting behaviour analysts and practitioners to grow with clarity and integrity."
    bgColorClass="bg-supervision"
    accentColorClass="bg-supervision"
    textOnBgClass="text-supervision-foreground"
    heroImage={supervisionHero}
    services={[
      "UKBA Supervision",
      "Case Formulation Supervision",
      "Constructional Approach Mentoring",
      "ACT Integration Support",
      "Ethical Consultation",
      "Practitioner Development Pathways",
      "Reflective Practice Groups",
    ]}
    packages={[
      {
        name: "Foundational Supervision",
        description: "Structured supervision for developing practitioners building core competencies.",
        includes: ["Monthly supervision sessions", "Case discussion", "Competency tracking", "Written feedback"],
        ideal: "Early-career practitioners and trainees",
      },
      {
        name: "Advanced Clinical Supervision",
        description: "In-depth clinical supervision for experienced practitioners managing complex caseloads.",
        includes: ["Fortnightly sessions", "Complex case formulation", "Ethical decision-making support", "Professional development planning"],
        ideal: "Experienced practitioners seeking clinical depth",
      },
      {
        name: "Leadership Supervision",
        description: "Supervision for clinical leaders managing teams and organisational behaviour strategy.",
        includes: ["Strategic supervision sessions", "Leadership reflection", "Team dynamics consultation", "Governance guidance"],
        ideal: "Clinical leads and service managers",
      },
      {
        name: "Group Supervision Circles",
        description: "Facilitated group supervision for peer learning and reflective practice.",
        includes: ["Monthly group sessions", "Structured reflection framework", "Peer case discussion", "Facilitated learning"],
        ideal: "Teams and peer groups seeking shared professional growth",
      },
    ]}
    ctaText="Apply for Supervision"
  />
);

export default Supervision;
