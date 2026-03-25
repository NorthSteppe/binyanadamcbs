import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Plus, ExternalLink, Circle, CheckCircle2, Clock, AlertTriangle, Users, Briefcase, GraduationCap, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  priority: number;
  state: { name: string; color: string; type: string };
  assignee?: { id: string; name: string; avatarUrl?: string };
  labels: { nodes: { id: string; name: string; color: string }[] };
  dueDate?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

interface LinearTeam {
  id: string;
  name: string;
  key: string;
}

interface LinearUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

const PRIORITY_LABELS: Record<number, { label: string; color: string; icon: React.ElementType }> = {
  0: { label: "None", color: "text-muted-foreground", icon: Circle },
  1: { label: "Urgent", color: "text-destructive", icon: AlertTriangle },
  2: { label: "High", color: "text-orange-500", icon: AlertTriangle },
  3: { label: "Medium", color: "text-yellow-500", icon: Clock },
  4: { label: "Low", color: "text-muted-foreground", icon: Circle },
};

// Clinic-specific label categories
const CLINIC_CATEGORIES = [
  { label: "Client Cases", icon: Users, filter: (i: LinearIssue) => i.labels.nodes.some(l => l.name.toLowerCase().includes("client") || l.name.toLowerCase().includes("case")) },
  { label: "Operations", icon: Briefcase, filter: (i: LinearIssue) => i.labels.nodes.some(l => l.name.toLowerCase().includes("ops") || l.name.toLowerCase().includes("admin") || l.name.toLowerCase().includes("billing")) },
  { label: "Supervision", icon: GraduationCap, filter: (i: LinearIssue) => i.labels.nodes.some(l => l.name.toLowerCase().includes("supervision") || l.name.toLowerCase().includes("supervisee")) },
  { label: "All Tasks", icon: ClipboardList, filter: () => true },
];

const LinearTasksPanel = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [issues, setIssues] = useState<LinearIssue[]>([]);
  const [teams, setTeams] = useState<LinearTeam[]>([]);
  const [members, setMembers] = useState<LinearUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState("All Tasks");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("3");
  const [newAssignee, setNewAssignee] = useState("");
  const [creating, setCreating] = useState(false);

  const linearQuery = useCallback(async (query: string, variables?: Record<string, any>) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/linear-proxy`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ action: "graphql", query, variables }),
      }
    );
    const result = await res.json();
    if (result.error) throw new Error(result.error);
    return result.data;
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const data = await linearQuery(`query { teams { nodes { id name key } } }`);
      const t = data?.teams?.nodes || [];
      setTeams(t);
      if (t.length > 0 && !selectedTeam) setSelectedTeam(t[0].id);
    } catch (e: any) {
      console.error("Failed to fetch teams:", e);
    }
  }, [linearQuery, selectedTeam]);

  const fetchIssues = useCallback(async () => {
    if (!selectedTeam) return;
    setLoading(true);
    try {
      const data = await linearQuery(
        `query($teamId: ID!) {
          issues(filter: { team: { id: { eq: $teamId } }, state: { type: { nin: ["canceled"] } } }, first: 100, orderBy: updatedAt) {
            nodes {
              id identifier title description priority url createdAt updatedAt dueDate
              state { name color type }
              assignee { id name avatarUrl }
              labels { nodes { id name color } }
            }
          }
        }`,
        { teamId: selectedTeam }
      );
      setIssues(data?.issues?.nodes || []);

      // Also fetch team members
      const membersData = await linearQuery(
        `query($teamId: ID!) { team(id: $teamId) { members { nodes { id name avatarUrl } } } }`,
        { teamId: selectedTeam }
      );
      setMembers(membersData?.team?.members?.nodes || []);
    } catch (e: any) {
      toast({ title: "Failed to load tasks", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [selectedTeam, linearQuery, toast]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);
  useEffect(() => { if (selectedTeam) fetchIssues(); }, [selectedTeam, fetchIssues]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !selectedTeam) return;
    setCreating(true);
    try {
      await linearQuery(
        `mutation($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { id } } }`,
        {
          input: {
            teamId: selectedTeam,
            title: newTitle,
            description: newDesc || undefined,
            priority: parseInt(newPriority),
            assigneeId: newAssignee || undefined,
          },
        }
      );
      toast({ title: "Task created in Linear" });
      setCreateOpen(false);
      setNewTitle("");
      setNewDesc("");
      fetchIssues();
    } catch (e: any) {
      toast({ title: "Failed to create task", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const filteredIssues = issues.filter(
    CLINIC_CATEGORIES.find(c => c.label === activeCategory)?.filter || (() => true)
  );

  const grouped = {
    active: filteredIssues.filter(i => ["started", "unstarted"].includes(i.state.type)),
    completed: filteredIssues.filter(i => i.state.type === "completed"),
    backlog: filteredIssues.filter(i => i.state.type === "backlog" || i.state.type === "triage"),
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {teams.length > 1 && (
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-40 h-9 rounded-xl text-sm">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="ghost" size="icon" onClick={fetchIssues} className="h-9 w-9 rounded-xl">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl gap-2">
              <Plus size={14} /> New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task in Linear</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="Task title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              <Textarea placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Urgent</SelectItem>
                    <SelectItem value="2">High</SelectItem>
                    <SelectItem value="3">Medium</SelectItem>
                    <SelectItem value="4">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newAssignee} onValueChange={setNewAssignee}>
                  <SelectTrigger><SelectValue placeholder="Assignee" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={creating || !newTitle.trim()}>
                {creating ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CLINIC_CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(cat.label)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat.label
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <cat.icon size={12} />
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="active" className="space-y-3">
          <TabsList className="bg-muted/50 rounded-xl">
            <TabsTrigger value="active" className="rounded-lg text-xs">
              Active ({grouped.active.length})
            </TabsTrigger>
            <TabsTrigger value="backlog" className="rounded-lg text-xs">
              Backlog ({grouped.backlog.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg text-xs">
              Done ({grouped.completed.length})
            </TabsTrigger>
          </TabsList>

          {(["active", "backlog", "completed"] as const).map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-2">
              {grouped[tab].length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No tasks here</p>
              ) : (
                grouped[tab].map((issue, i) => {
                  const prio = PRIORITY_LABELS[issue.priority] || PRIORITY_LABELS[0];
                  const PrioIcon = prio.icon;
                  return (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="bg-card border border-border/50 rounded-xl p-4 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {issue.state.type === "completed" ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : (
                            <div
                              className="w-4 h-4 rounded-full border-2"
                              style={{ borderColor: issue.state.color }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] text-muted-foreground font-mono">{issue.identifier}</span>
                            <PrioIcon size={12} className={prio.color} />
                          </div>
                          <p className="text-sm font-medium text-foreground leading-snug">{issue.title}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 rounded-md" style={{ borderColor: issue.state.color, color: issue.state.color }}>
                              {issue.state.name}
                            </Badge>
                            {issue.labels.nodes.map(l => (
                              <Badge key={l.id} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 rounded-md">
                                {l.name}
                              </Badge>
                            ))}
                            {issue.dueDate && (
                              <span className="text-[10px] text-muted-foreground">
                                Due {new Date(issue.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {issue.assignee && (
                            <div className="flex items-center gap-1.5">
                              {issue.assignee.avatarUrl ? (
                                <img src={issue.assignee.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-medium">
                                  {issue.assignee.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          )}
                          <a href={issue.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default LinearTasksPanel;
