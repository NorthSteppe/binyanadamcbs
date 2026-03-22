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
      className="group block bg-card border border-border rounded-2xl p-8 transition-all duration-300 hover:shadow-apple-lg hover:-translate-y-1"
    >
      <div className="mb-6 w-12 h-12 rounded-2xl bg-accent flex items-center justify-center">
        <Icon size={24} strokeWidth={1.5} className="text-foreground" />
      </div>
      {contentKeyPrefix ? (
        <>
          <EditableText contentKey={`${contentKeyPrefix}.title`} defaultValue={title} as="h3" className="text-xl font-display mb-3 text-card-foreground tracking-tight" />
          <EditableText contentKey={`${contentKeyPrefix}.desc`} defaultValue={description} as="p" className="text-sm text-muted-foreground leading-relaxed mb-6" />
        </>
      ) : (
        <>
          <h3 className="text-xl font-display mb-3 text-card-foreground tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{description}</p>
        </>
      )}
      <span className="inline-flex items-center gap-2 text-[13px] font-medium text-foreground group-hover:gap-3 transition-all duration-300">
        {t.services.learnMore} <ArrowRight size={14} strokeWidth={2} />
      </span>
    </Link>
  );
};

export default ServiceCard;
