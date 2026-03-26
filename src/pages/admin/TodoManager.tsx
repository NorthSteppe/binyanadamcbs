import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ListTodo, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Profile { id: string; full_name: string; }
interface Todo { id: string; client_id: string; title: string; description: string; is_completed: boolean; due_date: string | null; client_name?: string; }

const TodoManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [clients, setClients] = useState<Profile[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selClient, setSelClient] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDue, setNewDue] = useState("");

  const { isAdmin } = useAuth();

  const fetchAll = async () => {
    let clientList: Profile[] = [];
    if (isAdmin) {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name");
      clientList = profiles || [];
    } else {
      // Team members: only assigned clients
      const { data: assignments } = await supabase.from("client_assignments").select("client_id");
      if (assignments && assignments.length > 0) {
        const ids = assignments.map(a => a.client_id);
        const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
        clientList = profiles || [];
      }
    }
    setClients(clientList);

    const { data: todoData } = await supabase.from("client_todos").select("*").order("created_at", { ascending: false });
    if (todoData) {
      setTodos(todoData.map(t => ({ ...t, client_name: allProfiles.find(p => p.id === t.client_id)?.full_name || "Unknown" })) as Todo[]);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const addTodo = async () => {
    if (!selClient || !newTitle.trim() || !user) return;
    const { error } = await supabase.from("client_todos").insert({
      client_id: selClient,
      title: newTitle.trim(),
      description: newDesc.trim(),
      due_date: newDue || null,
      created_by: user.id,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "To-do added" }); setNewTitle(""); setNewDesc(""); setNewDue(""); fetchAll(); }
  };

  const deleteTodo = async (id: string) => {
    await supabase.from("client_todos").delete().eq("id", id);
    toast({ title: "Deleted" });
    fetchAll();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl mb-2 flex items-center gap-3"><ListTodo size={28} className="text-primary" /> Client To-Do Manager</h1>
            <p className="text-muted-foreground mb-8">Create tasks for clients to complete.</p>
          </motion.div>

          <div className="bg-card rounded-xl border border-border/50 p-5 mb-8 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Client</Label>
                <Select value={selClient} onValueChange={setSelClient}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name || "Unnamed"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Due Date (optional)</Label>
                <Input type="date" value={newDue} onChange={e => setNewDue(e.target.value)} />
              </div>
            </div>
            <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Task title" />
            <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" />
            <Button onClick={addTodo} className="rounded-full gap-2" disabled={!selClient || !newTitle.trim()}>
              <Plus size={16} /> Add To-Do
            </Button>
          </div>

          <div className="space-y-3">
            {todos.length === 0 && <p className="text-sm text-muted-foreground">No to-dos created yet.</p>}
            {todos.map(todo => (
              <div key={todo.id} className="flex items-center justify-between bg-card rounded-xl border border-border/50 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{todo.title}</p>
                  <p className="text-xs text-muted-foreground">{todo.client_name} {todo.due_date ? `· Due: ${new Date(todo.due_date).toLocaleDateString()}` : ""}</p>
                  <span className={`text-[10px] font-semibold ${todo.is_completed ? "text-primary" : "text-muted-foreground"}`}>
                    {todo.is_completed ? "✓ Completed" : "○ Pending"}
                  </span>
                </div>
                <Button size="sm" variant="destructive" className="rounded-full" onClick={() => deleteTodo(todo.id)}>
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

export default TodoManager;
