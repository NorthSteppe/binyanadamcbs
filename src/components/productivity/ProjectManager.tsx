import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FolderPlus, Trash2, FolderOpen, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4"];

interface ProjectManagerProps {
  selectedProjectId?: string | null;
  onSelectProject?: (id: string | null) => void;
}

const ProjectManager = ({ selectedProjectId, onSelectProject }: ProjectManagerProps) => {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const { data: projects = [] } = useQuery({
    queryKey: ["user_projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_projects").select("*").eq("is_archived", false).order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const { data: taskCounts = {} } = useQuery({
    queryKey: ["project_task_counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_tasks").select("project_id, is_completed, status");
      if (error) throw error;
      const counts: Record<string, { total: number; done: number; todo: number; in_progress: number }> = {};
      data.forEach((t: any) => {
        if (!t.project_id) return;
        if (!counts[t.project_id]) counts[t.project_id] = { total: 0, done: 0, todo: 0, in_progress: 0 };
        counts[t.project_id].total++;
        if (t.is_completed) counts[t.project_id].done++;
        if (t.status === "todo") counts[t.project_id].todo++;
        if (t.status === "in_progress") counts[t.project_id].in_progress++;
      });
      return counts;
    },
    enabled: !!session,
  });

  const createProject = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("user_projects").insert({ user_id: session!.user.id, name, color });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_projects"] });
      setDialogOpen(false);
      setName("");
      toast.success("Project created");
    },
    onError: () => toast.error("Failed to create project"),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["user_projects"] });
      if (selectedProjectId === id) onSelectProject?.(null);
      toast.success("Project deleted");
    },
  });

  const handleSelect = (id: string) => {
    if (selectedProjectId === id) {
      onSelectProject?.(null);
    } else {
      onSelectProject?.(id);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <FolderOpen size={14} /> Projects
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7"><FolderPlus size={14} className="mr-1" /> New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" /></div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-1">
                  {COLORS.map((c) => (
                    <button key={c} className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? "border-foreground scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }} onClick={() => setColor(c)} />
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={() => createProject.mutate()} disabled={!name.trim()}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* All tasks filter */}
      <button
        onClick={() => onSelectProject?.(null)}
        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors text-sm ${
          !selectedProjectId ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground"
        }`}
      >
        <div className="w-3 h-3 rounded-full bg-muted-foreground/30 shrink-0" />
        <span>All Tasks</span>
        <span className="ml-auto text-xs text-muted-foreground">{String(Object.values(taskCounts as any).reduce((sum: number, c: any) => sum + c.total, 0) || 0)}</span>
      </button>

      <AnimatePresence>
        {projects.map((p: any) => {
          const counts = (taskCounts as any)[p.id] || { total: 0, done: 0, todo: 0, in_progress: 0 };
          const pct = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;
          const isSelected = selectedProjectId === p.id;
          return (
            <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                onClick={() => handleSelect(p.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg group transition-colors ${
                  isSelected ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/50"
                }`}
              >
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <div className="flex-1 min-w-0 text-left">
                  <p className={`text-sm font-medium truncate ${isSelected ? "text-primary" : "text-foreground"}`}>{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{counts.done}/{counts.total}</span>
                  </div>
                  {counts.total > 0 && (
                    <div className="flex gap-2 mt-0.5 text-[9px] text-muted-foreground">
                      {counts.todo > 0 && <span>{counts.todo} to do</span>}
                      {counts.in_progress > 0 && <span>{counts.in_progress} active</span>}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={(e) => { e.stopPropagation(); deleteProject.mutate(p.id); }}>
                  <Trash2 size={12} className="text-destructive" />
                </Button>
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {projects.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No projects yet</p>}
    </div>
  );
};

export default ProjectManager;
