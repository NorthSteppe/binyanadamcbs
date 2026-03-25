import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Plus, User, Calendar as CalIcon, Filter,
  CheckCircle2, Circle, Clock, ArrowRight, MoreHorizontal, Trash2, Pencil, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Profile { id: string; full_name: string; }
interface StaffTodo {
  id: string; created_by: string; assigned_to: string; title: string;
  description: string; due_date: string | null; is_completed: boolean;
  created_at: string; updated_at: string;
}

type BoardColumn = "todo" | "in_progress" | "done";

const COLUMNS: { key: BoardColumn; label: string; icon: React.ElementType; color: string }[] = [
  { key: "todo", label: "To Do", icon: Circle, color: "text-muted-foreground" },
  { key: "in_progress", label: "In Progress", icon: Clock, color: "text-amber-500" },
  { key: "done", label: "Done", icon: CheckCircle2, color: "text-green-500" },
];

const TaskBoard = () => {
  const { user, isAdmin } = useAuth();
  const [staff, setStaff] = useState<Profile[]>([]);
  const [todos, setTodos] = useState<StaffTodo[]>([]);
  const [nameMap, setNameMap] = useState<Record<string, string>>({});
  const [filterUser, setFilterUser] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<StaffTodo | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formAssignee, setFormAssignee] = useState("");
  const [formDue, setFormDue] = useState("");

  const fetchStaff = useCallback(async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id").in("role", ["admin", "team_member"]);
    if (roles) {
      const ids = roles.map(r => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      if (profiles) {
        setStaff(profiles);
        setNameMap(Object.fromEntries(profiles.map(p => [p.id, p.full_name || "Unnamed"])));
      }
    }
  }, []);

  const fetchTodos = useCallback(async () => {
    const { data } = await supabase.from("staff_todos").select("*").order("created_at", { ascending: false });
    if (data) {
      setTodos(data);
      // Also get names for anyone not already in nameMap
      const allIds = [...new Set([...data.map(t => t.assigned_to), ...data.map(t => t.created_by)])];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", allIds);
      if (profiles) {
        setNameMap(prev => ({ ...prev, ...Object.fromEntries(profiles.map(p => [p.id, p.full_name || "Unnamed"])) }));
      }
    }
  }, []);

  useEffect(() => { fetchStaff(); fetchTodos(); }, [fetchStaff, fetchTodos]);

  const getColumn = (todo: StaffTodo): BoardColumn => {
    if (todo.is_completed) return "done";
    // Use description field to store status temporarily (hack until we add status column)
    // Actually let's use a simple heuristic: if updated_at > created_at + 1min and not completed, it's "in_progress"
    // Better: use description prefix markers
    if (todo.description.startsWith("[IN_PROGRESS]")) return "in_progress";
    return "todo";
  };

  const moveTask = async (todo: StaffTodo, targetCol: BoardColumn) => {
    let updates: Record<string, any> = {};
    if (targetCol === "done") {
      updates = { is_completed: true, description: todo.description.replace("[IN_PROGRESS]", "").trim() };
    } else if (targetCol === "in_progress") {
      const desc = todo.description.replace("[IN_PROGRESS]", "").trim();
      updates = { is_completed: false, description: `[IN_PROGRESS]${desc}` };
    } else {
      updates = { is_completed: false, description: todo.description.replace("[IN_PROGRESS]", "").trim() };
    }
    await supabase.from("staff_todos").update(updates).eq("id", todo.id);
    fetchTodos();
  };

  const createTask = async () => {
    if (!formTitle.trim() || !formAssignee || !user) return;
    const { error } = await supabase.from("staff_todos").insert({
      created_by: user.id,
      assigned_to: formAssignee,
      title: formTitle.trim(),
      description: formDesc.trim(),
      due_date: formDue || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Task created");
    setCreateOpen(false);
    resetForm();
    fetchTodos();
  };

  const updateTask = async () => {
    if (!editingTodo || !formTitle.trim()) return;
    const { error } = await supabase.from("staff_todos").update({
      title: formTitle.trim(),
      description: formDesc.trim(),
      assigned_to: formAssignee || editingTodo.assigned_to,
      due_date: formDue || null,
    }).eq("id", editingTodo.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Task updated");
    setEditingTodo(null);
    resetForm();
    fetchTodos();
  };

  const deleteTask = async (id: string) => {
    await supabase.from("staff_todos").delete().eq("id", id);
    toast.success("Task deleted");
    fetchTodos();
  };

  const resetForm = () => {
    setFormTitle(""); setFormDesc(""); setFormAssignee(""); setFormDue("");
  };

  const openEdit = (todo: StaffTodo) => {
    setEditingTodo(todo);
    setFormTitle(todo.title);
    setFormDesc(todo.description.replace("[IN_PROGRESS]", "").trim());
    setFormAssignee(todo.assigned_to);
    setFormDue(todo.due_date || "");
  };

  const filtered = filterUser === "all" ? todos : todos.filter(t => t.assigned_to === filterUser);
  const columns = COLUMNS.map(col => ({
    ...col,
    tasks: filtered.filter(t => getColumn(t) === col.key),
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                    <LayoutDashboard size={22} />
                  </div>
                  <h1 className="text-3xl font-display tracking-tight text-foreground">Task Board</h1>
                </div>
                <p className="text-muted-foreground ml-14">Delegate, track, and manage team tasks.</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Filter by person */}
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-muted-foreground" />
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger className="w-44 h-9 rounded-xl text-sm">
                      <SelectValue placeholder="All team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Team Members</SelectItem>
                      {staff.filter(s => s.id).map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.full_name || "Unnamed"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Create task */}
                <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetForm(); }}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl gap-2">
                      <Plus size={16} /> New Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Task</DialogTitle>
                    </DialogHeader>
                    <TaskForm
                      staff={staff}
                      title={formTitle} setTitle={setFormTitle}
                      desc={formDesc} setDesc={setFormDesc}
                      assignee={formAssignee} setAssignee={setFormAssignee}
                      due={formDue} setDue={setFormDue}
                      onSubmit={createTask}
                      submitLabel="Create Task"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>

          {/* Kanban Board */}
          <div className="grid lg:grid-cols-3 gap-6">
            {columns.map((col, ci) => (
              <motion.div
                key={col.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ci * 0.1 }}
                className="bg-muted/30 rounded-2xl p-4 min-h-[400px]"
              >
                <div className="flex items-center gap-2 mb-4 px-1">
                  <col.icon size={16} className={col.color} />
                  <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                  <Badge variant="secondary" className="text-[10px] ml-auto h-5 px-1.5">
                    {col.tasks.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {col.tasks.map(todo => (
                      <motion.div
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className={`text-sm font-medium leading-snug ${todo.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {todo.title}
                          </p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-muted-foreground hover:text-foreground p-0.5">
                                <MoreHorizontal size={14} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(todo)}>
                                <Pencil size={12} className="mr-2" /> Edit
                              </DropdownMenuItem>
                              {col.key !== "todo" && (
                                <DropdownMenuItem onClick={() => moveTask(todo, "todo")}>
                                  <ArrowRight size={12} className="mr-2 rotate-180" /> Move to To Do
                                </DropdownMenuItem>
                              )}
                              {col.key !== "in_progress" && (
                                <DropdownMenuItem onClick={() => moveTask(todo, "in_progress")}>
                                  <Clock size={12} className="mr-2" /> Move to In Progress
                                </DropdownMenuItem>
                              )}
                              {col.key !== "done" && (
                                <DropdownMenuItem onClick={() => moveTask(todo, "done")}>
                                  <CheckCircle2 size={12} className="mr-2" /> Mark Done
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => deleteTask(todo.id)} className="text-destructive">
                                <Trash2 size={12} className="mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {todo.description && !todo.description.startsWith("[IN_PROGRESS]") && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {todo.description.replace("[IN_PROGRESS]", "").trim()}
                          </p>
                        )}
                        {todo.description.replace("[IN_PROGRESS]", "").trim() && todo.description.startsWith("[IN_PROGRESS]") && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {todo.description.replace("[IN_PROGRESS]", "").trim()}
                          </p>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-medium text-primary">
                              {(nameMap[todo.assigned_to] || "?").charAt(0)}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{nameMap[todo.assigned_to] || "Unknown"}</span>
                          </div>
                          {todo.due_date && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                              <CalIcon size={10} />
                              {new Date(todo.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </div>
                          )}
                        </div>
                        <div className="text-[9px] text-muted-foreground/60 mt-1.5">
                          by {nameMap[todo.created_by] || "Unknown"}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {col.tasks.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8 opacity-60">No tasks</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={!!editingTodo} onOpenChange={(o) => { if (!o) { setEditingTodo(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            staff={staff}
            title={formTitle} setTitle={setFormTitle}
            desc={formDesc} setDesc={setFormDesc}
            assignee={formAssignee} setAssignee={setFormAssignee}
            due={formDue} setDue={setFormDue}
            onSubmit={updateTask}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

// Shared form component
const TaskForm = ({
  staff, title, setTitle, desc, setDesc, assignee, setAssignee, due, setDue, onSubmit, submitLabel,
}: {
  staff: Profile[];
  title: string; setTitle: (v: string) => void;
  desc: string; setDesc: (v: string) => void;
  assignee: string; setAssignee: (v: string) => void;
  due: string; setDue: (v: string) => void;
  onSubmit: () => void;
  submitLabel: string;
}) => (
  <div className="space-y-4 mt-2">
    <div>
      <Label className="text-xs">Title</Label>
      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" />
    </div>
    <div>
      <Label className="text-xs">Description</Label>
      <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)" rows={3} />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label className="text-xs">Assign to</Label>
        <Select value={assignee} onValueChange={setAssignee}>
          <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
          <SelectContent>
            {staff.filter(s => s.id).map(s => <SelectItem key={s.id} value={s.id}>{s.full_name || "Unnamed"}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Due Date</Label>
        <Input type="date" value={due} onChange={e => setDue(e.target.value)} />
      </div>
    </div>
    <Button className="w-full" onClick={onSubmit} disabled={!title.trim()}>
      {submitLabel}
    </Button>
  </div>
);

export default TaskBoard;
