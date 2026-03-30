import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Legend, Cell } from "recharts";

type FundingSource = "Private" | "Local Authority" | "School";

interface ClientProfile {
  id: string;
  name: string;
  funding: FundingSource;
  directHours: number;
  indirectHours: number;
  hourlyCharge: number;
  contractorPay: number;
  energyScore: number; // 1-10 (1 = high drain, 10 = highly reinforcing)
}

const initialClients: ClientProfile[] = [
  { id: "C001", name: "Client A", funding: "Private", directHours: 4, indirectHours: 1, hourlyCharge: 55, contractorPay: 15, energyScore: 8 },
  { id: "C002", name: "Client B", funding: "Local Authority", directHours: 6, indirectHours: 2, hourlyCharge: 65, contractorPay: 20, energyScore: 4 },
  { id: "C003", name: "School Contract X", funding: "School", directHours: 10, indirectHours: 4, hourlyCharge: 75, contractorPay: 25, energyScore: 9 },
  { id: "C004", name: "Client C", funding: "Private", directHours: 2, indirectHours: 0.5, hourlyCharge: 55, contractorPay: 15, energyScore: 3 },
  { id: "C005", name: "Client D (Waitlist)", funding: "Local Authority", directHours: 5, indirectHours: 1.5, hourlyCharge: 60, contractorPay: 15, energyScore: 6 },
  { id: "C006", name: "Client E", funding: "Private", directHours: 3, indirectHours: 1, hourlyCharge: 50, contractorPay: 15, energyScore: 7 },
  { id: "C007", name: "School Contract Y", funding: "School", directHours: 8, indirectHours: 2, hourlyCharge: 45, contractorPay: 15, energyScore: 2 },
];

const TMEMatrix = () => {
  const [clients, setClients] = useState<ClientProfile[]>(initialClients);

  // Derive profitability and prepare chart data
  const chartData = clients.map(client => {
    const marginPerHour = client.hourlyCharge - client.contractorPay;
    const totalHours = client.directHours + client.indirectHours;
    const totalMargin = marginPerHour * totalHours;
    
    // Categorize for colors
    let quad = "Low/Low";
    if (marginPerHour >= 40 && client.energyScore >= 6) quad = "Star (High Value/High Energy)";
    else if (marginPerHour >= 40 && client.energyScore < 6) quad = "Cash Cow (High Value/Low Energy)";
    else if (marginPerHour < 40 && client.energyScore >= 6) quad = "Passion (Low Value/High Energy)";
    else quad = "Drain (Low Value/Low Energy)";

    return {
      ...client,
      marginPerHour,
      totalHours,
      totalMargin,
      quad,
    };
  });

  const formatGBP = (value: number) => {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
  };

  const getFundingBadgeColor = (funding: FundingSource) => {
    switch (funding) {
      case "Private": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      case "Local Authority": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "School": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default: return "";
    }
  };

  const getColorForQuad = (quad: string) => {
    if (quad.includes("Star")) return "#10b981"; // Emerald
    if (quad.includes("Cash Cow")) return "#3b82f6"; // Blue
    if (quad.includes("Passion")) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card text-card-foreground border border-border p-3 rounded-md shadow-md">
          <p className="font-bold">{data.name}</p>
          <p className="text-sm">Margin/Hr: {formatGBP(data.marginPerHour)}</p>
          <p className="text-sm">Energy (1-10): {data.energyScore}</p>
          <p className="text-sm font-semibold mt-1" style={{color: getColorForQuad(data.quad)}}>{data.quad}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Time-Money-Energy (TME) Matrix</h1>
        <p className="text-muted-foreground mt-2">Map existing and waitlisted clients to optimise caseload.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Caseload Matrix</CardTitle>
            <CardDescription>
              Visualise profitability vs. cognitive load. 
              Top Right: High Value/Fills the cup. Bottom Left: Low Value/High Drain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[450px] w-full mt-4 bg-background border border-border rounded-lg p-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    dataKey="marginPerHour" 
                    name="Profitability" 
                    unit="£" 
                    domain={[0, 80]} 
                    tick={{fill: "hsl(var(--foreground))"}}
                    label={{ value: 'Profitability (Margin/hr £)', position: 'bottom', offset: 0, fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="energyScore" 
                    name="Energy" 
                    domain={[0, 10]} 
                    tick={{fill: "hsl(var(--foreground))"}}
                    label={{ value: 'Energy Score (1=Drain, 10=Reinforcing)', angle: -90, position: 'left', fill: "hsl(var(--foreground))" }}
                  />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  <ReferenceLine x={40} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <ReferenceLine y={5.5} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Scatter name="Clients" data={chartData} fill="#8884d8">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorForQuad(entry.quad)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              
              {/* Quadrant Labels */}
              <div className="absolute top-6 right-6 text-sm font-bold text-emerald-500 bg-background/80 px-2 py-1 rounded">
                High Value / Fills Cup
              </div>
              <div className="absolute bottom-10 left-16 text-sm font-bold text-red-500 bg-background/80 px-2 py-1 rounded">
                Low Value / Drain
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Client Database</CardTitle>
            <CardDescription>Detailed metrics for current and waitlisted clients.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client/Contract</TableHead>
                    <TableHead>Funding</TableHead>
                    <TableHead className="text-right">Charge/hr</TableHead>
                    <TableHead className="text-right">Pay/hr</TableHead>
                    <TableHead className="text-right">Margin/hr</TableHead>
                    <TableHead className="text-right">Energy (1-10)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getFundingBadgeColor(client.funding)}>
                          {client.funding}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatGBP(client.hourlyCharge)}</TableCell>
                      <TableCell className="text-right">{formatGBP(client.contractorPay)}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatGBP(client.marginPerHour)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${
                          client.energyScore >= 8 ? 'text-emerald-500' : 
                          client.energyScore <= 3 ? 'text-red-500' : 'text-amber-500'
                        }`}>
                          {client.energyScore}
                        </span>
                      </TableCell>
                      <TableCell>
                         <span className="text-xs">{client.quad.split(' ')[0]}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TMEMatrix;
