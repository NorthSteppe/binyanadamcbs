import ServicePageLayout from "@/components/ServicePageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import familyHero from "@/assets/family-hero.jpg";

const Families = () => {
  const { t } = useLanguage();

  return (
    <ServicePageLayout
      title={t.families.title}
      subtitle={t.families.subtitle}
      tagline={t.families.tagline}
      bgColorClass="bg-family"
      accentColorClass="bg-family"
      textOnBgClass="text-family-foreground"
      heroImage={familyHero}
      services={t.families.services as unknown as string[]}
      packages={t.families.packages as unknown as { name: string; description: string; includes: string[]; ideal: string }[]}
      ctaText={t.families.ctaText}
    />
  );
};

export default Families;
