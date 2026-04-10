import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MessageSquare, BookOpen, Clock, Upload, FileText, CheckCircle2, Circle, Phone, Mail, ListTodo, Timer, LayoutDashboard, Sparkles, Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


interface ClientTodo {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
  due_date: string | null;
}

interface ClientDoc {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [todos, setTodos] = useState<ClientTodo[]>([]);
  const [documents, setDocuments] = useState<ClientDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const portalT = (t as any).portal || {};

  useEffect(() => {
    if (!user) return;

    supabase.from("sessions").select("*").eq("client_id", user.id)
      .gte("session_date", new Date().toISOString()).order("session_date", { ascending: true }).limit(3)
      .then(({ data }) => { if (data) setUpcomingSessions(data); });

    supabase.from("messages").select("id", { count: "exact" }).eq("recipient_id", user.id).eq("read", false)
      .then(({ count }) => { if (count) setUnreadCount(count); });

    supabase.from("client_todos").select("*").eq("client_id", user.id).order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setTodos(data as ClientTodo[]); });

    supabase.from("client_documents").select("*").eq("client_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setDocuments(data as ClientDoc[]); });
  }, [user]);

  const toggleTodo = async (todo: ClientTodo) => {
    const { error } = await supabase.from("client_todos").update({ is_completed: !todo.is_completed }).eq("id", todo.id);
    if (!error) setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);

    const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const MAX_SIZE_MB = 10;

    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: "Invalid file type", description: `"${file.name}" is not an allowed file type.`, variant: "destructive" });
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast({ title: "File too large", description: `"${file.name}" exceeds the ${MAX_SIZE_MB} MB limit.`, variant: "destructive" });
        continue;
      }
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("client-documents").upload(filePath, file);
      if (uploadError) {
        toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
        continue;
      }
      await supabase.from("client_documents").insert({
        client_id: user.id,
        file_name: file.name,
        file_url: filePath,
        file_type: file.type,
        uploaded_by: user.id,
      });
    }

    const { data } = await supabase.from("client_documents").select("*").eq("client_id", user.id).order("created_at", { ascending: false });
    if (data) setDocuments(data as ClientDoc[]);
    setUploading(false);
    toast({ title: "Documents uploaded successfully" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const completedTasks = todos.filter(t => t.is_completed).length;
  const totalTasks = todos.length;
  const taskProgress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-5xl">

          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display tracking-tight mb-1">
              {portalT.welcome || "Welcome back"}{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-muted-foreground text-sm">{portalT.dashboardSubtitle || "Here's your schedule and tasks for today."}</p>
          </motion.div>

          {/* ── PRIMARY: Sessions + Tasks ── */}
          <div className="grid lg:grid-cols-2 gap-5 mb-6">

            {/* Upcoming sessions */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <div className="bg-card rounded-2xl border border-border/50 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock size={14} className="text-primary" />
                    </div>
                    {portalT.upcoming || "Upcoming Sessions"}
                  </h2>
                  <Link
                    to="/portal/productivity?tab=calendar"
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    View calendar →
                  </Link>
                </div>

                {upcomingSessions.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 bg-muted/30 rounded-xl border border-dashed border-border/60">
                    <Calendar className="h-8 w-8 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">{portalT.noSessions || "No upcoming sessions."}</p>
                    <p className="text-xs text-muted-foreground mb-4">Ready to book your next one?</p>
                    <Link to="/portal/booking">
                      <Button size="sm" className="rounded-full h-8 px-5 text-xs">Book a Session</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 flex-1">
                    {upcomingSessions.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 bg-background rounded-xl p-4 border border-border/30">
                        <div className="shrink-0 text-center bg-primary/8 rounded-lg px-3 py-2 min-w-[52px]">
                          <p className="text-[10px] text-primary font-medium uppercase">
                            {new Date(s.session_date).toLocaleDateString(undefined, { month: "short" })}
                          </p>
                          <p className="text-xl font-bold text-primary leading-none">
                            {new Date(s.session_date).getDate()}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{s.title || "Session"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(s.session_date).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                            {s.duration_minutes ? ` · ${s.duration_minutes} min` : ""}
                          </p>
                        </div>
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize shrink-0">{s.status || "scheduled"}</span>
                      </div>
                    ))}
                    <Link to="/portal/booking" className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors pt-1">
                      + Book another session
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* To-Do List */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <div className="bg-card rounded-2xl border border-border/50 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ListTodo size={14} className="text-primary" />
                    </div>
                    My Tasks
                  </h2>
                  {totalTasks > 0 && (
                    <span className="text-[11px] font-medium text-muted-foreground">{completedTasks}/{totalTasks} done</span>
                  )}
                </div>

                {totalTasks > 0 && (
                  <Progress value={taskProgress} className="h-1 mb-4" />
                )}

                {todos.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 bg-muted/30 rounded-xl border border-dashed border-border/60">
                    <Sparkles className="h-8 w-8 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-foreground">You're all caught up!</p>
                    <p className="text-xs text-muted-foreground mt-1">Tasks assigned by your therapist will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2 flex-1 overflow-y-auto max-h-72">
                    {todos.map((todo) => (
                      <button
                        key={todo.id}
                        onClick={() => toggleTodo(todo)}
                        className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all ${todo.is_completed ? "bg-muted/40 border-border/20 opacity-60" : "bg-background border-border/40 hover:border-primary/30"}`}
                      >
                        {todo.is_completed ? (
                          <CheckCircle2 size={17} className="text-primary mt-0.5 shrink-0" />
                        ) : (
                          <Circle size={17} className="text-muted-foreground mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${todo.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{todo.title}</p>
                          {todo.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{todo.description}</p>}
                          {todo.due_date && <p className="text-[10px] text-muted-foreground mt-0.5">Due {new Date(todo.due_date).toLocaleDateString()}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── SECONDARY: Quick Actions ── */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">Quick access</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Link to="/portal/booking" className="bg-primary text-primary-foreground rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-primary/90 transition-colors text-center">
                <Calendar size={20} />
                <span className="text-xs font-semibold">{portalT.bookSession || "Book Session"}</span>
              </Link>
              <Link to="/portal/messages" className="relative bg-card border border-border/50 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-primary/30 transition-all text-center">
                <MessageSquare size={20} className="text-primary" />
                <span className="text-xs font-semibold text-card-foreground">{portalT.messages || "Messages"}</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
                )}
              </Link>
              <Link to="/portal/resources" className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-primary/30 transition-all text-center">
                <BookOpen size={20} className="text-primary" />
                <span className="text-xs font-semibold text-card-foreground">{portalT.resources || "Resources"}</span>
              </Link>
              <Link to="/portal/toolkit" className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-primary/30 transition-all text-center">
                <Timer size={20} className="text-primary" />
                <span className="text-xs font-semibold text-card-foreground">Toolkit</span>
              </Link>
            </div>
          </motion.div>

          {/* ── Document Upload ── */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload size={14} className="text-primary" />
                  </div>
                  Documents
                </h2>
                <div>
                  <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" id="doc-upload" />
                  <Button variant="outline" size="sm" className="rounded-full gap-2 h-8 text-xs" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <Upload size={12} />
                    {uploading ? "Uploading…" : "Upload"}
                  </Button>
                </div>
              </div>
              {documents.length === 0 ? (
                <div className="text-center py-6 px-4 bg-muted/30 rounded-xl border border-dashed border-border/60">
                  <Files className="mx-auto h-7 w-7 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium text-foreground">No documents yet.</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Upload files to share with your therapist securely.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {documents.slice(0, 6).map((doc) => (
                    <button key={doc.id} onClick={async () => {
                      const { data, error } = await supabase.storage.from("client-documents").download(doc.file_url);
                      if (error || !data) return;
                      const url = URL.createObjectURL(data);
                      const a = document.createElement("a");
                      a.href = url; a.download = doc.file_name; a.click();
                      URL.revokeObjectURL(url);
                    }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/30 hover:border-primary/20 transition-colors text-left">
                      <FileText size={16} className="text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{doc.file_name}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Contact strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="font-medium">Need help?</span>
            <a href="tel:+447715460054" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Phone size={12} /> +44 7715 460054
            </a>
            <a href="mailto:adamdayan@bacbs.com" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Mail size={12} /> adamdayan@bacbs.com
            </a>
          </motion.div>

        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Dashboard;
