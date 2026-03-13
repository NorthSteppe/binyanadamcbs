import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Download, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateClinicalPdf } from "@/utils/clinicalPdf";

interface PdfSection {
  label: string;
  value: string;
}

interface EntryHistoryProps {
  clientId: string;
  toolType: string;
  toolTitle?: string;
  renderEntry: (data: Record<string, unknown>, notes: string) => React.ReactNode;
  /** Return sections for PDF generation from entry data */
  getPdfSections?: (data: Record<string, unknown>) => PdfSection[];
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

const EntryHistory = ({ clientId, toolType, toolTitle, renderEntry, getPdfSections, refreshKey }: EntryHistoryProps) => {
  const { user, isStaff } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

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
          data.map((e: any) => ({
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

  const buildPdf = (entry: Entry) => {
    const sections = getPdfSections
      ? getPdfSections(entry.entry_data)
      : Object.entries(entry.entry_data)
          .filter(([, v]) => v && String(v).trim())
          .map(([k, v]) => ({
            label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            value: typeof v === "object" ? JSON.stringify(v, null, 2) : String(v),
          }));

    return generateClinicalPdf({
      toolTitle: toolTitle || toolType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      fillerName: entry.filler_name,
      entryDate: format(new Date(entry.entry_date), "dd MMM yyyy, HH:mm"),
      sections,
      notes: entry.notes,
    });
  };

  const handleDownloadPdf = (entry: Entry) => {
    const doc = buildPdf(entry);
    const fileName = `${toolTitle || toolType}_${format(new Date(entry.entry_date), "yyyy-MM-dd")}.pdf`;
    doc.save(fileName);
  };

  const handleUploadToPortal = async (entry: Entry) => {
    if (!user) return;
    setUploadingId(entry.id);
    try {
      const doc = buildPdf(entry);
      const blob = doc.output("blob");
      const fileName = `${toolTitle || toolType}_${format(new Date(entry.entry_date), "yyyy-MM-dd")}.pdf`;
      const filePath = `${clientId}/${Date.now()}_${fileName}`;

      const { error: uploadError } = await supabase.storage.from("client-documents").upload(filePath, blob, { contentType: "application/pdf" });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("client-documents").getPublicUrl(filePath);
      const { error: dbError } = await supabase.from("client_documents").insert({
        client_id: clientId,
        file_name: fileName,
        file_url: urlData.publicUrl,
        file_type: "application/pdf",
        uploaded_by: user.id,
        notes: `Auto-generated from ${toolTitle || toolType}`,
      });
      if (dbError) throw dbError;
      toast.success("PDF uploaded to client portal");
    } catch (err: any) {
      toast.error("Failed to upload: " + (err.message || "Unknown error"));
    } finally {
      setUploadingId(null);
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
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" title="Download PDF" onClick={() => handleDownloadPdf(entry)}>
                  <Download size={14} />
                </Button>
                {isStaff && (
                  <Button
                    variant="ghost" size="icon"
                    className="text-muted-foreground hover:text-primary"
                    title="Upload to client portal"
                    onClick={() => handleUploadToPortal(entry)}
                    disabled={uploadingId === entry.id}
                  >
                    {uploadingId === entry.id ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(entry.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
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
