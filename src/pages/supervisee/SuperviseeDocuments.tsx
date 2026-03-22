import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileText, Upload, Trash2, Download, File } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_SIZE = 10 * 1024 * 1024;

const SuperviseeDocuments = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["supervisee-documents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_documents")
        .select("*")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!ALLOWED_TYPES.includes(file.type)) { toast.error("File type not allowed"); return; }
    if (file.size > MAX_SIZE) { toast.error("File must be under 10MB"); return; }

    setUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: storageError } = await supabase.storage.from("client-documents").upload(filePath, file);
      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage.from("client-documents").getPublicUrl(filePath);
      const { error: dbError } = await supabase.from("client_documents").insert({
        client_id: user.id,
        uploaded_by: user.id,
        file_name: file.name,
        file_url: filePath,
        file_type: file.type,
        notes,
      });
      if (dbError) throw dbError;

      qc.invalidateQueries({ queryKey: ["supervisee-documents"] });
      setNotes("");
      toast.success("Document uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from("client-documents").download(filePath);
    if (error) { toast.error("Download failed"); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteMutation = useMutation({
    mutationFn: async (doc: any) => {
      await supabase.storage.from("client-documents").remove([doc.file_url]);
      const { error } = await supabase.from("client_documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supervisee-documents"] });
      toast.success("Document deleted");
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 text-primary rounded-xl p-2.5">
              <FileText size={22} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Documents</h1>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <h3 className="font-medium text-card-foreground mb-3">Upload Document</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Notes (optional)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Describe this document..." />
              </div>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <Input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx" disabled={uploading} />
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors">
                    <Upload size={16} />
                    {uploading ? "Uploading..." : "Choose File"}
                  </div>
                </label>
                <span className="text-xs text-muted-foreground">PDF, images, Word docs — max 10MB</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading documents...</div>
          ) : docs.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <File className="mx-auto mb-3 text-muted-foreground" size={36} />
              <p className="text-muted-foreground">No documents yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-card-foreground text-sm truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(doc.created_at), "dd MMM yyyy")}
                      {doc.notes && ` · ${doc.notes}`}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <Button size="icon" variant="ghost" onClick={() => handleDownload(doc.file_url, doc.file_name)}><Download size={16} /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(doc)}><Trash2 size={16} /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SuperviseeDocuments;
