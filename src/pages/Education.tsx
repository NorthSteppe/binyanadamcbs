import ServicePageLayout from "@/components/ServicePageLayout";

const Education = () => (
  <ServicePageLayout
    title="PBS in Education"
    subtitle="Schools & Education Settings"
    tagline="Whole-school behavioural culture built on clarity and dignity. From assessment to implementation, we build systems that sustain."
    bgColorClass="bg-education"
    accentColorClass="bg-education"
    textOnBgClass="text-education-foreground"
    services={[
      "Whole-School PBS Framework Design",
      "Behaviour Policy Development",
      "Functional Behaviour Assessment (FBA)",
      "Individual Behaviour Support Plans",
      "Risk Assessment & Management Plans",
      "Staff Training & CPD",
      "Data-Driven Decision Systems",
      "Multi-Disciplinary Collaboration",
      "Behaviour Strategy for SLT",
      "Behaviour Culture Change Projects",
    ]}
    packages={[
      {
        name: "Starter School Package",
        description: "An initial assessment to understand your school's behavioural landscape and identify priorities.",
        includes: ["Behavioural audit", "Staff consultation", "Priority report with recommendations"],
        ideal: "Schools exploring PBS for the first time",
      },
      {
        name: "Assessment & Strategic Roadmap",
        description: "Deep-dive assessment with a structured implementation roadmap aligned to your school's values.",
        includes: ["Comprehensive FBAs", "Staff survey & analysis", "Strategic roadmap document", "SLT briefing"],
        ideal: "Schools ready to commit to cultural change",
      },
      {
        name: "Full PBS Implementation",
        description: "End-to-end design and delivery of a whole-school PBS framework with ongoing support.",
        includes: ["Framework design", "Policy development", "Staff training programme", "Data systems", "Termly reviews"],
        ideal: "Schools seeking transformational, sustained change",
      },
      {
        name: "Ongoing Behaviour Leadership Partnership",
        description: "Retained advisory support for your leadership team with regular consultation and supervision.",
        includes: ["Monthly SLT consultations", "Case supervision", "Training updates", "Data review sessions"],
        ideal: "Schools maintaining and evolving their PBS culture",
      },
    ]}
    ctaText="Request a School Assessment"
  />
);

export default Education;
