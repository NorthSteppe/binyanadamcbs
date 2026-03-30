import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, UserPlus, Search, Phone, Mail, Link2, CheckCircle2, Unlink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type ManualClient = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  notes: string;
  client_type: string;
  created_at: string;
  created_by: string;
  linked_user_id: string | null;
};

type Profile = { id: string; full_name: string };

const ManualClients = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ManualClient | null>(null);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", notes: "", client_type: "client" });

  // Link dialog
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkTarget, setLinkTarget] = useState<ManualClient | null>(null);
  const [linkUserId, setLinkUserId] = useState("");
  const [linkSearch, setLinkSearch] = useState("");

  const { data: manualClients = [], isLoading } = useQuery({
    queryKey: ["manual_clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manual_clients" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as ManualClient[]) || [];
    },
  });

  // Fetch all registered profiles for linking
  const { data: profiles = [] } = useQuery({
    queryKey: ["all_profiles"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_safe_profiles");
      return (data as Profile[]) || [];
    },
  });

  // Build a name map for linked users
  const profileMap = new Map(profiles.map((p) => [p.id, p.full_name]));

  const createMutation = useMutation({
    mutationFn: async (payload: Omit<ManualClient, "id" | "created_at" | "created_by" | "linked_user_id">) => {
      const { error } = await supabase.from("manual_clients" as any).insert({
        ...payload,
        created_by: user!.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editingClient ? "Client updated" : "Client added");
      qc.invalidateQueries({ queryKey: ["manual_clients"] });
      closeDialog();
    },
    onError: () => toast.error("Failed to save client"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<ManualClient>) => {
      const { error } = await supabase.from("manual_clients" as any).update(payload as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Client updated");
      qc.invalidateQueries({ queryKey: ["manual_clients"] });
      closeDialog();
    },
    onError: () => toast.error("Failed to update client"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("manual_clients" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Client removed");
      qc.invalidateQueries({ queryKey: ["manual_clients"] });
    },
    onError: () => toast.error("Failed to delete client"),
  });

  const linkMutation = useMutation({
    mutationFn: async ({ manualClientId, targetUserId }: { manualClientId: string; targetUserId: string }) => {
      // Call the server-side function to transfer all data
      const { error } = await supabase.rpc("link_manual_client_to_user" as any, {
        _manual_client_id: manualClientId,
        _target_user_id: targetUserId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Manual client linked to registered account! All sessions have been transferred.");
      qc.invalidateQueries({ queryKey: ["manual_clients"] });
      qc.invalidateQueries({ queryKey: ["team_sessions"] });
      setLinkOpen(false);
      setLinkTarget(null);
      setLinkUserId("");
      setLinkSearch("");
    },
    onError: () => toast.error("Failed to link client"),
  });

  const unlinkMutation = useMutation({
    mutationFn: async (manualClientId: string) => {
      const { error } = await supabase
        .from("manual_clients" as any)
        .update({ linked_user_id: null } as any)
        .eq("id", manualClientId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Client unlinked");
      qc.invalidateQueries({ queryKey: ["manual_clients"] });
    },
    onError: () => toast.error("Failed to unlink client"),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingClient(null);
    setForm({ full_name: "", email: "", phone: "", notes: "", client_type: "client" });
  };

  const openEdit = (client: ManualClient) => {
    setEditingClient(client);
    setForm({
      full_name: client.full_name,
      email: client.email,
      phone: client.phone,
      notes: client.notes,
      client_type: client.client_type,
    });
    setDialogOpen(true);
  };

  const openLink = (client: ManualClient) => {
    setLinkTarget(client);
    setLinkUserId("");
    setLinkSearch("");
    setLinkOpen(true);
  };

  const handleSubmit = () => {
    if (!form.full_name.trim()) { toast.error("Name is required"); return; }
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filtered = manualClients.filter((c) => {
    const matchSearch = c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchType = filterType === "all" || c.client_type === filterType;
    return matchSearch && matchType;
  });

  // Filter profiles for link dialog - exclude already linked ones
  const linkedUserIds = new Set(manualClients.filter(c => c.linked_user_id).map(c => c.linked_user_id));
  const availableProfiles = profiles.filter((p) => {
    if (linkedUserIds.has(p.id)) return false;
    if (!linkSearch) return true;
    return p.full_name.toLowerCase().includes(linkSearch.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-foreground flex items-center gap-2">
                <UserPlus size={24} className="text-primary" />
                Manual Clients & Supervisees
              </h1>
              <p className="text-sm text-muted-foreground">
                Add clients and supervisees who don't have an account. Link them when they sign up to transfer all data.
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
              <Plus size={14} /> Add Person
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="supervisee">Supervisees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[120px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      {isLoading ? "Loading..." : "No manual clients yet. Click 'Add Person' to get started."}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={c.client_type === "supervisee" ? "bg-accent/20 text-accent-foreground" : "bg-muted"}>
                        {c.client_type === "supervisee" ? "Supervisee" : "Client"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-xs text-muted-foreground">
                        {c.email && <div className="flex items-center gap-1"><Mail size={10} />{c.email}</div>}
                        {c.phone && <div className="flex items-center gap-1"><Phone size={10} />{c.phone}</div>}
                        {!c.email && !c.phone && <span>—</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.linked_user_id ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/30 gap-1 text-[10px]">
                          <CheckCircle2 size={9} /> Linked to {profileMap.get(c.linked_user_id) || "User"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Not linked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(c.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!c.linked_user_id ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => openLink(c)} title="Link to registered account">
                            <Link2 size={12} />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => unlinkMutation.mutate(c.id)} title="Unlink account">
                            <Unlink size={12} />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
                          <Edit size={12} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(c.id)}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
      <Footer />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Edit" : "Add"} Client / Supervisee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Enter full name" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.client_type} onValueChange={(v) => setForm({ ...form, client_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="supervisee">Supervisee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" type="email" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+44..." />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any relevant notes..." rows={3} />
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingClient ? "Update" : "Add"} Person
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link to Registered Account Dialog */}
      <Dialog open={linkOpen} onOpenChange={(o) => { if (!o) { setLinkOpen(false); setLinkTarget(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 size={18} className="text-primary" />
              Link to Registered Account
            </DialogTitle>
          </DialogHeader>
          {linkTarget && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium">{linkTarget.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {linkTarget.email || linkTarget.phone || "No contact info"}
                  {" · "}
                  {linkTarget.client_type === "supervisee" ? "Supervisee" : "Client"}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  All sessions and history will be transferred to the selected account.
                </p>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Search registered users</Label>
                <Input
                  placeholder="Type a name to search..."
                  value={linkSearch}
                  onChange={(e) => setLinkSearch(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="max-h-[200px] overflow-y-auto border border-border/50 rounded-lg divide-y divide-border/30">
                {availableProfiles.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    {linkSearch ? "No matching users found" : "No registered users available"}
                  </p>
                ) : (
                  availableProfiles.slice(0, 20).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setLinkUserId(p.id)}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                        linkUserId === p.id ? "bg-primary/5 border-l-2 border-primary" : ""
                      }`}
                    >
                      <span className={linkUserId === p.id ? "font-medium" : ""}>{p.full_name || "Unnamed user"}</span>
                      {linkUserId === p.id && <CheckCircle2 size={14} className="text-primary" />}
                    </button>
                  ))
                )}
              </div>

              <Button
                onClick={() => {
                  if (!linkUserId) { toast.error("Select a registered user first"); return; }
                  linkMutation.mutate({ manualClientId: linkTarget.id, targetUserId: linkUserId });
                }}
                className="w-full gap-2"
                disabled={!linkUserId || linkMutation.isPending}
              >
                <Link2 size={14} />
                {linkMutation.isPending ? "Transferring data..." : "Link & Transfer All Data"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManualClients;
