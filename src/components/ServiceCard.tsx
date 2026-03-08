import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import EditableText from "./editable/EditableText";
import type { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  colorClass: string;
  contentKeyPrefix?: string;
}

const ServiceCard = ({ title, description, icon: Icon, path, colorClass, contentKeyPrefix }: ServiceCardProps) => {
  const { t } = useLanguage();

  return (
    <Link
      to={path}
      className="group block border border-border bg-card p-8 transition-all duration-500 hover:border-primary/30 hover:bg-card/80"
    >
      <div className="mb-6">
        <Icon size={28} strokeWidth={1.2} className="text-primary" />
      </div>
      {contentKeyPrefix ? (
        <>
          <EditableText contentKey={`${contentKeyPrefix}.title`} defaultValue={title} as="h3" className="text-2xl font-serif mb-3 text-card-foreground" />
          <EditableText contentKey={`${contentKeyPrefix}.desc`} defaultValue={description} as="p" className="text-sm text-muted-foreground leading-relaxed mb-6 font-light" />
        </>
      ) : (
        <>
          <h3 className="text-2xl font-serif mb-3 text-card-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-light">{description}</p>
        </>
      )}
      <span className="inline-flex items-center gap-2 text-[12px] uppercase tracking-wider text-primary group-hover:gap-3 transition-all duration-300 font-sans">
        {t.services.learnMore} <ArrowRight size={14} strokeWidth={1.5} />
      </span>
    </Link>
  );
};

export default ServiceCard;
