import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  colorClass: string;
}

const ServiceCard = ({ title, description, icon: Icon, path, colorClass }: ServiceCardProps) => {
  return (
    <Link
      to={path}
      className="group block rounded-2xl p-8 transition-all duration-300 hover:shadow-xl bg-card border border-border/50 hover:-translate-y-1"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colorClass}`}>
        <Icon size={26} />
      </div>
      <h3 className="text-xl mb-3 text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">{description}</p>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
        Learn more <ArrowRight size={16} />
      </span>
    </Link>
  );
};

export default ServiceCard;
