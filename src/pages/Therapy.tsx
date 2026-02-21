import ServicePageLayout from "@/components/ServicePageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import therapyHero from "@/assets/therapy-hero.jpg";

const Therapy = () => {
  const { t } = useLanguage();

  return (
    <ServicePageLayout
      title={t.therapy.title}
      subtitle={t.therapy.subtitle}
      tagline={t.therapy.tagline}
      bgColorClass="bg-therapy"
      accentColorClass="bg-therapy"
      textOnBgClass="text-therapy-foreground"
      heroImage={therapyHero}
      services={t.therapy.services as unknown as string[]}
      packages={t.therapy.packages as unknown as { name: string; description: string; includes: string[]; ideal: string }[]}
      ctaText={t.therapy.ctaText}
    />
  );
};

export default Therapy;
