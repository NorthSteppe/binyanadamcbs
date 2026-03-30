import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, AlertCircle, CheckCircle2, Clock, CalendarDays } from "lucide-react";

const ComplianceRoadmap = () => {
  // Placeholder countdown state
  const totalNoticeDays = 90;
  const daysPassed = 45;
  const daysLeft = totalNoticeDays - daysPassed;
  const progressPercent = (daysPassed / totalNoticeDays) * 100;

  // Checklists State
  const [legalChecklist, setLegalChecklist] = useState({
    ico: true,
    indemnity: true,
    uksba: false,
    dbs: true,
  });

  const [procurementChecklist, setProcurementChecklist] = useState({
    manchesterLA: false,
    theChest: false,
    schoolVendor: true,
  });

  const milestones = [
    {
      quarter: "Year 1 - Q1",
      title: "Preparation & Notice",
      status: "in-progress",
      items: ["Hand in 3-month notice", "Setup basic business banking", "Register as sole trader with HMRC"]
    },
    {
      quarter: "Year 1 - Q2",
      title: "Launch & Compliance",
      status: "pending",
      items: ["Secure initial 2 private clients", "Complete ICO & UKSBA registration", "Procure Clinical Supervision"]
    },
    {
      quarter: "Year 1 - Q3",
      title: "Capacity Expansion",
      status: "pending",
      items: ["Apply for Manchester LA approved-provider list", "Target 50% capacity (15 billable hrs/wk)"]
    },
    {
      quarter: "Year 2 - Q1",
      title: "Sustainable Caseload",
      status: "pending",
      items: ["Review hourly rates", "Full capacity (25 billable hrs/wk)", "First tax return submission"]
    },
    {
      quarter: "Year 3 - Q1",
      title: "Clinic Stability",
      status: "pending",
      items: ["Assess viability of hiring admin support", "Evaluate transition to Limited Company (LTD)"]
    }
  ];

  const lifeEvents = [
    { date: "May 2026", event: "MEd Research Phase Begins", impact: "High Capacity Dip (Reduce direct hours by 30%)", type: "academic" },
    { date: "July 2026", event: "School Holidays", impact: "Schedule shift to home-based programs", type: "seasonal" },
    { date: "January 2027", event: "Historical Tax Bill / Cashflow Dip", impact: "Ensure 20% buffer is fully funded", type: "financial" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Transition & Compliance Roadmap</h1>
        <p className="text-muted-foreground mt-2">Concrete milestone tracker and capacity planning.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Countdown Tracker */}
        <Card className="lg:col-span-3 border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Notice Period Countdown</CardTitle>
                <CardDescription>3-month school transition period</CardDescription>
              </div>
              <div className="text-3xl font-bold text-primary">{daysLeft} <span className="text-sm text-muted-foreground font-normal">days left</span></div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="h-4" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Notice Given</span>
              <span>Freedom Day</span>
            </div>
          </CardContent>
        </Card>

        {/* Checklists */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Legal & Regulatory</CardTitle>
            <CardDescription>Mandatory practice requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox id="ico" checked={legalChecklist.ico} onCheckedChange={(c) => setLegalChecklist({...legalChecklist, ico: !!c})} />
              <Label htmlFor="ico" className="text-sm font-medium">ICO Registration</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="indemnity" checked={legalChecklist.indemnity} onCheckedChange={(c) => setLegalChecklist({...legalChecklist, indemnity: !!c})} />
              <Label htmlFor="indemnity" className="text-sm font-medium">Professional Indemnity Insurance</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="uksba" checked={legalChecklist.uksba} onCheckedChange={(c) => setLegalChecklist({...legalChecklist, uksba: !!c})} />
              <Label htmlFor="uksba" className="text-sm font-medium">UKSBA Compliance / Registration</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="dbs" checked={legalChecklist.dbs} onCheckedChange={(c) => setLegalChecklist({...legalChecklist, dbs: !!c})} />
              <Label htmlFor="dbs" className="text-sm font-medium">Enhanced DBS (Update Service)</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Procurement</CardTitle>
            <CardDescription>Local authority and vendor statuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox id="manchester" checked={procurementChecklist.manchesterLA} onCheckedChange={(c) => setProcurementChecklist({...procurementChecklist, manchesterLA: !!c})} />
              <Label htmlFor="manchester" className="text-sm font-medium">Manchester LA Approved-Provider</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="thechest" checked={procurementChecklist.theChest} onCheckedChange={(c) => setProcurementChecklist({...procurementChecklist, theChest: !!c})} />
              <Label htmlFor="thechest" className="text-sm font-medium">'The Chest' Registration</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="schoolvendor" checked={procurementChecklist.schoolVendor} onCheckedChange={(c) => setProcurementChecklist({...procurementChecklist, schoolVendor: !!c})} />
              <Label htmlFor="schoolvendor" className="text-sm font-medium">Independent School Vendor Setups</Label>
            </div>
          </CardContent>
        </Card>

        {/* Life Events & Capacity Dips */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Life Event Capacity Hits</CardTitle>
            <CardDescription>Anticipated cognitive/financial dips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lifeEvents.map((ev, idx) => (
                <div key={idx} className="flex gap-3 items-start border-l-2 border-l-amber-500 pl-3">
                  <CalendarDays className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold">{ev.event}</h4>
                    <p className="text-xs text-primary font-medium">{ev.date}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ev.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quarterly Milestones */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Year 1-3 Transition Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-muted ml-3 space-y-8">
              {milestones.map((ms, idx) => (
                <div key={idx} className="relative pl-8">
                  {ms.status === 'completed' && <CheckCircle2 className="absolute -left-3 top-0 w-6 h-6 text-emerald-500 bg-background" />}
                  {ms.status === 'in-progress' && <Clock className="absolute -left-3 top-0 w-6 h-6 text-amber-500 bg-background" />}
                  {ms.status === 'pending' && <div className="absolute -left-2 top-1.5 w-4 h-4 rounded-full border-2 border-muted bg-background" />}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <Badge variant="outline" className="w-fit">{ms.quarter}</Badge>
                    <h3 className="text-lg font-semibold">{ms.title}</h3>
                  </div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {ms.items.map((item, idy) => (
                      <li key={idy}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplianceRoadmap;
