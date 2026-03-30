import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Plus, Calendar, FileText, Clock, Upload, ListTodo, CheckCircle2, Circle } from "lucide-react";
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
import { toast } from "sonner";

const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; created_at: string } | null>(null);
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

  const fetchData = async () => {
    if (!clientId) return;
    const [profileRes, sessionsRes, notesRes, todosRes, docsRes] = await Promise.all([
      supabase.from("profiles").select("full_name, created_at").eq("id", clientId).single(),
      supabase.from("sessions").select("*").eq("client_id", clientId).order("session_date", { ascending: false }),
      supabase.from("client_notes").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
      supabase.from("client_todos").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
      supabase.from("client_documents").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (sessionsRes.data) setSessions(sessionsRes.data);
    if (notesRes.data) setNotes(notesRes.data);
    if (todosRes.data) setTodos(todosRes.data);
    if (docsRes.data) setDocuments(docsRes.data);
  };

  useEffect(() => { fetchData(); }, [clientId]);

  const handleAddNote = async () => {
    if (!newNote.title || !clientId || !user) return;
    const { error } = await supabase.from("client_notes").insert({
      client_id: clientId,
      author_id: user.id,
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
    });
    if (error) {
      toast.error("Failed to add note");
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
    if (!newTodo.title || !clientId || !user) return;
    const { error } = await supabase.from("client_todos").insert({
      client_id: clientId,
      created_by: user.id,
      title: newTodo.title,
      description: newTodo.description,
    });
    if (error) toast.error("Failed to add task");
    else {
      toast.success("Task added");
      setTodoDialogOpen(false);
      setNewTodo({ title: "", description: "" });
      fetchData();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !clientId || !user) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const filePath = `${clientId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("client-documents").upload(filePath, file);
      if (uploadError) {
        toast.error("Upload failed: " + uploadError.message);
        continue;
      }
      const { data: urlData } = supabase.storage.from("client-documents").getPublicUrl(filePath);
      await supabase.from("client_documents").insert({
        client_id: clientId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        uploaded_by: user.id,
      });
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

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">{profile.full_name}</h1>
              <p className="text-sm text-muted-foreground">Client since {format(new Date(profile.created_at), "MMMM yyyy")}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="gap-1"><Calendar size={12} /> {sessions.length} sessions</Badge>
              <Badge variant="secondary" className="gap-1"><FileText size={12} /> {notes.length} notes</Badge>
            </div>
          </div>

          <Tabs defaultValue="notes" className="space-y-6">
            <TabsList className="rounded-full">
              <TabsTrigger value="notes" className="rounded-full">Documentation</TabsTrigger>
              <TabsTrigger value="sessions" className="rounded-full">Sessions</TabsTrigger>
              <TabsTrigger value="todos" className="rounded-full">To-Dos</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-full">Documents</TabsTrigger>
            </TabsList>

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
                    <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                      <FileText size={16} className="text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(doc.created_at), "MMM d, yyyy")}</p>
                      </div>
                    </a>
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
