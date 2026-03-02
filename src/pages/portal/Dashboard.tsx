import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MessageSquare, BookOpen, Clock, Upload, FileText, CheckCircle2, Circle, Phone, Mail, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingAIChat from "@/components/FloatingAIChat";

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

    for (const file of Array.from(files)) {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("client-documents").upload(filePath, file);
      if (uploadError) {
        toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("client-documents").getPublicUrl(filePath);
      await supabase.from("client_documents").insert({
        client_id: user.id,
        file_name: file.name,
        file_url: urlData.publicUrl,
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl mb-2">
              {portalT.welcome || "Welcome back"}{profile?.full_name ? `, ${profile.full_name}` : ""}
            </h1>
            <p className="text-muted-foreground mb-10">{portalT.dashboardSubtitle || "Your client portal"}</p>
          </motion.div>

          {/* Big Book a Session Button */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Link to="/portal/booking">
              <div className="relative bg-primary text-primary-foreground rounded-2xl p-8 mb-8 flex items-center gap-5 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="bg-primary-foreground/20 rounded-xl p-4">
                  <Calendar size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{portalT.bookSession || "Book a Session"}</h2>
                  <p className="text-primary-foreground/80 text-sm mt-1">Choose from available services and pick a time that works for you</p>
                </div>
                <div className="ms-auto text-primary-foreground/60 group-hover:translate-x-1 transition-transform text-2xl">→</div>
              </div>
            </Link>
          </motion.div>

          {/* Quick links row */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Link to="/portal/messages" className="relative bg-card border border-border/50 rounded-2xl p-5 flex items-center gap-3 hover:border-primary/30 hover:shadow-sm transition-all block">
                <div className="bg-accent text-accent-foreground rounded-xl p-3"><MessageSquare size={20} /></div>
                <p className="text-sm font-semibold text-card-foreground">{portalT.messages || "Messages"}</p>
                {unreadCount > 0 && (
                  <span className="absolute top-3 end-3 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">{unreadCount}</span>
                )}
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Link to="/portal/resources" className="bg-card border border-border/50 rounded-2xl p-5 flex items-center gap-3 hover:border-primary/30 hover:shadow-sm transition-all block">
                <div className="bg-family text-family-foreground rounded-xl p-3"><BookOpen size={20} /></div>
                <p className="text-sm font-semibold text-card-foreground">{portalT.resources || "Resource Library"}</p>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="bg-card border border-border/50 rounded-2xl p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact Us</p>
                <div className="space-y-2">
                  <a href="tel:+447715460054" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                    <Phone size={14} className="text-primary" /> +44 7715 460054
                  </a>
                  <a href="mailto:adamdayan@bacbs.com" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                    <Mail size={14} className="text-primary" /> adamdayan@bacbs.com
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upcoming sessions */}
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <h2 className="text-lg mb-4 flex items-center gap-2 font-semibold">
                <Clock size={18} className="text-primary" />
                {portalT.upcoming || "Upcoming Sessions"}
              </h2>
              {upcomingSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">{portalT.noSessions || "No upcoming sessions."}</p>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-background rounded-xl p-4 border border-border/30">
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(s.session_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          {" · "}{s.duration_minutes} min
                        </p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">{s.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* To-Do List */}
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <h2 className="text-lg mb-4 flex items-center gap-2 font-semibold">
                <ListTodo size={18} className="text-primary" />
                To-Do List
              </h2>
              {todos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks assigned yet.</p>
              ) : (
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <button
                      key={todo.id}
                      onClick={() => toggleTodo(todo)}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all ${todo.is_completed ? "bg-muted/50 border-border/20" : "bg-background border-border/30 hover:border-primary/20"}`}
                    >
                      {todo.is_completed ? (
                        <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                      ) : (
                        <Circle size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className={`text-sm font-medium ${todo.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{todo.title}</p>
                        {todo.description && <p className="text-xs text-muted-foreground mt-0.5">{todo.description}</p>}
                        {todo.due_date && <p className="text-[10px] text-muted-foreground mt-1">Due: {new Date(todo.due_date).toLocaleDateString()}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Document Upload */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <h2 className="text-lg mb-4 flex items-center gap-2 font-semibold">
                <Upload size={18} className="text-primary" />
                Documents
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" id="doc-upload" />
                <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <Upload size={14} />
                  {uploading ? "Uploading..." : "Upload Documents"}
                </Button>
              </div>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {documents.slice(0, 6).map((doc) => (
                    <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/30 hover:border-primary/20 transition-colors">
                      <FileText size={16} className="text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{doc.file_name}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
      <FloatingAIChat />
    </div>
  );
};

export default Dashboard;
