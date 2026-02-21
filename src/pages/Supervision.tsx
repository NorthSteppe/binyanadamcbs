import ServicePageLayout from "@/components/ServicePageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import supervisionHero from "@/assets/supervision-hero.jpg";

const Supervision = () => {
  const { t } = useLanguage();

  return (
    <ServicePageLayout
      title={t.supervision.title}
      subtitle={t.supervision.subtitle}
      tagline={t.supervision.tagline}
      bgColorClass="bg-supervision"
      accentColorClass="bg-supervision"
      textOnBgClass="text-supervision-foreground"
      heroImage={supervisionHero}
      services={t.supervision.services as unknown as string[]}
      packages={t.supervision.packages as unknown as { name: string; description: string; includes: string[]; ideal: string }[]}
      ctaText={t.supervision.ctaText}
    />
  );
};

export default Supervision;
