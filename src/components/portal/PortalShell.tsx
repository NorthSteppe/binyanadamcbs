import { motion } from "framer-motion";

// ── Shared metallic background style ─────────────────────────────────────────
export const METAL_BG: React.CSSProperties = {
  background: `
    repeating-linear-gradient(82deg,transparent 0px,transparent 1px,rgba(255,255,255,0.028) 1px,rgba(255,255,255,0.028) 1.5px,transparent 1.5px,transparent 4px),
    repeating-linear-gradient(79deg,transparent 0px,transparent 3px,rgba(255,255,255,0.014) 3px,rgba(255,255,255,0.014) 3.5px,transparent 3.5px,transparent 9px),
    repeating-linear-gradient(75deg,transparent 0px,transparent 7px,rgba(255,255,255,0.009) 7px,rgba(255,255,255,0.009) 8px,transparent 8px,transparent 18px),
    repeating-linear-gradient(85deg,transparent 0px,transparent 0.5px,rgba(255,255,255,0.04) 0.5px,rgba(255,255,255,0.04) 1px,transparent 1px,transparent 22px),
    radial-gradient(ellipse 55% 45% at 25% 22%,rgba(175,182,190,0.28) 0%,rgba(120,128,138,0.10) 45%,transparent 70%),
    radial-gradient(ellipse 40% 55% at 60% 60%,rgba(80,86,95,0.18) 0%,transparent 65%),
    radial-gradient(ellipse 70% 30% at 80% 10%,rgba(150,158,168,0.12) 0%,transparent 60%),
    linear-gradient(168deg,#15171a 0%,#1e2125 12%,#2b2f34 28%,#1c1f23 42%,#333840 55%,#202327 70%,#191b1e 85%,#141618 100%)
  `,
};

// ── Floating glass card ───────────────────────────────────────────────────────
export const FloatCard = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 22 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
    className={`bg-white/80 backdrop-blur-md border border-white/70 rounded-2xl overflow-hidden
      shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.06)]
      hover:shadow-[0_16px_48px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.08)]
      transition-shadow duration-500 ease-out ${className}`}
  >
    {children}
  </motion.div>
);

// ── Widget header strip ───────────────────────────────────────────────────────
export const WidgetHeader = ({
  icon: Icon,
  title,
  subtitle,
  accentColor = "#6366f1",
  action,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  accentColor?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.05]">
    <div className="flex items-center gap-3">
      <div className="w-1 h-7 rounded-full shrink-0" style={{ background: accentColor }} />
      <Icon size={15} className="text-muted-foreground" />
      <div>
        <h3 className="text-sm font-semibold text-foreground leading-none">{title}</h3>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

// ── Stat tile ─────────────────────────────────────────────────────────────────
export const StatTile = ({
  label,
  value,
  note,
  icon: Icon,
  accentColor,
  iconBg,
  delay = 0,
}: {
  label: string;
  value: number | string;
  note: string;
  icon: React.ElementType;
  accentColor: string;
  iconBg: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -5, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
    className="rounded-2xl p-5 relative bg-white/75 backdrop-blur-md border border-white/70
      shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.06)]
      hover:shadow-[0_14px_40px_rgba(0,0,0,0.13),0_2px_8px_rgba(0,0,0,0.07)]
      transition-shadow duration-500 ease-out"
  >
    <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: accentColor }} />
    <div className="flex items-start justify-between mb-3 pt-1">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
        <Icon size={16} style={{ color: accentColor }} />
      </div>
      <span className="text-2xl font-bold" style={{ color: accentColor }}>{value}</span>
    </div>
    <p className="text-xs font-semibold text-foreground">{label}</p>
    <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{note}</p>
  </motion.div>
);

// ── Page header bar (dark glass under site header) ────────────────────────────
export const PortalTopBar = ({
  greeting,
  date,
  children,
}: {
  greeting: string;
  date: string;
  children?: React.ReactNode;
}) => (
  <div
    className="border-b pt-20"
    style={{ background: "rgba(20,22,26,0.72)", backdropFilter: "blur(24px)", borderColor: "rgba(255,255,255,0.08)" }}
  >
    <div className="container max-w-5xl py-5 flex items-center justify-between gap-4">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-xl font-semibold text-white">{greeting}</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{date}</p>
      </motion.div>
      {children && (
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2"
        >
          {children}
        </motion.div>
      )}
    </div>
  </div>
);
