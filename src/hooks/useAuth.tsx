import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: { full_name: string; avatar_url: string | null } | null;
  roles: string[];
  isAdmin: boolean;
  isTeamMember: boolean;
  isSupervisee: boolean;
  isStaff: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  roles: [],
  isAdmin: false,
  isTeamMember: false,
  isSupervisee: false,
  isStaff: false,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string | null } | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("full_name, avatar_url").eq("id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    return {
      profile: profileRes.data ?? null,
      roles: rolesRes.data?.map((r) => r.role) ?? [],
    };
  };

  useEffect(() => {
    let mounted = true;

    const applySession = async (nextSession: Session | null) => {
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setRoles([]);
        return;
      }

      try {
        const userData = await fetchUserData(nextSession.user.id);
        if (!mounted) return;
        setProfile(userData.profile);
        setRoles(userData.roles);
      } catch (error) {
        console.error("Failed to load authenticated user data", error);
        if (!mounted) return;
        setProfile(null);
        setRoles([]);
      }
    };

    const bootstrapAuth = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Failed to restore OAuth session from URL", error);
          }

          if (window.history.replaceState) {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Failed to load initial auth session", error);
        }

        await applySession(session);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession).finally(() => {
        if (mounted) setLoading(false);
      });
    });

    void bootstrapAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{
      session, user, profile, roles,
      isAdmin: roles.includes("admin"),
      isTeamMember: roles.includes("team_member"),
      isSupervisee: roles.includes("supervisee"),
      isStaff: roles.includes("admin") || roles.includes("team_member"),
      loading, signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};
