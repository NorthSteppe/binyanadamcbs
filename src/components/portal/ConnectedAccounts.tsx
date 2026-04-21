import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Video, CheckCircle2, Plug, Loader2, XCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface Integration {
  id: string;
  provider: "google" | "microsoft" | "zoom";
  account_email: string;
  account_name: string;
}

const PROVIDERS = [
  { id: "google", label: "Google Meet", description: "Auto-create Meet links via Google Calendar." },
  { id: "microsoft", label: "Microsoft Teams", description: "Auto-create Teams meetings on your Microsoft account." },
  { id: "zoom", label: "Zoom", description: "Auto-create Zoom meetings on your Zoom account." },
] as const;

const ConnectedAccounts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("staff_integrations")
      .select("id, provider, account_email, account_name")
      .eq("user_id", user.id);
    setIntegrations((data as Integration[]) || []);
  };

  useEffect(() => { load(); }, [user]);

  // Handle OAuth return
  useEffect(() => {
    const status = searchParams.get("oauth");
    const provider = searchParams.get("provider");
    if (!status) return;
    if (status === "ok") {
      toast({ title: `${provider} connected`, description: "Your account is now linked." });
      load();
    } else {
      toast({
        title: `Failed to connect ${provider}`,
        description: searchParams.get("reason") || "Please try again.",
        variant: "destructive",
      });
    }
    const next = new URLSearchParams(searchParams);
    next.delete("oauth"); next.delete("provider"); next.delete("reason");
    setSearchParams(next, { replace: true });
  }, [searchParams]);

  const connect = async (provider: string) => {
    setLoading(provider);
    try {
      const { data, error } = await supabase.functions.invoke("oauth-start", { body: { provider } });
      if (error || !data?.url) throw new Error(error?.message || data?.error || "Failed to start OAuth");
      window.location.href = data.url;
    } catch (e: any) {
      toast({ title: "Connection failed", description: e.message, variant: "destructive" });
      setLoading(null);
    }
  };

  const disconnect = async (id: string, provider: string) => {
    const { error } = await supabase.from("staff_integrations").delete().eq("id", id);
    if (error) toast({ title: "Failed to disconnect", description: error.message, variant: "destructive" });
    else { toast({ title: `${provider} disconnected` }); load(); }
  };

  const getIntegration = (provider: string) =>
    integrations.find((i) => i.provider === provider);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Video size={18} />
          Meeting Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Connect your video accounts so booked sessions automatically generate real meeting links in your account.
        </p>
        {PROVIDERS.map((p) => {
          const integration = getIntegration(p.id);
          const isLoading = loading === p.id;
          return (
            <div key={p.id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-border/50 bg-card">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground">{p.label}</p>
                  {integration && <CheckCircle2 size={14} className="text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                {integration?.account_email && (
                  <p className="text-xs text-primary mt-1 truncate">{integration.account_email}</p>
                )}
              </div>
              {integration ? (
                <Button size="sm" variant="ghost" onClick={() => disconnect(integration.id, p.label)} className="rounded-full">
                  <XCircle size={14} className="me-1" /> Disconnect
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => connect(p.id)} disabled={isLoading} className="rounded-full">
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <><Plug size={14} className="me-1" /> Connect</>}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ConnectedAccounts;
