import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EntryHistoryProps {
  clientId: string;
  toolType: string;
  renderEntry: (data: Record<string, unknown>, notes: string) => React.ReactNode;
  refreshKey?: number;
}

interface Entry {
  id: string;
  entry_data: Record<string, unknown>;
  notes: string;
  entry_date: string;
  filled_by: string;
  filler_name?: string;
}

const EntryHistory = ({ clientId, toolType, renderEntry, refreshKey }: EntryHistoryProps) => {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    if (!clientId) return;
    const fetch = async () => {
      const { data } = await (supabase.from("clinical_entries") as any)
        .select("*")
        .eq("client_id", clientId)
        .eq("tool_type", toolType)
        .order("entry_date", { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        const fillerIds = [...new Set(data.map((e: any) => e.filled_by))] as string[];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", fillerIds);
        const nameMap = new Map(profiles?.map((p) => [p.id, p.full_name]) ?? []);
        setEntries(
          data.map((e) => ({
            ...e,
            entry_data: (typeof e.entry_data === 'object' && e.entry_data !== null ? e.entry_data : {}) as Record<string, unknown>,
            filler_name: nameMap.get(e.filled_by) || "Unknown",
          }))
        );
      } else {
        setEntries([]);
      }
    };
    fetch();
  }, [clientId, toolType, refreshKey]);

  const handleDelete = async (id: string) => {
    const { error } = await (supabase.from("clinical_entries") as any).delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete entry");
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Entry deleted");
    }
  };

  if (!clientId) return null;
  if (entries.length === 0) return <p className="text-sm text-muted-foreground mt-4">No entries yet for this client.</p>;

  return (
    <ScrollArea className="mt-6 max-h-[600px]">
      <div className="space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="border-border/50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  {format(new Date(entry.entry_date), "dd MMM yyyy, HH:mm")}
                </CardTitle>
                <Badge variant="secondary" className="text-xs mt-1">{entry.filler_name}</Badge>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(entry.id)}>
                <Trash2 size={14} />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {renderEntry(entry.entry_data, entry.notes)}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default EntryHistory;
