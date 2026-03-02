import { useRef, useState } from "react";
import { useTeamMembers, useUpsertTeamMember, useDeleteTeamMember, TeamMember } from "@/hooks/useTeamMembers";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Upload, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

const TeamMemberRow = ({ member }: { member: TeamMember }) => {
  const upsert = useUpsertTeamMember();
  const remove = useDeleteTeamMember();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: member.name,
    role: member.role,
    bio: member.bio,
    initials: member.initials,
    slug: member.slug || "",
    display_order: member.display_order,
    is_active: member.is_active,
  });

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `team/${member.id}-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("hero-images").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("hero-images").getPublicUrl(path);
      upsert.mutate({ id: member.id, avatar_url: urlData.publicUrl });
      toast.success("Photo updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = () => {
    upsert.mutate({ id: member.id, ...form });
    toast.success("Saved");
  };

  const handleDelete = () => {
    if (!confirm(`Remove ${member.name} from the team?`)) return;
    remove.mutate(member.id);
    toast.success("Removed");
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-4 p-5 rounded-xl border border-border bg-card">
      {/* Avatar */}
      <div className="shrink-0 w-full md:w-32 text-center">
        {member.avatar_url ? (
          <img src={member.avatar_url} alt={member.name} className="w-24 h-24 object-cover rounded-full mx-auto" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-xl font-bold text-primary">
            {member.initials}
          </div>
        )}
        <Button variant="outline" size="sm" className="mt-2 gap-1" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload size={14} /> {uploading ? "…" : "Photo"}
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      {/* Fields */}
      <div className="flex-1 min-w-0 space-y-2 w-full">
        <div className="grid grid-cols-2 gap-2">
          <Input value={form.name} placeholder="Name" onChange={(e) => set("name", e.target.value)} />
          <Input value={form.initials} placeholder="Initials" onChange={(e) => set("initials", e.target.value)} />
        </div>
        <Input value={form.role} placeholder="Role / Title" onChange={(e) => set("role", e.target.value)} />
        <Textarea value={form.bio} placeholder="Bio" rows={3} onChange={(e) => set("bio", e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Input value={form.slug} placeholder="URL slug (optional)" onChange={(e) => set("slug", e.target.value)} />
          <Input type="number" value={form.display_order} placeholder="Order" onChange={(e) => set("display_order", Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} id={`active-${member.id}`} />
            <Label htmlFor={`active-${member.id}`} className="text-sm">Active</Label>
          </div>
          <div className="flex-1" />
          <Button variant="destructive" size="sm" className="gap-1" onClick={handleDelete}>
            <Trash2 size={14} /> Remove
          </Button>
          <Button size="sm" className="gap-1" onClick={save}>
            <Save size={14} /> Save
          </Button>
        </div>
      </div>
    </div>
  );
};

const TeamMemberManager = () => {
  const { data: members, isLoading } = useTeamMembers();
  const upsert = useUpsertTeamMember();

  const addNew = () => {
    upsert.mutate({
      name: "New Team Member",
      role: "",
      bio: "",
      initials: "??",
      display_order: (members?.length || 0) + 1,
      is_active: false,
    });
    toast.success("New member added — edit details below");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container py-24 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl text-foreground mb-1">Team Members</h1>
            <p className="text-muted-foreground">Add, edit, or remove staff shown on the About page.</p>
          </div>
          <Button onClick={addNew} className="gap-1">
            <Plus size={16} /> Add Member
          </Button>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading…</p>}

        <div className="grid gap-4">
          {members?.map((m) => (
            <TeamMemberRow key={m.id} member={m} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TeamMemberManager;
