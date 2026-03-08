import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  colorClass: string;
}

const ServiceCard = ({ title, description, icon: Icon, path, colorClass }: ServiceCardProps) => {
  const { t } = useLanguage();

  return (
    <Link
      to={path}
      className="group block border border-border bg-card p-8 transition-all duration-500 hover:border-primary/30 hover:bg-card/80"
    >
      <div className={`w-12 h-12 flex items-center justify-center mb-6 ${colorClass}`}>
        <Icon size={24} />
      </div>
      <h3 className="text-2xl font-serif mb-3 text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-light">{description}</p>
      <span className="inline-flex items-center gap-2 text-[12px] uppercase tracking-wider text-primary group-hover:gap-3 transition-all duration-300 font-sans">
        {t.services.learnMore} <ArrowRight size={14} />
      </span>
    </Link>
  );
};

export default ServiceCard;
