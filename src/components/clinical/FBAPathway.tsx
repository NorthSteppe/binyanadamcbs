import { Send, PencilLine, CheckCircle2, FileText, type LucideIcon } from "lucide-react";

export type FBAPathwayStep = "sent" | "in_progress" | "submitted" | "report";

interface PathwayItem {
  id: FBAPathwayStep;
  label: string;
  hint: string;
  icon: LucideIcon;
}

const STEPS: PathwayItem[] = [
  { id: "sent", label: "Sent to parent", hint: "Therapist assigns the intake", icon: Send },
  { id: "in_progress", label: "Parent / therapist fills it", hint: "Saves automatically", icon: PencilLine },
  { id: "submitted", label: "Submitted", hint: "Locked in for review", icon: CheckCircle2 },
  { id: "report", label: "Used in FBA report", hint: "Auto-fills the report builder", icon: FileText },
];

interface Props {
  current: FBAPathwayStep;
  className?: string;
  audience?: "client" | "staff" | "admin";
}

const audienceLabel: Record<NonNullable<Props["audience"]>, string> = {
  client: "Your FBA pathway",
  staff: "FBA pathway",
  admin: "FBA pathway",
};

const FBAPathway = ({ current, className = "", audience = "staff" }: Props) => {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <div className={`rounded-2xl border border-border bg-gradient-to-br from-white via-slate-50/40 to-sky-50/40 p-4 sm:p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          {audienceLabel[audience]}
        </p>
        <span className="text-[10px] text-muted-foreground">
          Step {Math.max(currentIndex, 0) + 1} of {STEPS.length}
        </span>
      </div>

      <ol className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={s.id} className="relative">
              <div
                className={`flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 sm:text-center p-3 rounded-xl border transition-all
                  ${active ? "border-primary/50 bg-primary/[0.06] shadow-sm" : done ? "border-emerald-200 bg-emerald-50/60" : "border-border bg-white/50"}`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
                    ${active ? "bg-primary text-primary-foreground" : done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}
                >
                  <Icon size={15} />
                </div>
                <div className="min-w-0">
                  <p className={`text-[12px] font-semibold leading-tight ${active ? "text-foreground" : done ? "text-emerald-700" : "text-muted-foreground"}`}>
                    {s.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{s.hint}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-[26px] right-[-8px] w-4 h-px bg-border" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default FBAPathway;
