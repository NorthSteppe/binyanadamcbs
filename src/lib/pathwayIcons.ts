import {
  Phone, FileSignature, ClipboardList, FileText, Sparkles, RefreshCcw,
  Send, PenLine, CheckCircle2, Mic, Eye, Share2, Circle, Calendar,
  Users, Heart, Target, type LucideIcon,
} from "lucide-react";

export const PATHWAY_ICON_MAP: Record<string, LucideIcon> = {
  Phone, FileSignature, ClipboardList, FileText, Sparkles, RefreshCcw,
  Send, PenLine, CheckCircle2, Mic, Eye, Share2, Circle, Calendar,
  Users, Heart, Target,
};

export const PATHWAY_ICON_NAMES = Object.keys(PATHWAY_ICON_MAP);

export const getPathwayIcon = (name: string): LucideIcon =>
  PATHWAY_ICON_MAP[name] ?? Circle;

export const STATUS_COLORS: Record<string, { bg: string; text: string; ring: string; label: string }> = {
  pending:     { bg: "bg-muted",         text: "text-muted-foreground", ring: "ring-border",        label: "Pending" },
  in_progress: { bg: "bg-primary/10",    text: "text-primary",          ring: "ring-primary/30",    label: "In progress" },
  completed:   { bg: "bg-emerald-100",   text: "text-emerald-700",      ring: "ring-emerald-300",   label: "Completed" },
  skipped:     { bg: "bg-slate-100",     text: "text-slate-500",        ring: "ring-slate-200",     label: "Skipped" },
};
