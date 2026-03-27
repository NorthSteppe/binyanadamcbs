import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Users, DollarSign, Calendar,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Clock,
  BookOpen, CreditCard, Activity, Target, ChevronDown,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval, subDays, startOfWeek, endOfWeek } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPie, Pie, Cell, Area, AreaChart } from "recharts";

interface Session {
  id: string;
  client_id: string;
  title: string;
  session_date: string;
  duration_minutes: number;
  status: string;
  description: string | null;
  created_at: string;
}

interface ServiceOption {
  id: string;
  name: string;
  price_cents: number;
  duration_minutes: number;
}

interface CoursePurchase {
  id: string;
  course_id: string;
  user_id: string;
  purchased_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  created_at: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(174, 42%, 42%)",
  "hsl(192, 35%, 38%)",
  "hsl(210, 40%, 50%)",
];

const BusinessDashboard = () => {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [coursePurchases, setCoursePurchases] = useState<CoursePurchase[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string; price_cents: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6months");
  const [expenseInput, setExpenseInput] = useState({ rent: 0, salaries: 0, software: 0, marketing: 0, other: 0 });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [sessRes, svcRes, cpRes, profRes, courseRes] = await Promise.all([
        supabase.from("sessions").select("*").order("session_date", { ascending: false }),
        supabase.from("service_options").select("*"),
        supabase.from("course_purchases").select("*"),
        supabase.from("profiles").select("id, full_name, created_at"),
        supabase.from("courses").select("id, title, price_cents"),
      ]);
      if (sessRes.data) setSessions(sessRes.data as unknown as Session[]);
      if (svcRes.data) setServices(svcRes.data as unknown as ServiceOption[]);
      if (cpRes.data) setCoursePurchases(cpRes.data as unknown as CoursePurchase[]);
      if (profRes.data) setProfiles(profRes.data as unknown as Profile[]);
      if (courseRes.data) setCourses(courseRes.data as unknown as { id: string; title: string; price_cents: number }[]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Load saved expenses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("business_expenses");
    if (saved) setExpenseInput(JSON.parse(saved));
  }, []);

  const saveExpenses = (updated: typeof expenseInput) => {
    setExpenseInput(updated);
    localStorage.setItem("business_expenses", JSON.stringify(updated));
  };

  const rangeMonths = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
  const rangeStart = startOfMonth(subMonths(new Date(), rangeMonths - 1));
  const rangeEnd = endOfMonth(new Date());
  const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });

  // Service price lookup
  const svcPriceMap = useMemo(() => {
    const m: Record<string, number> = {};
    services.forEach((s) => { m[s.name] = s.price_cents; });
    return m;
  }, [services]);

  // Course price lookup
  const coursePriceMap = useMemo(() => {
    const m: Record<string, number> = {};
    courses.forEach((c) => { m[c.id] = c.price_cents; });
    return m;
  }, [courses]);

  // Revenue from sessions (match title to service price)
  const sessionRevenue = useMemo(() => {
    return sessions
      .filter((s) => s.status !== "cancelled")
      .reduce((sum, s) => sum + (svcPriceMap[s.title] || 0), 0);
  }, [sessions, svcPriceMap]);

  // Revenue from course purchases
  const courseRevenue = useMemo(() => {
    return coursePurchases.reduce((sum, cp) => sum + (coursePriceMap[cp.course_id] || 0), 0);
  }, [coursePurchases, coursePriceMap]);

  const totalRevenue = (sessionRevenue + courseRevenue) / 100;
  const totalExpenses = Object.values(expenseInput).reduce((a, b) => a + b, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Monthly revenue chart data
  const monthlyData = useMemo(() => {
    return months.map((month) => {
      const mStart = startOfMonth(month);
      const mEnd = endOfMonth(month);
      const sessRev = sessions
        .filter((s) => s.status !== "cancelled" && isWithinInterval(new Date(s.session_date), { start: mStart, end: mEnd }))
        .reduce((sum, s) => sum + (svcPriceMap[s.title] || 0), 0) / 100;
      const courseRev = coursePurchases
        .filter((cp) => isWithinInterval(new Date(cp.purchased_at), { start: mStart, end: mEnd }))
        .reduce((sum, cp) => sum + (coursePriceMap[cp.course_id] || 0), 0) / 100;
      const sessionCount = sessions.filter((s) => isWithinInterval(new Date(s.session_date), { start: mStart, end: mEnd })).length;
      return {
        month: format(month, "MMM yy"),
        sessions: sessRev,
        courses: courseRev,
        total: sessRev + courseRev,
        sessionCount,
      };
    });
  }, [months, sessions, svcPriceMap, coursePurchases, coursePriceMap]);

  // Service breakdown for pie chart
  const serviceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.filter((s) => s.status !== "cancelled").forEach((s) => {
      counts[s.title] = (counts[s.title] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, value: count }));
  }, [sessions]);

  // New clients per month
  const newClientsPerMonth = useMemo(() => {
    return months.map((month) => {
      const mStart = startOfMonth(month);
      const mEnd = endOfMonth(month);
      const count = profiles.filter((p) => isWithinInterval(new Date(p.created_at), { start: mStart, end: mEnd })).length;
      return { month: format(month, "MMM yy"), count };
    });
  }, [months, profiles]);

  // Recent activity log
  const recentActivity = useMemo(() => {
    const items: { date: string; type: string; description: string; amount: number }[] = [];
    sessions.slice(0, 20).forEach((s) => {
      items.push({
        date: s.session_date,
        type: "session",
        description: `${s.title} (${s.status})`,
        amount: (svcPriceMap[s.title] || 0) / 100,
      });
    });
    coursePurchases.slice(0, 10).forEach((cp) => {
      const course = courses.find((c) => c.id === cp.course_id);
      items.push({
        date: cp.purchased_at,
        type: "course",
        description: `Course: ${course?.title || "Unknown"}`,
        amount: (coursePriceMap[cp.course_id] || 0) / 100,
      });
    });
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15);
  }, [sessions, coursePurchases, courses, svcPriceMap, coursePriceMap]);

  // Profit prediction (simple linear trend)
  const profitPrediction = useMemo(() => {
    if (monthlyData.length < 2) return [];
    const last3 = monthlyData.slice(-3);
    const avgGrowth = last3.length > 1
      ? (last3[last3.length - 1].total - last3[0].total) / (last3.length - 1)
      : 0;
    const lastTotal = monthlyData[monthlyData.length - 1].total;
    const predictions = [];
    for (let i = 1; i <= 3; i++) {
      const predicted = Math.max(0, lastTotal + avgGrowth * i);
      const futureMonth = new Date();
      futureMonth.setMonth(futureMonth.getMonth() + i);
      predictions.push({
        month: format(futureMonth, "MMM yy"),
        total: Math.round(predicted * 100) / 100,
        predicted: true,
      });
    }
    return [...monthlyData.map((d) => ({ ...d, predicted: false })), ...predictions];
  }, [monthlyData]);

  // This week's sessions
  const thisWeekSessions = useMemo(() => {
    const now = new Date();
    const wStart = startOfWeek(now, { weekStartsOn: 1 });
    const wEnd = endOfWeek(now, { weekStartsOn: 1 });
    return sessions.filter((s) => isWithinInterval(new Date(s.session_date), { start: wStart, end: wEnd }));
  }, [sessions]);

  // Prev month comparison
  const prevMonthRevenue = useMemo(() => {
    const pm = subMonths(new Date(), 1);
    const pmStart = startOfMonth(pm);
    const pmEnd = endOfMonth(pm);
    return sessions
      .filter((s) => s.status !== "cancelled" && isWithinInterval(new Date(s.session_date), { start: pmStart, end: pmEnd }))
      .reduce((sum, s) => sum + (svcPriceMap[s.title] || 0), 0) / 100;
  }, [sessions, svcPriceMap]);

  const currentMonthRevenue = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].total : 0;
  const revenueChange = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="pt-28 pb-20">
          <div className="container text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-7xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                  <BarChart3 size={22} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif text-foreground">Business Dashboard</h1>
                  <p className="text-muted-foreground font-light">Financial overview & business analytics</p>
                </div>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="12months">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Total Revenue"
              value={`£${totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`}
              change={revenueChange}
              icon={DollarSign}
              delay={0}
            />
            <KPICard
              title="Net Profit"
              value={`£${netProfit.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`}
              subtitle={totalExpenses > 0 ? `After £${totalExpenses.toLocaleString()} expenses` : "Set expenses below"}
              icon={TrendingUp}
              delay={0.05}
            />
            <KPICard
              title="Total Clients"
              value={profiles.length.toString()}
              subtitle={`${newClientsPerMonth[newClientsPerMonth.length - 1]?.count || 0} new this month`}
              icon={Users}
              delay={0.1}
            />
            <KPICard
              title="Sessions This Week"
              value={thisWeekSessions.length.toString()}
              subtitle={`${sessions.filter((s) => s.status === "scheduled").length} upcoming`}
              icon={Calendar}
              delay={0.15}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="expenses">Expenses & Profit</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Revenue trend */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Trend</CardTitle>
                    <CardDescription>Sessions & course revenue over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `£${v}`} />
                        <RechartsTooltip
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                          formatter={(value: number) => [`£${value.toFixed(2)}`, ""]}
                        />
                        <Area type="monotone" dataKey="sessions" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.3)" name="Sessions" />
                        <Area type="monotone" dataKey="courses" stackId="1" stroke="hsl(174,42%,42%)" fill="hsl(174,42%,42%,0.3)" name="Courses" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Service breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Service Breakdown</CardTitle>
                    <CardDescription>Sessions by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {serviceBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsPie>
                          <Pie data={serviceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                            {serviceBreakdown.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </RechartsPie>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-sm text-center py-12">No session data yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Profit forecast */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target size={18} className="text-primary" />
                    Revenue Forecast (3-Month Prediction)
                  </CardTitle>
                  <CardDescription>Based on recent growth trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={profitPrediction}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `£${v}`} />
                      <RechartsTooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                        formatter={(value: number) => [`£${value.toFixed(2)}`, ""]}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (payload.predicted) {
                            return <circle cx={cx} cy={cy} r={5} fill="hsl(var(--primary))" stroke="white" strokeWidth={2} strokeDasharray="3 3" />;
                          }
                          return <circle cx={cx} cy={cy} r={4} fill="hsl(var(--primary))" />;
                        }}
                        strokeDasharray={(d: any) => ""}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block" /> Actual</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block border-dashed" style={{ borderTop: "2px dashed hsl(var(--primary))", height: 0 }} /> Predicted</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* REVENUE */}
            <TabsContent value="revenue" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Session Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `£${v}`} />
                        <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Session Revenue" />
                        <Bar dataKey="courses" fill="hsl(174,42%,42%)" radius={[4, 4, 0, 0]} name="Course Revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sessions Per Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Bar dataKey="sessionCount" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Sessions" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue by service */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue by Service Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {services.map((svc) => {
                      const count = sessions.filter((s) => s.title === svc.name && s.status !== "cancelled").length;
                      const rev = (count * svc.price_cents) / 100;
                      return (
                        <div key={svc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium text-sm text-foreground">{svc.name}</p>
                            <p className="text-xs text-muted-foreground">{count} sessions · £{(svc.price_cents / 100).toFixed(2)} each</p>
                          </div>
                          <p className="font-semibold text-primary">£{rev.toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CLIENTS */}
            <TabsContent value="clients" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">New Client Registrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={newClientsPerMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="New Clients" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Client List</CardTitle>
                    <CardDescription>Recently registered</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {profiles
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 20)
                        .map((p) => (
                          <div key={p.id} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
                            <p className="text-sm font-medium text-foreground">{p.full_name || "Unnamed"}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(p.created_at), "dd MMM yyyy")}</p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* EXPENSES & PROFIT */}
            <TabsContent value="expenses" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Expenses</CardTitle>
                    <CardDescription>Enter your monthly costs to calculate profit</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(["rent", "salaries", "software", "marketing", "other"] as const).map((key) => (
                        <div key={key} className="flex items-center gap-3">
                          <label className="text-sm font-medium text-foreground capitalize w-24">{key}</label>
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
                            <input
                              type="number"
                              value={expenseInput[key] || ""}
                              onChange={(e) => saveExpenses({ ...expenseInput, [key]: parseFloat(e.target.value) || 0 })}
                              className="w-full pl-7 pr-3 py-2 rounded-lg border border-input bg-background text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-border">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Total Expenses</span>
                          <span className="font-bold text-destructive">£{totalExpenses.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profit Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-4 bg-primary/5 rounded-xl">
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold text-primary">£{totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="p-4 bg-destructive/5 rounded-xl">
                        <p className="text-sm text-muted-foreground">Total Expenses</p>
                        <p className="text-2xl font-bold text-destructive">-£{totalExpenses.toLocaleString()}</p>
                      </div>
                      <div className={`p-4 rounded-xl ${netProfit >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
                        <p className="text-sm text-muted-foreground">Net Profit</p>
                        <p className={`text-3xl font-bold ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                          {netProfit >= 0 ? "" : "-"}£{Math.abs(netProfit).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-sm text-muted-foreground">Profit Margin</p>
                        <p className="text-xl font-bold text-foreground">
                          {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0"}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ACTIVITY LOG */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity size={18} className="text-primary" />
                    Recent Business Activity
                  </CardTitle>
                  <CardDescription>Bookings, purchases, and revenue events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentActivity.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-8">No activity recorded yet</p>
                    )}
                    {recentActivity.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${item.type === "session" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}`}>
                            {item.type === "session" ? <Calendar size={14} /> : <BookOpen size={14} />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.description}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(item.date), "dd MMM yyyy, HH:mm")}</p>
                          </div>
                        </div>
                        {item.amount > 0 && (
                          <Badge variant="secondary" className="font-mono">
                            £{item.amount.toFixed(2)}
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
};

// KPI Card component
function KPICard({ title, value, change, subtitle, icon: Icon, delay }: {
  title: string;
  value: string;
  change?: number;
  subtitle?: string;
  icon: React.ElementType;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card>
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <Icon size={16} />
            </div>
            {change !== undefined && change !== 0 && (
              <span className={`text-xs font-medium flex items-center gap-0.5 ${change > 0 ? "text-primary" : "text-destructive"}`}>
                {change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle || title}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default BusinessDashboard;
