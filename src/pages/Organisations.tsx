import ServicePageLayout from "@/components/ServicePageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import organisationsHero from "@/assets/organisations-hero.jpg";

const Organisations = () => {
  const { t } = useLanguage();

  return (
    <ServicePageLayout
      title={t.organisations.title}
      subtitle={t.organisations.subtitle}
      tagline={t.organisations.tagline}
      bgColorClass="bg-business"
      accentColorClass="bg-business"
      textOnBgClass="text-business-foreground"
      heroImage={organisationsHero}
      services={t.organisations.services as unknown as string[]}
      packages={t.organisations.packages as unknown as { name: string; description: string; includes: string[]; ideal: string }[]}
      ctaText={t.organisations.ctaText}
    />
  );
};

export default Organisations;
