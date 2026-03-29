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
import { Plus, Trash2, Edit, UserPlus, Search, Phone, Mail } from "lucide-react";
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
};

const ManualClients = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ManualClient | null>(null);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", notes: "", client_type: "client" });

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

  const createMutation = useMutation({
    mutationFn: async (payload: Omit<ManualClient, "id" | "created_at" | "created_by">) => {
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
                Add clients and supervisees who don't have an account on the platform
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
                  <TableHead>Notes</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[80px]" />
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
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{c.notes || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(c.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
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
    </div>
  );
};

export default ManualClients;
