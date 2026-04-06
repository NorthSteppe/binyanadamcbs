import { useRef, useState, useEffect } from "react";
import { useTeamMembers, useUpsertTeamMember, useDeleteTeamMember, TeamMember } from "@/hooks/useTeamMembers";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Save, Plus, Trash2, Linkedin, Globe, Twitter, Award, PenLine, UserCircle, Image } from "lucide-react";
import { toast } from "sonner";

const TeamMemberRow = ({ member }: { member: TeamMember }) => {
  const upsert = useUpsertTeamMember();
  const remove = useDeleteTeamMember();
  const avatarRef = useRef<HTMLInputElement>(null);
  const sigRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"avatar" | "signature" | null>(null);
  const [form, setForm] = useState({
    name: member.name,
    role: member.role,
    bio: member.bio,
    initials: member.initials,
    slug: member.slug || "",
    display_order: member.display_order,
    is_active: member.is_active,
    credentials: member.credentials,
    social_linkedin: member.social_linkedin,
    social_twitter: member.social_twitter,
    social_website: member.social_website,
  });

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "signature") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(type);
    try {
      const ext = file.name.split(".").pop();
      const path = `team/${member.id}-${type}-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("hero-images").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("hero-images").getPublicUrl(path);
      const field = type === "avatar" ? "avatar_url" : "signature_url";
      upsert.mutate({ id: member.id, [field]: urlData.publicUrl });
      toast.success(`${type === "avatar" ? "Photo" : "Signature"} updated`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(null);
      if (avatarRef.current) avatarRef.current.value = "";
      if (sigRef.current) sigRef.current.value = "";
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
    <div className="p-6 border border-border bg-card space-y-5">
      {/* Top row: avatar + basic fields */}
      <div className="flex flex-col md:flex-row items-start gap-5">
        <div className="shrink-0 w-full md:w-32 text-center space-y-2">
          {member.avatar_url ? (
            <img src={member.avatar_url} alt={member.name} className="w-24 h-24 object-cover rounded-full mx-auto" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-xl font-serif text-primary">
              {member.initials}
            </div>
          )}
          <Button variant="outline" size="sm" className="gap-1 w-full" onClick={() => avatarRef.current?.click()} disabled={uploading === "avatar"}>
            <Upload size={14} /> {uploading === "avatar" ? "…" : "Photo"}
          </Button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "avatar")} />
        </div>

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
        </div>
      </div>

      {/* Credentials */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2"><Award size={14} className="text-primary" /> Credentials & Qualifications</Label>
        <Textarea
          value={form.credentials}
          placeholder="e.g. MSc Applied Behaviour Analysis, UKBA (Cert) Registered, BCBA — one per line"
          rows={3}
          onChange={(e) => set("credentials", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Enter each credential on a new line. These will be displayed on the therapist's profile.</p>
      </div>

      {/* Signature */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2"><PenLine size={14} className="text-primary" /> Signature</Label>
        <div className="flex items-center gap-4">
          {member.signature_url ? (
            <img src={member.signature_url} alt="Signature" className="h-12 object-contain bg-foreground/5 px-4 py-2 rounded" />
          ) : (
            <div className="h-12 px-4 py-2 bg-muted rounded flex items-center text-xs text-muted-foreground">No signature uploaded</div>
          )}
          <Button variant="outline" size="sm" className="gap-1" onClick={() => sigRef.current?.click()} disabled={uploading === "signature"}>
            <Upload size={14} /> {uploading === "signature" ? "Uploading…" : "Upload Signature"}
          </Button>
          <input ref={sigRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "signature")} />
        </div>
        <p className="text-xs text-muted-foreground">Upload a transparent PNG of the therapist's signature.</p>
      </div>

      {/* Social Media */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Social Media & Links</Label>
        <div className="grid sm:grid-cols-3 gap-2">
          <div className="relative">
            <Linkedin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={form.social_linkedin} placeholder="LinkedIn URL" className="pl-9" onChange={(e) => set("social_linkedin", e.target.value)} />
          </div>
          <div className="relative">
            <Twitter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={form.social_twitter} placeholder="X / Twitter URL" className="pl-9" onChange={(e) => set("social_twitter", e.target.value)} />
          </div>
          <div className="relative">
            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={form.social_website} placeholder="Personal website URL" className="pl-9" onChange={(e) => set("social_website", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
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
  );
};

const TeamMemberManager = () => {
  const { data: members, isLoading } = useTeamMembers();
  const upsert = useUpsertTeamMember();

  const addNew = () => {
    upsert.mutate({
      name: "New Therapist",
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
      <div className="container py-24 flex-1 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-foreground mb-1">Therapist Profiles</h1>
            <p className="text-muted-foreground font-light">Manage therapist bios, credentials, signatures, and social links.</p>
          </div>
          <Button onClick={addNew} className="gap-1">
            <Plus size={16} /> Add Therapist
          </Button>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading…</p>}

        <div className="grid gap-6">
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
