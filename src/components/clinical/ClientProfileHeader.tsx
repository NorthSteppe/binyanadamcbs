import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera, Save, Sparkles, User } from "lucide-react";
import { format } from "date-fns";

interface Extras {
  client_id: string;
  photo_url: string;
  child_name: string;
  date_of_birth: string | null;
  diagnosis: string;
  parent_name: string;
  phone: string;
  email: string;
  notes: string;
}

interface Props {
  clientId: string;
  audience: "client" | "staff" | "admin";
  fallbackName?: string;
}

const empty = (clientId: string): Extras => ({
  client_id: clientId, photo_url: "", child_name: "", date_of_birth: null,
  diagnosis: "", parent_name: "", phone: "", email: "", notes: "",
});

const ClientProfileHeader = ({ clientId, audience, fallbackName }: Props) => {
  const { user, isAdmin } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [extras, setExtras] = useState<Extras>(empty(clientId));
  const [photoSignedUrl, setPhotoSignedUrl] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const canEdit = audience !== "client";
  const canUploadPhoto = isAdmin || audience === "staff";

  // photo_url is now a storage path inside the private "client-photos" bucket.
  // Backwards compatible: if a legacy full URL is stored, use it directly.
  const resolvePhotoUrl = async (value: string) => {
    if (!value) { setPhotoSignedUrl(""); return; }
    if (/^https?:\/\//i.test(value)) { setPhotoSignedUrl(value); return; }
    const { data, error } = await supabase.storage
      .from("client-photos")
      .createSignedUrl(value, 60 * 60); // 1 hour
    setPhotoSignedUrl(error ? "" : data?.signedUrl ?? "");
  };

  const load = async () => {
    const { data } = await supabase
      .from("client_profile_extras")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle();
    if (data) {
      const next = { ...empty(clientId), ...(data as any) };
      setExtras(next);
      resolvePhotoUrl(next.photo_url);
    } else {
      setExtras(empty(clientId));
      setPhotoSignedUrl("");
    }
  };

  useEffect(() => { if (clientId) load(); /* eslint-disable-next-line */ }, [clientId]);

  const autofillFromIntake = async () => {
    const { data: intake } = await supabase
      .from("fba_intake_responses")
      .select("responses, fba_intake_assignments!inner(child_name, client_id)")
      .eq("client_id", clientId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!intake) {
      toast.error("No FBA intake found for this client yet");
      return;
    }
    const r = (intake as any).responses ?? {};
    const childName = (intake as any).fba_intake_assignments?.child_name || r.childName || extras.child_name;
    const next: Extras = {
      ...extras,
      child_name: childName ?? "",
      date_of_birth: r.dob || extras.date_of_birth,
      diagnosis: r.diagnosis || extras.diagnosis,
      parent_name: r.parentName || extras.parent_name,
      phone: r.phone || extras.phone,
      email: r.email || extras.email,
    };
    setExtras(next);
    setEditing(true);
    toast.success("Filled from latest FBA intake — review and save");
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      client_id: clientId,
      photo_url: extras.photo_url,
      child_name: extras.child_name,
      date_of_birth: extras.date_of_birth || null,
      diagnosis: extras.diagnosis,
      parent_name: extras.parent_name,
      phone: extras.phone,
      email: extras.email,
      notes: extras.notes,
    };
    const { error } = await supabase
      .from("client_profile_extras")
      .upsert(payload, { onConflict: "client_id" });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Profile saved"); setEditing(false); load(); }
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const path = `${clientId}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from("client-photos").upload(path, file, { upsert: true });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("client-photos").getPublicUrl(path);
    const newUrl = urlData.publicUrl;
    const { error: updErr } = await supabase
      .from("client_profile_extras")
      .upsert({ client_id: clientId, photo_url: newUrl }, { onConflict: "client_id" });
    setUploading(false);
    if (updErr) toast.error(updErr.message);
    else { setExtras((prev) => ({ ...prev, photo_url: newUrl })); toast.success("Photo updated"); }
    if (fileRef.current) fileRef.current.value = "";
  };

  const displayName = extras.child_name || fallbackName || "Client";

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Photo */}
        <div className="shrink-0 self-center sm:self-start">
          <div className="relative">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-muted ring-1 ring-border flex items-center justify-center">
              {extras.photo_url ? (
                <img src={extras.photo_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <User size={36} className="text-muted-foreground" />
              )}
            </div>
            {canUploadPhoto && (
              <>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  title="Replace photo"
                >
                  <Camera size={14} />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-3">
          {!editing ? (
            <>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold">{displayName}</h2>
                  <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    {extras.date_of_birth && <span>DOB: {format(new Date(extras.date_of_birth), "dd MMM yyyy")}</span>}
                    {extras.diagnosis && <span>Diagnosis: {extras.diagnosis}</span>}
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-full gap-2" onClick={autofillFromIntake}>
                      <Sparkles size={14} /> Auto-fill from intake
                    </Button>
                    <Button size="sm" className="rounded-full" onClick={() => setEditing(true)}>Edit</Button>
                  </div>
                )}
              </div>
              {(extras.parent_name || extras.phone || extras.email) && (
                <div className="text-sm text-muted-foreground border-t border-border/50 pt-3 grid sm:grid-cols-3 gap-2">
                  {extras.parent_name && <div><span className="text-foreground font-medium">Parent:</span> {extras.parent_name}</div>}
                  {extras.phone && <div><span className="text-foreground font-medium">Phone:</span> {extras.phone}</div>}
                  {extras.email && <div><span className="text-foreground font-medium">Email:</span> {extras.email}</div>}
                </div>
              )}
              {extras.notes && (
                <p className="text-sm text-muted-foreground border-t border-border/50 pt-3 whitespace-pre-wrap">{extras.notes}</p>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input placeholder="Child / client name" value={extras.child_name} onChange={(e) => setExtras({ ...extras, child_name: e.target.value })} />
                <Input type="date" value={extras.date_of_birth ?? ""} onChange={(e) => setExtras({ ...extras, date_of_birth: e.target.value || null })} />
                <Input placeholder="Diagnosis" value={extras.diagnosis} onChange={(e) => setExtras({ ...extras, diagnosis: e.target.value })} />
                <Input placeholder="Parent name" value={extras.parent_name} onChange={(e) => setExtras({ ...extras, parent_name: e.target.value })} />
                <Input placeholder="Phone" value={extras.phone} onChange={(e) => setExtras({ ...extras, phone: e.target.value })} />
                <Input placeholder="Email" value={extras.email} onChange={(e) => setExtras({ ...extras, email: e.target.value })} />
              </div>
              <Textarea placeholder="Internal notes" rows={2} value={extras.notes} onChange={(e) => setExtras({ ...extras, notes: e.target.value })} />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => { setEditing(false); load(); }}>Cancel</Button>
                <Button className="gap-2" onClick={save} disabled={saving}>
                  <Save size={14} /> {saving ? "Saving…" : "Save profile"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ClientProfileHeader;
