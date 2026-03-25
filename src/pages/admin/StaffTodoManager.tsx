import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ListTodo, Plus, Trash2, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Profile { id: string; full_name: string; }
interface StaffTodo {
  id: string; created_by: string; assigned_to: string; title: string;
  description: string; due_date: string | null; is_completed: boolean;
  created_at: string; assigned_name?: string; creator_name?: string;
}

const StaffTodoManager = () => {
  const { user, isAdmin } = useAuth();
  const [staffMembers, setStaffMembers] = useState<Profile[]>([]);
  const [todos, setTodos] = useState<StaffTodo[]>([]);
  const [assignedTo, setAssignedTo] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDue, setNewDue] = useState("");
  const [filter, setFilter] = useState<"all" | "mine" | "created">("all");

  const fetchStaff = async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id").in("role", ["admin", "team_member"]);
    if (roles) {
      const ids = roles.map(r => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      if (profiles) setStaffMembers(profiles);
    }
  };

  const fetchTodos = async () => {
    const { data } = await supabase.from("staff_todos").select("*").order("created_at", { ascending: false });
    if (data) {
      const userIds = [...new Set([...data.map(t => t.assigned_to), ...data.map(t => t.created_by)])];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
      const nameMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]));
      setTodos(data.map(t => ({
        ...t, assigned_name: nameMap[t.assigned_to] || "Unknown", creator_name: nameMap[t.created_by] || "Unknown",
      })));
    }
  };

  useEffect(() => { fetchStaff(); fetchTodos(); }, []);

  const addTodo = async () => {
    if (!assignedTo || !newTitle.trim() || !user) return;
    const { error } = await supabase.from("staff_todos").insert({
      created_by: user.id, assigned_to: assignedTo, title: newTitle.trim(),
      description: newDesc.trim(), due_date: newDue || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Task added"); setNewTitle(""); setNewDesc(""); setNewDue(""); fetchTodos(); }
  };

  const toggleComplete = async (id: string, current: boolean) => {
    await supabase.from("staff_todos").update({ is_completed: !current }).eq("id", id);
    fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    await supabase.from("staff_todos").delete().eq("id", id);
    toast.success("Deleted");
    fetchTodos();
  };

  const filtered = todos.filter(t => {
    if (filter === "mine") return t.assigned_to === user?.id;
    if (filter === "created") return t.created_by === user?.id;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl mb-2 flex items-center gap-3"><ListTodo size={28} className="text-primary" /> Staff To-Do List</h1>
            <p className="text-muted-foreground mb-8">Create and manage tasks for yourself and therapists.</p>
          </motion.div>

          {/* Create form */}
          <div className="bg-card rounded-xl border border-border/50 p-5 mb-8 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Assign to</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
                  <SelectContent>
                    {staffMembers.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name || "Unnamed"}</SelectItem>)}
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
            <Button onClick={addTodo} className="rounded-full gap-2" disabled={!assignedTo || !newTitle.trim()}>
              <Plus size={16} /> Add Task
            </Button>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-4">
            {(["all", "mine", "created"] as const).map(f => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} className="rounded-full text-xs capitalize" onClick={() => setFilter(f)}>
                {f === "all" ? "All Tasks" : f === "mine" ? "Assigned to Me" : "Created by Me"}
              </Button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-3">
            {filtered.length === 0 && <p className="text-sm text-muted-foreground">No tasks found.</p>}
            {filtered.map(todo => (
              <div key={todo.id} className={`flex items-center justify-between bg-card rounded-xl border border-border/50 p-4 ${todo.is_completed ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleComplete(todo.id, todo.is_completed)}>
                    {todo.is_completed ? <CheckCircle size={20} className="text-green-600" /> : <Circle size={20} className="text-muted-foreground" />}
                  </button>
                  <div>
                    <p className={`text-sm font-medium ${todo.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{todo.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Assigned to {todo.assigned_name} · by {todo.creator_name}
                      {todo.due_date ? ` · Due: ${new Date(todo.due_date).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => deleteTodo(todo.id)}>
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

export default StaffTodoManager;
