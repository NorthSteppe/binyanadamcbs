import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, GripVertical, Calendar, Clock, Flag, CheckCircle2, Circle, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  labels: string[];
  due_date: string | null;
  estimated_minutes: number;
  is_completed: boolean;
  project_id: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  sort_order: number;
};

type Project = {
  id: string;
  name: string;
  color: string;
};

const COLUMNS = [
  { key: "todo", label: "To Do", icon: Circle, color: "text-muted-foreground" },
  { key: "in_progress", label: "In Progress", icon: ArrowRight, color: "text-blue-500" },
  { key: "done", label: "Done", icon: CheckCircle2, color: "text-green-500" },
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  { value: "medium", label: "Medium", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400" },
  { value: "high", label: "High", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400" },
  { value: "urgent", label: "Urgent", color: "bg-red-200 text-red-800 dark:bg-red-950 dark:text-red-300" },
];

const TaskBoard = () => {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", status: "todo", estimated_minutes: 30, due_date: "", project_id: "" });

  const { data: tasks = [] } = useQuery({
    queryKey: ["user_tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_tasks")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!session,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["user_projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_projects").select("*").eq("is_archived", false).order("name");
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!session,
  });

  const createTask = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("user_tasks").insert({
        user_id: session!.user.id,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: newTask.status,
        estimated_minutes: newTask.estimated_minutes,
        due_date: newTask.due_date || null,
        project_id: newTask.project_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_tasks"] });
      setDialogOpen(false);
      setNewTask({ title: "", description: "", priority: "medium", status: "todo", estimated_minutes: 30, due_date: "", project_id: "" });
      toast.success("Task created");
    },
    onError: () => toast.error("Failed to create task"),
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === "done") { updates.is_completed = true; updates.completed_at = new Date().toISOString(); }
      else { updates.is_completed = false; updates.completed_at = null; }
      const { error } = await supabase.from("user_tasks").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_tasks"] }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["user_tasks"] }); toast.success("Task deleted"); },
  });

  const getProject = (id: string | null) => projects.find((p) => p.id === id);
  const getPriorityStyle = (p: string) => PRIORITIES.find((pr) => pr.value === p)?.color || "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Task Board</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus size={16} className="mr-1" /> Add Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Optional details" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Priority</Label>
                  <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Est. Minutes</Label>
                  <Input type="number" value={newTask.estimated_minutes} onChange={(e) => setNewTask({ ...newTask, estimated_minutes: parseInt(e.target.value) || 30 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Due Date</Label>
                  <Input type="datetime-local" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} />
                </div>
                <div>
                  <Label>Project</Label>
                  <Select value={newTask.project_id} onValueChange={(v) => setNewTask({ ...newTask, project_id: v })}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => createTask.mutate()} disabled={!newTask.title.trim()} className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="bg-muted/30 rounded-xl p-3 min-h-[200px]">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Icon size={16} className={col.color} />
                <span className="text-sm font-medium text-foreground">{col.label}</span>
                <Badge variant="secondary" className="ml-auto text-xs">{colTasks.length}</Badge>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {colTasks.map((task) => {
                    const project = getProject(task.project_id);
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow group"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical size={14} className="text-muted-foreground/40 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {task.title}
                            </p>
                            {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <Badge className={`text-[10px] px-1.5 py-0 ${getPriorityStyle(task.priority)}`}>
                                <Flag size={8} className="mr-0.5" />{task.priority}
                              </Badge>
                              {task.due_date && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  <Calendar size={8} className="mr-0.5" />{format(new Date(task.due_date), "MMM d")}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                <Clock size={8} className="mr-0.5" />{task.estimated_minutes}m
                              </Badge>
                              {project && (
                                <Badge className="text-[10px] px-1.5 py-0" style={{ backgroundColor: project.color + "20", color: project.color }}>
                                  {project.name}
                                </Badge>
                              )}
                              {task.scheduled_start && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                                  <Sparkles size={8} className="mr-0.5" />Scheduled
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {COLUMNS.filter((c) => c.key !== col.key).map((c) => (
                            <Button key={c.key} variant="ghost" size="sm" className="h-6 text-[10px] px-2"
                              onClick={() => updateTaskStatus.mutate({ id: task.id, status: c.key })}>
                              → {c.label}
                            </Button>
                          ))}
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-destructive ml-auto"
                            onClick={() => deleteTask.mutate(task.id)}>
                            Delete
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoard;
