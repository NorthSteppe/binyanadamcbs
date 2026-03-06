import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, ShieldCheck, UserCog, Plus, Trash2 } from "lucide-react";

type UserRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  roles: string[];
};

const ROLE_OPTIONS = ["admin", "team_member", "client"] as const;
const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  team_member: "Team Member",
  client: "Client",
};
const ROLE_COLORS: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  team_member: "bg-primary/10 text-primary border-primary/20",
  client: "bg-muted text-muted-foreground border-border",
};

const UserManagement = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url, created_at").order("created_at", { ascending: false });
      if (!profiles) return [];
      const { data: allRoles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap: Record<string, string[]> = {};
      allRoles?.forEach((r) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });
      return profiles.map((p) => ({ ...p, roles: roleMap[p.id] || [] })) as UserRow[];
    },
  });

  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Role added"); },
    onError: (e: any) => toast.error(e.message),
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Role removed"); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container py-24 flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 text-primary rounded-xl p-2.5"><UserCog size={22} /></div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">User Management</h1>
        </div>
        <p className="text-muted-foreground mb-8 ml-14">View all users, manage their roles, and control access.</p>

        <div className="relative mb-6 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading users…</p>
        ) : (
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {user.full_name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="font-medium text-foreground">{user.full_name || "Unnamed"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="outline" className={`text-xs ${ROLE_COLORS[role] || ""}`}>
                            {ROLE_LABELS[role] || role}
                            <button
                              onClick={() => {
                                if (confirm(`Remove "${ROLE_LABELS[role]}" role from ${user.full_name}?`))
                                  removeRole.mutate({ userId: user.id, role });
                              }}
                              className="ml-1 hover:text-destructive"
                            >
                              <Trash2 size={10} />
                            </button>
                          </Badge>
                        ))}
                        {user.roles.length === 0 && <span className="text-xs text-muted-foreground">No roles</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 rounded-lg">
                            <Plus size={12} /> Add Role
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add role to {user.full_name}</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-3 pt-2">
                            {ROLE_OPTIONS.filter((r) => !user.roles.includes(r)).map((role) => (
                              <Button
                                key={role}
                                variant="outline"
                                className="justify-start gap-2"
                                onClick={() => addRole.mutate({ userId: user.id, role })}
                              >
                                <ShieldCheck size={14} />
                                {ROLE_LABELS[role]}
                              </Button>
                            ))}
                            {ROLE_OPTIONS.filter((r) => !user.roles.includes(r)).length === 0 && (
                              <p className="text-sm text-muted-foreground">User already has all roles.</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No users found.</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UserManagement;
