import { Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";

interface HighlightBoxProps {
  type: "insight" | "mistake" | "practical";
  children: React.ReactNode;
}

const config = {
  insight: {
    icon: Lightbulb,
    label: "Key Insight",
    className: "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/30",
    iconClass: "text-blue-600",
  },
  mistake: {
    icon: AlertTriangle,
    label: "Common Mistake",
    className: "border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/30",
    iconClass: "text-amber-600",
  },
  practical: {
    icon: CheckCircle,
    label: "Practical Step",
    className: "border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
    iconClass: "text-emerald-600",
  },
};

const HighlightBox = ({ type, children }: HighlightBoxProps) => {
  const { icon: Icon, label, className, iconClass } = config[type];
  return (
    <div className={`rounded-r-lg p-5 my-6 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      <div className="text-sm text-foreground/80 leading-relaxed">{children}</div>
    </div>
  );
};

export default HighlightBox;
