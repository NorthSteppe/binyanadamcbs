import ServicePageLayout from "@/components/ServicePageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import educationHero from "@/assets/education-hero.jpg";

const Education = () => {
  const { t } = useLanguage();

  return (
    <ServicePageLayout
      title={t.education.title}
      subtitle={t.education.subtitle}
      tagline={t.education.tagline}
      bgColorClass="bg-education"
      accentColorClass="bg-education"
      textOnBgClass="text-education-foreground"
      heroImage={educationHero}
      services={t.education.services as unknown as string[]}
      packages={t.education.packages as unknown as { name: string; description: string; includes: string[]; ideal: string }[]}
      ctaText={t.education.ctaText}
    />
  );
};

export default Education;
