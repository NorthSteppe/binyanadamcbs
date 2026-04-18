import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Upload, Sparkles, FileText, ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface StorySource {
  id: string;
  file_name: string;
  file_path: string;
  status: string;
  generated_post_id: string | null;
  voice_used: string | null;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

const StoryEngine = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sources, setSources] = useState<StorySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [posts, setPosts] = useState<Record<string, { slug: string; title: string }>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("story_sources")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    } else {
      setSources(data || []);
      const ids = (data || []).map((s) => s.generated_post_id).filter(Boolean) as string[];
      if (ids.length) {
        const { data: bp } = await supabase.from("blog_posts").select("id, slug, title").in("id", ids);
        const map: Record<string, { slug: string; title: string }> = {};
        (bp || []).forEach((p) => (map[p.id] = { slug: p.slug, title: p.title }));
        setPosts(map);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user) return;
    setUploading(true);
    let ok = 0;
    for (const file of files) {
      try {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${user.id}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage.from("story-sources").upload(path, file);
        if (upErr) throw upErr;
        const { error: insErr } = await supabase.from("story_sources").insert({
          uploaded_by: user.id,
          file_path: path,
          file_name: file.name,
          file_size_bytes: file.size,
          status: "pending",
        });
        if (insErr) throw insErr;
        ok++;
      } catch (err: any) {
        toast({ title: `Failed: ${file.name}`, description: err.message, variant: "destructive" });
      }
    }
    setUploading(false);
    e.target.value = "";
    if (ok) toast({ title: `Uploaded ${ok} file(s)`, description: "Will be processed on next run, or trigger now." });
    load();
  };

  const triggerNow = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-story-engine");
      if (error) throw error;
      toast({ title: "Engine ran", description: `Processed ${data?.processed ?? 0} source(s).` });
      load();
    } catch (err: any) {
      toast({ title: "Engine failed", description: err.message, variant: "destructive" });
    }
    setProcessing(false);
  };

  const remove = async (s: StorySource) => {
    if (!confirm(`Delete "${s.file_name}"?`)) return;
    await supabase.storage.from("story-sources").remove([s.file_path]);
    await supabase.from("story_sources").delete().eq("id", s.id);
    load();
  };

  const statusVariant = (s: string) =>
    s === "published" ? "default" : s === "failed" ? "destructive" : s === "processing" ? "secondary" : "outline";

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-primary" /> Story Engine
            </h1>
            <p className="text-muted-foreground mt-1">
              Upload source stories. They are fully fictionalised, published to Insights, and broadcast.
            </p>
          </div>
          <Button onClick={triggerNow} disabled={processing} variant="default">
            {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Run engine now
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" /> Upload sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              multiple
              accept=".txt,.md,.markdown"
              onChange={handleUpload}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Plain text or markdown only. Files are private and admin-only.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue & history ({sources.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : sources.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No sources yet — upload above.</p>
            ) : (
              <div className="space-y-2">
                {sources.map((s) => {
                  const post = s.generated_post_id ? posts[s.generated_post_id] : null;
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{s.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(s.created_at).toLocaleString()}
                            {s.voice_used && ` · voice: ${s.voice_used}`}
                          </p>
                          {s.error_message && (
                            <p className="text-xs text-destructive mt-1">{s.error_message}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={statusVariant(s.status) as any}>{s.status}</Badge>
                        {post && (
                          <Link to={`/insights/article/${post.slug}`} target="_blank">
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => remove(s)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoryEngine;
