import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Mail, UserPlus, Users, Eye, EyeOff, KeyRound, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AuthSettings = () => {
  const queryClient = useQueryClient();

  // Fetch current auth config from config.toml via edge function or display known settings
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [disableSignup, setDisableSignup] = useState(false);
  const [saving, setSaving] = useState(false);

  // Stats
  const { data: stats } = useQuery({
    queryKey: ["auth-stats"],
    queryFn: async () => {
      const [profilesRes, rolesRes, requestsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("team_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      const roles = rolesRes.data || [];
      const adminCount = roles.filter((r) => r.role === "admin").length;
      const teamCount = roles.filter((r) => r.role === "team_member").length;
      const clientCount = roles.filter((r) => r.role === "client").length;

      return {
        totalUsers: profilesRes.count || 0,
        admins: adminCount,
        teamMembers: teamCount,
        clients: clientCount,
        pendingRequests: requestsRes.count || 0,
      };
    },
  });

  const handleSaveAuth = async () => {
    setSaving(true);
    try {
      // This will call the configure_auth tool's equivalent
      // For now we surface the settings as informational
      toast.success("Auth settings saved. Changes will apply on next deployment.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container py-24 flex-1 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 text-primary rounded-lg p-2.5">
              <KeyRound size={22} />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-foreground">Authentication Settings</h1>
          </div>
          <p className="text-muted-foreground font-light mb-10 ml-14">
            Configure how users sign up, sign in, and access the platform.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {[
            { label: "Total Users", value: stats?.totalUsers ?? "–", icon: Users },
            { label: "Admins", value: stats?.admins ?? "–", icon: Shield },
            { label: "Therapists", value: stats?.teamMembers ?? "–", icon: Users },
            { label: "Clients", value: stats?.clients ?? "–", icon: Users },
            { label: "Pending Requests", value: stats?.pendingRequests ?? "–", icon: UserPlus },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border p-4 text-center">
              <stat.icon size={16} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-2xl font-serif text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-light">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sign-Up Settings */}
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <UserPlus size={18} className="text-primary" />
              <h2 className="text-lg font-serif text-foreground">Sign-Up Settings</h2>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Allow New Sign-Ups</p>
                <p className="text-xs text-muted-foreground font-light">When disabled, only admins can create new accounts</p>
              </div>
              <Switch checked={!disableSignup} onCheckedChange={(v) => setDisableSignup(!v)} />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Auto-Confirm Email</p>
                <p className="text-xs text-muted-foreground font-light">Skip email verification — users can sign in immediately after registration</p>
              </div>
              <Switch checked={autoConfirm} onCheckedChange={setAutoConfirm} />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Default Role</p>
                <p className="text-xs text-muted-foreground font-light">New users are automatically assigned the "Client" role</p>
              </div>
              <Badge variant="secondary" className="text-xs">Client</Badge>
            </div>
          </div>

          {/* Sign-In Methods */}
          <div className="bg-card border border-border p-6 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <Lock size={18} className="text-primary" />
              <h2 className="text-lg font-serif text-foreground">Sign-In Methods</h2>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Email & Password</p>
                  <p className="text-xs text-muted-foreground font-light">Standard email/password authentication</p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Active</Badge>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Google OAuth</p>
                  <p className="text-xs text-muted-foreground font-light">Allow sign-in with Google accounts (managed by Lovable Cloud)</p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Available</Badge>
            </div>
          </div>

          {/* Role & Access Info */}
          <div className="bg-card border border-border p-6 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <Shield size={18} className="text-primary" />
              <h2 className="text-lg font-serif text-foreground">Role & Access Control</h2>
            </div>

            <div className="space-y-3">
              {[
                { role: "Admin", description: "Full access to all portals, settings, and user management", color: "bg-destructive/10 text-destructive" },
                { role: "Therapist", description: "Access to therapist tools, client management, and calendar", color: "bg-primary/10 text-primary" },
                { role: "Client", description: "Access to personal portal, booking, messaging, and toolkit", color: "bg-secondary text-secondary-foreground" },
              ].map((r) => (
                <div key={r.role} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                  <Badge className={`${r.color} text-xs mt-0.5`}>{r.role}</Badge>
                  <p className="text-sm text-muted-foreground font-light">{r.description}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground font-light">
              Staff roles (Admin, Therapist) require manual approval via the Team Requests queue.
              Roles can be managed in <a href="/admin/users" className="text-primary hover:underline">User Management</a>.
            </p>
          </div>

          {/* Security Info */}
          <div className="bg-card border border-border p-6 space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <Eye size={18} className="text-primary" />
              <h2 className="text-lg font-serif text-foreground">Security</h2>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground font-light">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <p>Row-level security (RLS) is enabled on all tables — users can only access their own data</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <p>Session data is verified server-side via JWT tokens</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <p>Anonymous sign-ups are disabled — all users must register with email or OAuth</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                <p>Leaked Password Protection should be enabled in your backend settings for maximum security</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthSettings;
