import { useEffect, useMemo, useState } from "react";
import { format, startOfMonth, subMonths } from "date-fns";
import { TrendingUp, TrendingDown, Wallet, AlertCircle, CalendarX, CalendarCheck } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Props {
  clientId: string | null;
  manualClientId: string | null;
  isManual: boolean;
}

interface SessionRow {
  id: string;
  session_date: string;
  status: string;
  is_paid: boolean;
  payment_method: string;
  duration_minutes: number;
  title: string;
}

interface EntryRow {
  id: string;
  entry_type: string; // income | expense | credit | refund | etc
  category: string;
  amount_cents: number;
  entry_date: string;
  title: string;
  description: string;
}

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(cents / 100);

const ClientFinancialTab = ({ clientId, manualClientId, isManual }: Props) => {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const sessionsQ = isManual
        ? supabase.from("sessions").select("id,session_date,status,is_paid,payment_method,duration_minutes,title").eq("manual_client_id", manualClientId!)
        : supabase.from("sessions").select("id,session_date,status,is_paid,payment_method,duration_minutes,title").eq("client_id", clientId!);

      // business_entries only links to real client_id (no manual_client_id column)
      const entriesQ = !isManual && clientId
        ? supabase.from("business_entries").select("id,entry_type,category,amount_cents,entry_date,title,description").eq("client_id", clientId)
        : null;

      const [sRes, eRes] = await Promise.all([sessionsQ, entriesQ ?? Promise.resolve({ data: [] as EntryRow[] })]);
      setSessions((sRes.data as SessionRow[]) || []);
      setEntries(((eRes as any).data as EntryRow[]) || []);
      setLoading(false);
    };
    if (clientId || manualClientId) load();
  }, [clientId, manualClientId, isManual]);

  const stats = useMemo(() => {
    const now = new Date();
    const completed = sessions.filter((s) => s.status === "completed");
    const scheduled = sessions.filter((s) => s.status === "scheduled");
    const cancelled = sessions.filter((s) => s.status === "cancelled");
    const missed = sessions.filter((s) => s.status === "no-show" || s.status === "missed");
    const paidSessions = sessions.filter((s) => s.is_paid).length;
    const unpaidCompleted = completed.filter((s) => !s.is_paid).length;

    const income = entries.filter((e) => e.entry_type === "income").reduce((sum, e) => sum + e.amount_cents, 0);
    const expense = entries.filter((e) => e.entry_type === "expense").reduce((sum, e) => sum + e.amount_cents, 0);
    const refunds = entries.filter((e) => e.entry_type === "refund").reduce((sum, e) => sum + e.amount_cents, 0);
    const credit = entries.filter((e) => e.entry_type === "credit").reduce((sum, e) => sum + e.amount_cents, 0);
    const outstanding = entries.filter((e) => e.entry_type === "invoice" || e.entry_type === "outstanding").reduce((sum, e) => sum + e.amount_cents, 0);

    // Net balance: income - refunds + credit available
    const netPaid = income - refunds;

    // Monthly income chart (last 6 months)
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = startOfMonth(subMonths(now, 5 - i));
      return { key: format(d, "yyyy-MM"), label: format(d, "MMM"), income: 0, sessions: 0 };
    });
    entries.forEach((e) => {
      if (e.entry_type !== "income") return;
      const k = format(new Date(e.entry_date), "yyyy-MM");
      const m = months.find((mm) => mm.key === k);
      if (m) m.income += e.amount_cents / 100;
    });
    sessions.forEach((s) => {
      if (s.status !== "completed") return;
      const k = format(new Date(s.session_date), "yyyy-MM");
      const m = months.find((mm) => mm.key === k);
      if (m) m.sessions += 1;
    });

    const statusBreakdown = [
      { name: "Completed", value: completed.length, color: "hsl(174,42%,42%)" },
      { name: "Scheduled", value: scheduled.length, color: "hsl(192,60%,55%)" },
      { name: "Cancelled", value: cancelled.length, color: "hsl(0,65%,55%)" },
      { name: "Missed", value: missed.length, color: "hsl(35,85%,55%)" },
    ].filter((s) => s.value > 0);

    return {
      totalSessions: sessions.length,
      completed: completed.length,
      scheduled: scheduled.length,
      cancelled: cancelled.length,
      missed: missed.length,
      paidSessions,
      unpaidCompleted,
      income,
      expense,
      refunds,
      credit,
      outstanding,
      netPaid,
      months,
      statusBreakdown,
    };
  }, [sessions, entries]);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading financial data...</div>;
  }

  const StatCard = ({ icon: Icon, label, value, sub, tone = "default" }: any) => {
    const toneClass =
      tone === "positive" ? "text-emerald-500" : tone === "negative" ? "text-destructive" : tone === "warning" ? "text-amber-500" : "text-primary";
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
          <Icon size={16} className={toneClass} />
        </div>
        <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {isManual && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-700 dark:text-amber-300">
          Manual clients are not linked to a registered account. Income, credit and outstanding figures are unavailable until paired.
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={TrendingUp} label="Total paid" value={formatCurrency(stats.netPaid)} sub={`${stats.paidSessions} paid sessions`} tone="positive" />
        <StatCard icon={Wallet} label="Credit balance" value={formatCurrency(stats.credit)} sub="Available prepaid credit" />
        <StatCard icon={AlertCircle} label="Outstanding" value={formatCurrency(stats.outstanding)} sub={`${stats.unpaidCompleted} completed unpaid`} tone={stats.outstanding > 0 || stats.unpaidCompleted > 0 ? "negative" : "default"} />
        <StatCard icon={CalendarCheck} label="Sessions ordered" value={stats.totalSessions} sub={`${stats.completed} completed · ${stats.scheduled} upcoming`} />
        <StatCard icon={CalendarX} label="Missed / no-show" value={stats.missed} sub={`${stats.cancelled} cancelled`} tone={stats.missed > 0 ? "warning" : "default"} />
        <StatCard icon={TrendingDown} label="Refunds" value={formatCurrency(stats.refunds)} sub="Total refunded" tone={stats.refunds > 0 ? "warning" : "default"} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-1">Income — last 6 months</h3>
          <p className="text-xs text-muted-foreground mb-4">Recorded payments by month (GBP)</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [`£${v.toFixed(2)}`, "Income"]}
                />
                <Bar dataKey="income" fill="hsl(174,42%,42%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-1">Sessions per month</h3>
          <p className="text-xs text-muted-foreground mb-4">Completed sessions trend</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="sessions" stroke="hsl(192,60%,55%)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-1">Session status breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution across all bookings</p>
          {stats.statusBreakdown.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No sessions yet.</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                    {stats.statusBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-card border border-border/50 rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4">Financial statement</h3>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No financial entries recorded for this client yet.
          </div>
        ) : (
          <div className="space-y-2">
            {entries
              .slice()
              .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
              .map((e) => {
                const positive = e.entry_type === "income" || e.entry_type === "credit";
                return (
                  <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{e.title}</p>
                        <Badge variant="outline" className="text-[10px] capitalize">{e.entry_type}</Badge>
                        {e.category && e.category !== "general" && (
                          <Badge variant="secondary" className="text-[10px]">{e.category}</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{format(new Date(e.entry_date), "MMM d, yyyy")}</p>
                    </div>
                    <p className={`text-sm font-semibold ${positive ? "text-emerald-500" : "text-destructive"}`}>
                      {positive ? "+" : "−"}{formatCurrency(Math.abs(e.amount_cents))}
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Unpaid completed sessions reminder */}
      {stats.unpaidCompleted > 0 && (
        <div className="bg-card border border-destructive/30 rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-3 text-destructive">Unpaid completed sessions</h3>
          <div className="space-y-2">
            {sessions
              .filter((s) => s.status === "completed" && !s.is_paid)
              .map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground">{format(new Date(s.session_date), "MMM d, yyyy · HH:mm")} · {s.duration_minutes} min</p>
                  </div>
                  <Badge variant="destructive" className="text-[10px]">Unpaid</Badge>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientFinancialTab;
