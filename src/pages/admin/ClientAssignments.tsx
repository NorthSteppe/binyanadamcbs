import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Profile { id: string; full_name: string; }
interface Assignment { id: string; client_id: string; assignee_id: string; client_name?: string; assignee_name?: string; }

const ClientAssignments = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Profile[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selClient, setSelClient] = useState("");
  const [selAssignee, setSelAssignee] = useState("");

  const fetchAll = async () => {
    // Get all profiles
    const { data: profiles } = await supabase.from("profiles").select("id, full_name");
    // Get roles to separate clients from team/admin
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const roleMap = new Map<string, string[]>();
    roles?.forEach(r => {
      const existing = roleMap.get(r.user_id) || [];
      existing.push(r.role);
      roleMap.set(r.user_id, existing);
    });

    const allProfiles = profiles || [];
    setClients(allProfiles.filter(p => {
      const r = roleMap.get(p.id) || [];
      return r.includes("client") && !r.includes("admin") && !r.includes("team_member");
    }));
    setTeamMembers(allProfiles.filter(p => {
      const r = roleMap.get(p.id) || [];
      return r.includes("admin") || r.includes("team_member");
    }));

    const { data: assigns } = await supabase.from("client_assignments").select("*");
    if (assigns) {
      const enriched = assigns.map(a => ({
        ...a,
        client_name: allProfiles.find(p => p.id === a.client_id)?.full_name || "Unknown",
        assignee_name: allProfiles.find(p => p.id === a.assignee_id)?.full_name || "Unknown",
      }));
      setAssignments(enriched);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const assign = async () => {
    if (!selClient || !selAssignee) return;
    const { error } = await supabase.from("client_assignments").insert({ client_id: selClient, assignee_id: selAssignee });
    if (error) {
      toast({ title: "Error", description: error.message.includes("duplicate") ? "Already assigned" : error.message, variant: "destructive" });
    } else {
      toast({ title: "Client assigned" });
      fetchAll();
      setSelClient("");
      setSelAssignee("");
    }
  };

  const remove = async (id: string) => {
    await supabase.from("client_assignments").delete().eq("id", id);
    toast({ title: "Unassigned" });
    fetchAll();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl mb-2 flex items-center gap-3"><Users size={28} className="text-primary" /> Client Assignments</h1>
            <p className="text-muted-foreground mb-8">Assign clients to therapists or admins.</p>
          </motion.div>

          <div className="bg-card rounded-xl border border-border/50 p-5 mb-8">
            <div className="grid sm:grid-cols-3 gap-3 items-end">
              <div>
                <p className="text-xs font-semibold mb-1">Client</p>
                <Select value={selClient} onValueChange={setSelClient}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.filter(c => c.id).map(c => <SelectItem key={c.id} value={c.id}>{c.full_name || "Unnamed"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">Assign to</p>
                <Select value={selAssignee} onValueChange={setSelAssignee}>
                  <SelectTrigger><SelectValue placeholder="Select team member" /></SelectTrigger>
                  <SelectContent>
                    {teamMembers.filter(t => t.id).map(t => <SelectItem key={t.id} value={t.id}>{t.full_name || "Unnamed"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={assign} className="rounded-full gap-2" disabled={!selClient || !selAssignee}>
                <UserPlus size={16} /> Assign
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {assignments.length === 0 && <p className="text-sm text-muted-foreground">No assignments yet.</p>}
            {assignments.map(a => (
              <div key={a.id} className="flex items-center justify-between bg-card rounded-xl border border-border/50 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{a.client_name}</p>
                  <p className="text-xs text-muted-foreground">→ {a.assignee_name}</p>
                </div>
                <Button size="sm" variant="destructive" className="rounded-full" onClick={() => remove(a.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ClientAssignments;
