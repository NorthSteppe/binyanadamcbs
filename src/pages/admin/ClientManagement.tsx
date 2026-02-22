import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, User, Calendar, FileText, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

interface Client {
  id: string;
  full_name: string;
  created_at: string;
  session_count: number;
  next_session: string | null;
  note_count: number;
}

const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // Get all clients (users with client role)
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "client");
      if (!roles || roles.length === 0) { setLoading(false); return; }

      const clientIds = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("id", clientIds);

      // Get session counts and next sessions
      const { data: sessions } = await supabase
        .from("sessions")
        .select("client_id, session_date, status")
        .in("client_id", clientIds)
        .order("session_date", { ascending: true });

      // Get note counts
      const { data: notes } = await supabase
        .from("client_notes")
        .select("client_id")
        .in("client_id", clientIds);

      const now = new Date().toISOString();
      const enriched: Client[] = (profiles || []).map((p) => {
        const clientSessions = (sessions || []).filter((s) => s.client_id === p.id);
        const upcoming = clientSessions.find((s) => s.session_date >= now && s.status === "scheduled");
        const clientNotes = (notes || []).filter((n) => n.client_id === p.id);
        return {
          id: p.id,
          full_name: p.full_name,
          created_at: p.created_at,
          session_count: clientSessions.length,
          next_session: upcoming?.session_date || null,
          note_count: clientNotes.length,
        };
      });
      setClients(enriched);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = clients.filter((c) => c.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Client Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Track clients, sessions, and documentation</p>
          </div>

          <div className="relative mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading clients...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No clients found.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((client) => (
                <Link
                  key={client.id}
                  to={`/admin/clients/${client.id}`}
                  className="flex items-center justify-between bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <User size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground">{client.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Client since {format(new Date(client.created_at), "MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Calendar size={12} /> {client.session_count} sessions
                    </Badge>
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <FileText size={12} /> {client.note_count} notes
                    </Badge>
                    {client.next_session && (
                      <Badge variant="outline" className="gap-1 text-xs text-primary border-primary/30">
                        Next: {format(new Date(client.next_session), "MMM d")}
                      </Badge>
                    )}
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ClientManagement;
