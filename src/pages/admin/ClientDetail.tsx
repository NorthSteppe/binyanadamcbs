import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Plus, Calendar, FileText, Clock, Upload, CheckCircle2, Circle, Trash2, Pencil, Check, X, UserPlus, PoundSterling } from "lucide-react";
import ClientFinancialTab from "@/components/admin/ClientFinancialTab";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientOverviewPanel from "@/components/admin/ClientOverviewPanel";
import { toast } from "sonner";

const ClientDetail = () => {
  const { clientId: rawId } = useParams<{ clientId: string }>();
  const { user, isAdmin } = useAuth();

  // Manual client routing: /admin/clients/manual:<uuid>
  const isManual = rawId?.startsWith("manual:") ?? false;
  const manualClientId = isManual ? rawId!.slice("manual:".length) : null;
  const realClientId = isManual ? null : rawId ?? null;

  const [profile, setProfile] = useState<{ full_name: string; created_at: string; email?: string; phone?: string; linked_user_id?: string | null } | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", category: "general" });
  const [todoDialogOpen, setTodoDialogOpen] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rename
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [canRename, setCanRename] = useState(false);

  const fetchData = async () => {
    if (!rawId) return;

    if (isManual && manualClientId) {
      const [mcRes, sessionsRes, notesRes, todosRes, docsRes] = await Promise.all([
        supabase.from("manual_clients").select("full_name, email, phone, created_at, linked_user_id, created_by").eq("id", manualClientId).single(),
        supabase.from("sessions").select("*").eq("manual_client_id", manualClientId).order("session_date", { ascending: false }),
        supabase.from("client_notes").select("*").eq("manual_client_id", manualClientId).order("created_at", { ascending: false }),
        supabase.from("client_todos").select("*").eq("manual_client_id", manualClientId).order("created_at", { ascending: false }),
        supabase.from("client_documents").select("*").eq("manual_client_id", manualClientId).order("created_at", { ascending: false }),
      ]);
      if (mcRes.data) {
        setProfile({
          full_name: mcRes.data.full_name,
          created_at: mcRes.data.created_at,
          email: mcRes.data.email,
          phone: mcRes.data.phone,
          linked_user_id: mcRes.data.linked_user_id,
        });
        // Manual: creator or admin can rename
        setCanRename(isAdmin || mcRes.data.created_by === user?.id);
      }
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (notesRes.data) setNotes(notesRes.data);
      if (todosRes.data) setTodos(todosRes.data);
      if (docsRes.data) setDocuments(docsRes.data);
    } else if (realClientId) {
      const [profileRes, sessionsRes, notesRes, todosRes, docsRes, assignRes] = await Promise.all([
        supabase.from("profiles").select("full_name, created_at").eq("id", realClientId).single(),
        supabase.from("sessions").select("*").eq("client_id", realClientId).order("session_date", { ascending: false }),
        supabase.from("client_notes").select("*").eq("client_id", realClientId).order("created_at", { ascending: false }),
        supabase.from("client_todos").select("*").eq("client_id", realClientId).order("created_at", { ascending: false }),
        supabase.from("client_documents").select("*").eq("client_id", realClientId).order("created_at", { ascending: false }),
        supabase.from("client_assignments").select("assignee_id").eq("client_id", realClientId),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (notesRes.data) setNotes(notesRes.data);
      if (todosRes.data) setTodos(todosRes.data);
      if (docsRes.data) setDocuments(docsRes.data);
      const isAssigned = (assignRes.data ?? []).some((a) => a.assignee_id === user?.id);
      setCanRename(isAdmin || isAssigned);
    }
  };

  useEffect(() => { fetchData(); }, [rawId]);

  const targetCols = isManual
    ? { manual_client_id: manualClientId }
    : { client_id: realClientId };

  const handleSaveName = async () => {
    if (!nameDraft.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (isManual && manualClientId) {
      const { error } = await supabase.from("manual_clients").update({ full_name: nameDraft.trim() }).eq("id", manualClientId);
      if (error) return toast.error("Failed: " + error.message);
    } else if (realClientId) {
      const { error } = await supabase.from("profiles").update({ full_name: nameDraft.trim() }).eq("id", realClientId);
      if (error) return toast.error("Failed: " + error.message);
    }
    toast.success("Name updated");
    setEditingName(false);
    fetchData();
  };

  const handleAddNote = async () => {
    if (!newNote.title || !user) return;
    const { error } = await supabase.from("client_notes").insert({
      ...targetCols,
      author_id: user.id,
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
    } as any);
    if (error) {
      toast.error("Failed to add note: " + error.message);
    } else {
      toast.success("Note added");
      setNoteDialogOpen(false);
      setNewNote({ title: "", content: "", category: "general" });
      fetchData();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    await supabase.from("client_notes").delete().eq("id", noteId);
    fetchData();
  };

  const handleAddTodo = async () => {
    if (!newTodo.title || !user) return;
    const { error } = await supabase.from("client_todos").insert({
      ...targetCols,
      created_by: user.id,
      title: newTodo.title,
      description: newTodo.description,
    } as any);
    if (error) toast.error("Failed to add task: " + error.message);
    else {
      toast.success("Task added");
      setTodoDialogOpen(false);
      setNewTodo({ title: "", description: "" });
      fetchData();
    }
  };

  const handleDeleteDocument = async (doc: any) => {
    const storagePath = doc.file_url.includes("/storage/v1/object/public/client-documents/")
      ? doc.file_url.split("/storage/v1/object/public/client-documents/")[1]
      : doc.file_url;
    await supabase.storage.from("client-documents").remove([storagePath]);
    await supabase.from("client_documents").delete().eq("id", doc.id);
    fetchData();
    toast.success("Document deleted");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    const folderId = isManual ? `manual_${manualClientId}` : realClientId;
    setUploading(true);
    for (const file of Array.from(files)) {
      const filePath = `${folderId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("client-documents").upload(filePath, file);
      if (uploadError) {
        toast.error("Upload failed: " + uploadError.message);
        continue;
      }
      const { data: urlData } = supabase.storage.from("client-documents").getPublicUrl(filePath);
      await supabase.from("client_documents").insert({
        ...targetCols,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        uploaded_by: user.id,
      } as any);
    }
    fetchData();
    setUploading(false);
    toast.success("Documents uploaded");
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 text-center text-muted-foreground">Loading...</div>
        <Footer />
      </div>
    );
  }

  const noteCategories = ["general", "session-note", "assessment", "plan", "correspondence", "report"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <Link to="/admin/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft size={14} /> Back to Clients
          </Link>

          <div className="flex items-center justify-between mb-8 gap-4">
            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    className="text-2xl font-bold h-12"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                  />
                  <Button size="icon" variant="default" onClick={handleSaveName}><Check size={16} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingName(false)}><X size={16} /></Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                  {isManual && (
                    <Badge variant="outline" className="text-[10px]">manual</Badge>
                  )}
                  {canRename && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => { setNameDraft(profile.full_name); setEditingName(true); }}
                      title="Rename client"
                    >
                      <Pencil size={13} />
                    </Button>
                  )}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {isManual ? "Added " : "Client since "}
                {format(new Date(profile.created_at), "MMMM yyyy")}
                {isManual && profile.email && <> · {profile.email}</>}
                {isManual && profile.phone && <> · {profile.phone}</>}
              </p>
              {isManual && !profile.linked_user_id && (
                <Link
                  to="/admin/manual-clients"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                >
                  <UserPlus size={12} /> Pair with a registered account to grant portal access
                </Link>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Badge variant="secondary" className="gap-1"><Calendar size={12} /> {sessions.length} sessions</Badge>
              <Badge variant="secondary" className="gap-1"><FileText size={12} /> {notes.length} notes</Badge>
            </div>
          </div>

          <Tabs defaultValue={isManual ? "notes" : "overview"} className="space-y-6">
            <TabsList className="rounded-full">
              {!isManual && <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>}
              <TabsTrigger value="notes" className="rounded-full">Documentation</TabsTrigger>
              <TabsTrigger value="sessions" className="rounded-full">Sessions</TabsTrigger>
              <TabsTrigger value="todos" className="rounded-full">To-Dos</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-full">Documents</TabsTrigger>
            </TabsList>

            {!isManual && (
              <TabsContent value="overview">
                <div className="bg-card border border-border/50 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Client overview</h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    Manual fields (stage, tags, risk, summary). Everything else on this page is auto-populated.
                  </p>
                  {realClientId && <ClientOverviewPanel clientId={realClientId} />}
                </div>
              </TabsContent>
            )}

            <TabsContent value="notes">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Documentation & Notes</h2>
                <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-full gap-2"><Plus size={14} /> Add Note</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add Client Note</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Input placeholder="Note title" value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} />
                      <Select value={newNote.category} onValueChange={(v) => setNewNote({ ...newNote, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {noteCategories.map((c) => (
                            <SelectItem key={c} value={c}>{c.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea placeholder="Note content..." rows={6} value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} />
                      <Button onClick={handleAddNote} className="w-full rounded-full">Save Note</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {notes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/50">
                  No documentation yet. Add your first note above.
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-card border border-border/50 rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-card-foreground">{note.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px]">{note.category.replace("-", " ")}</Badge>
                            <span className="text-[10px] text-muted-foreground">{format(new Date(note.created_at), "MMM d, yyyy · HH:mm")}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={() => handleDeleteNote(note.id)}>
                          Delete
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground mt-3 prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sessions">
              <h2 className="text-lg font-semibold mb-4">Session History</h2>
              {sessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/50">No sessions found.</div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-card border border-border/50 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-primary" />
                        <div>
                          <p className="text-sm font-medium">{s.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(s.session_date), "EEE, MMM d, yyyy · HH:mm")} · {s.duration_minutes} min
                          </p>
                        </div>
                      </div>
                      <Badge variant={s.status === "completed" ? "default" : s.status === "cancelled" ? "destructive" : "secondary"} className="capitalize text-xs">
                        {s.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="todos">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Client Tasks & Homework</h2>
                <Dialog open={todoDialogOpen} onOpenChange={setTodoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-full gap-2"><Plus size={14} /> Assign Task</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Assign Task to Client</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Input placeholder="Task title" value={newTodo.title} onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })} />
                      <Textarea placeholder="Task description..." rows={3} value={newTodo.description} onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })} />
                      <Button onClick={handleAddTodo} className="w-full rounded-full">Assign Task</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {todos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/50">No tasks assigned yet.</div>
              ) : (
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div key={todo.id} className={`flex items-start gap-3 p-4 rounded-xl border ${todo.is_completed ? "bg-muted/50 border-border/20" : "bg-card border-border/50"}`}>
                      {todo.is_completed ? <CheckCircle2 size={18} className="text-primary mt-0.5" /> : <Circle size={18} className="text-muted-foreground mt-0.5" />}
                      <div>
                        <p className={`text-sm font-medium ${todo.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{todo.title}</p>
                        {todo.description && <p className="text-xs text-muted-foreground mt-1">{todo.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Client Documents</h2>
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
                  <Button size="sm" className="rounded-full gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <Upload size={14} /> {uploading ? "Uploading..." : "Upload Document"}
                  </Button>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/50">No documents uploaded.</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="group flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText size={16} className="text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(doc.created_at), "MMM d, yyyy")}</p>
                        </div>
                      </a>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDocument(doc)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ClientDetail;
