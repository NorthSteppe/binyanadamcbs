import ServicePageLayout from "@/components/ServicePageLayout";

const Families = () => (
  <ServicePageLayout
    title="Support for Families Navigating Complexity"
    subtitle="Family Support"
    tagline="Practical, personalised, and blame-free. We help families build consistency, communication, and confidence at home."
    bgColorClass="bg-family"
    accentColorClass="bg-family"
    textOnBgClass="text-family-foreground"
    services={[
      "Behavioural Assessment at Home",
      "Parent Strategy Coaching",
      "Sibling Dynamics Support",
      "Consistency Planning",
      "Home-School Alignment",
      "Crisis Planning & De-Escalation Strategies",
    ]}
    packages={[
      {
        name: "Clarity Session",
        description: "A single in-depth session to explore concerns, identify priorities, and map next steps.",
        includes: ["90-minute consultation", "Contextual discussion", "Written summary with next steps"],
        ideal: "Families wanting clarity before committing to a programme",
      },
      {
        name: "Home Behaviour Blueprint",
        description: "A structured assessment resulting in a tailored behaviour support plan for the home environment.",
        includes: ["Home observation", "Family interview", "Written behaviour plan", "Strategy coaching session"],
        ideal: "Families ready for a structured plan at home",
      },
      {
        name: "Family Support Programme",
        description: "A 6–10 week programme with regular coaching, strategy implementation, and progress reviews.",
        includes: ["Weekly coaching sessions", "Strategy development", "Home-school coordination", "Progress tracking"],
        ideal: "Families navigating ongoing or complex needs",
      },
      {
        name: "Ongoing Behaviour Coaching",
        description: "Retained support with flexible scheduling for families with evolving needs.",
        includes: ["Fortnightly sessions", "Responsive crisis support", "Plan adjustments", "Review meetings"],
        ideal: "Families seeking sustained, adaptive guidance",
      },
    ]}
    ctaText="Speak to Us"
  />
);

export default Families;
