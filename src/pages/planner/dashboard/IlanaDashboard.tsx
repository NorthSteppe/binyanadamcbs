import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

const IlanaDashboard = () => {
  const [baselineTarget, setBaselineTarget] = useState<number>(40000);
  const [conservativeTargetPercent, setConservativeTargetPercent] = useState<number>(50);

  // Income sources (placeholders)
  const currentNHSSalary = 32000; // e.g., current full-time or part-time salary
  const [projectedPrivateIncome, setProjectedPrivateIncome] = useState<number>(55000);

  // Outgoings
  const [icoFee, setIcoFee] = useState<number>(35);
  const [accountingFee, setAccountingFee] = useState<number>(37 * 12); // £37/mo
  const [indemnityFee, setIndemnityFee] = useState<number>(120);
  const [otherExpenses, setOtherExpenses] = useState<number>(500);

  const totalOutgoings = icoFee + accountingFee + indemnityFee + otherExpenses;
  const grossContractorProfit = projectedPrivateIncome - totalOutgoings;
  const taxBuffer = grossContractorProfit * 0.20; // 20% tax
  const netPrivateIncome = grossContractorProfit - taxBuffer;

  const currentCombinedIncome = currentNHSSalary + 5000; // assuming some private side-hustle
  const conservativeTarget = (projectedPrivateIncome * conservativeTargetPercent) / 100;

  // Chart data
  const chartData = [
    {
      name: "Current Combined",
      Income: currentCombinedIncome,
      fill: "hsl(var(--muted-foreground))",
    },
    {
      name: "Projected Private (Net)",
      Income: netPrivateIncome,
      fill: netPrivateIncome >= baselineTarget ? "#10b981" : netPrivateIncome >= conservativeTarget ? "#f59e0b" : "#ef4444", // Traffic light coloring
    },
  ];

  const formatGBP = (value: number) => {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value);
  };

  const getTrafficLightColor = (value: number, threshold: number, warningThreshold: number) => {
    if (value >= threshold) return "text-emerald-500";
    if (value >= warningThreshold) return "text-amber-500";
    return "text-red-500";
  };

  const progressPercentage = Math.min((netPrivateIncome / baselineTarget) * 100, 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">The 'Ilana' Dashboard</h1>
        <p className="text-muted-foreground mt-2">Financial Security & Projections for Transition</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Baseline Target (Annual)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">£</span>
              <Input 
                type="number" 
                value={baselineTarget} 
                onChange={(e) => setBaselineTarget(Number(e.target.value))}
                className="text-2xl font-bold h-auto py-1 px-2 border-none bg-transparent focus-visible:ring-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Minimum viable income.</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conservative Projection ({conservativeTargetPercent}%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatGBP(conservativeTarget)}</div>
            <div className="flex items-center space-x-2 mt-2">
              <input 
                type="range" 
                min="10" max="90" step="10"
                value={conservativeTargetPercent} 
                onChange={(e) => setConservativeTargetPercent(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500 lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projected Net Income vs Target</CardTitle>
            <span className={`font-bold ${getTrafficLightColor(netPrivateIncome, baselineTarget, conservativeTarget)}`}>
              {formatGBP(netPrivateIncome)} / {formatGBP(baselineTarget)}
            </span>
          </CardHeader>
          <CardContent>
            <Progress 
              value={progressPercentage} 
              className={`h-3 [&>div]:${progressPercentage >= 100 ? "bg-emerald-500" : progressPercentage >= 50 ? "bg-amber-500" : "bg-red-500"}`}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Currently forecasting {progressPercentage.toFixed(0)}% of your secure baseline.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Burn Rate Calculator</CardTitle>
            <CardDescription>Track fixed non-chargeable outgoings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ICO Registration (Annual)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">£</span>
                  <Input type="number" value={icoFee} onChange={(e) => setIcoFee(Number(e.target.value))} className="pl-7" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accountant (Annualized)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">£</span>
                  <Input type="number" value={accountingFee} onChange={(e) => setAccountingFee(Number(e.target.value))} className="pl-7" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Professional Indemnity</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">£</span>
                  <Input type="number" value={indemnityFee} onChange={(e) => setIndemnityFee(Number(e.target.value))} className="pl-7" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Other Expenses</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">£</span>
                  <Input type="number" value={otherExpenses} onChange={(e) => setOtherExpenses(Number(e.target.value))} className="pl-7" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border mt-4">
              <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                <span className="font-semibold">Total Burn Rate:</span>
                <span className="text-xl font-bold text-destructive">{formatGBP(totalOutgoings)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax & Gross Projection</CardTitle>
            <CardDescription>Automatically reserves 20% for HMRC.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold text-primary">Expected Gross Private Income</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-lg">£</span>
                <Input 
                  type="number" 
                  value={projectedPrivateIncome} 
                  onChange={(e) => setProjectedPrivateIncome(Number(e.target.value))} 
                  className="pl-8 text-lg py-6" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Less Fixed Outgoings:</span>
                <span>-{formatGBP(totalOutgoings)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Gross Contractor Profit:</span>
                <span>{formatGBP(grossContractorProfit)}</span>
              </div>
              <div className="flex justify-between text-sm text-destructive">
                <span>Estimated Tax Buffer (20%):</span>
                <span>-{formatGBP(taxBuffer)}</span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between items-center">
                <span className="font-bold text-lg">Take-Home (Net):</span>
                <span className={`text-xl font-bold ${getTrafficLightColor(netPrivateIncome, baselineTarget, conservativeTarget)}`}>
                  {formatGBP(netPrivateIncome)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Income Transition Comparison</CardTitle>
            <CardDescription>Current multi-source income vs Projected Private Clinic income</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{fill: "hsl(var(--foreground))"}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `£${val/1000}k`} tick={{fill: "hsl(var(--foreground))"}} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    formatter={(value: number) => [formatGBP(value), "Income"]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="Income" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default IlanaDashboard;
