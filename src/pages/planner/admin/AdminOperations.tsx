import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface InvoiceRecord {
  id: string;
  client: string;
  amount: number;
  status: "paid" | "pending" | "arrears";
  requiresAdvanceNotice: boolean;
  dueDate: string;
}

interface ConsultancyBlock {
  day: string;
  allocatedHours: number;
  bookedHours: number;
  type: "school" | "supervision" | "admin";
}

const AdminOperations = () => {
  const formatGBP = (value: number) => {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
  };

  const [invoices] = useState<InvoiceRecord[]>([
    { id: "INV-001", client: "Client A", amount: 440, status: "paid", requiresAdvanceNotice: false, dueDate: "2026-03-01" },
    { id: "INV-002", client: "Local Authority Board", amount: 1560, status: "arrears", requiresAdvanceNotice: true, dueDate: "2026-02-15" },
    { id: "INV-003", client: "Client B", amount: 220, status: "pending", requiresAdvanceNotice: false, dueDate: "2026-04-01" },
    { id: "INV-004", client: "School Contract X", amount: 3000, status: "pending", requiresAdvanceNotice: true, dueDate: "2026-04-05" },
    { id: "INV-005", client: "Client C", amount: 110, status: "arrears", requiresAdvanceNotice: false, dueDate: "2026-03-10" },
  ]);

  const [consultancySchedule] = useState<ConsultancyBlock[]>([
    { day: "Monday PM", allocatedHours: 3, bookedHours: 3, type: "school" },
    { day: "Tuesday AM", allocatedHours: 4, bookedHours: 2, type: "supervision" },
    { day: "Wednesday (Full)", allocatedHours: 7, bookedHours: 7, type: "school" },
    { day: "Thursday PM", allocatedHours: 3, bookedHours: 1, type: "admin" },
    { day: "Friday AM", allocatedHours: 4, bookedHours: 0, type: "supervision" },
  ]);

  const totalAllocated = consultancySchedule.reduce((acc, curr) => acc + curr.allocatedHours, 0);
  const totalBooked = consultancySchedule.reduce((acc, curr) => acc + curr.bookedHours, 0);
  const capacityPercent = (totalBooked / totalAllocated) * 100;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "paid": return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none">Paid</Badge>;
      case "pending": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none">Pending</Badge>;
      case "arrears": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none font-bold">Arrears</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch(type) {
      case "school": return <Badge variant="outline" className="border-purple-200 text-purple-700">School Consult</Badge>;
      case "supervision": return <Badge variant="outline" className="border-blue-200 text-blue-700">Supervision</Badge>;
      case "admin": return <Badge variant="outline" className="border-gray-200 text-gray-700">Admin/Prep</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Admin & Operations Hub</h1>
        <p className="text-muted-foreground mt-2">Centralised structural business systems and tracking.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Invoicing Tracker */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Invoicing Tracker</CardTitle>
            <CardDescription>Monitor outstanding balances and required advance notices.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Advance Notice</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} className={inv.status === "arrears" ? "bg-red-50/50 dark:bg-red-950/20" : ""}>
                      <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                      <TableCell className="font-medium">{inv.client}</TableCell>
                      <TableCell>{formatGBP(inv.amount)}</TableCell>
                      <TableCell>{new Date(inv.dueDate).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell>
                        {inv.requiresAdvanceNotice ? (
                          <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm font-medium">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Required
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(inv.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center gap-4 mt-4 p-4 bg-muted rounded-md text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-muted-foreground">Local Authority clients typically require 30-day advance payment notices.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultancy Planner */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Consultancy & Supervision Planner</CardTitle>
            <CardDescription>Overall post-transition capacity management for non-direct clinical work.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Booked Capacity</span>
                <span className="font-bold">{totalBooked} / {totalAllocated} hrs ({capacityPercent.toFixed(0)}%)</span>
              </div>
              <Progress value={capacityPercent} className="h-3" />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Block / Day</TableHead>
                    <TableHead>Focus Area</TableHead>
                    <TableHead className="text-right">Allocated Hrs</TableHead>
                    <TableHead className="text-right">Booked Hrs</TableHead>
                    <TableHead className="text-center">Availability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultancySchedule.map((block, idx) => {
                    const available = block.allocatedHours - block.bookedHours;
                    const isFull = available === 0;
                    
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{block.day}</TableCell>
                        <TableCell>{getTypeBadge(block.type)}</TableCell>
                        <TableCell className="text-right">{block.allocatedHours}</TableCell>
                        <TableCell className="text-right font-semibold">{block.bookedHours}</TableCell>
                        <TableCell className="text-center">
                          {isFull ? (
                            <span className="text-red-500 text-xs font-bold uppercase tracking-wider">Full</span>
                          ) : (
                            <span className="text-emerald-500 text-sm font-bold">{available} hr open</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOperations;
