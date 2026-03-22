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
    if (profileRes.data) setProfile(profileRes.data);
    if (rolesRes.data) setRoles(rolesRes.data.map((r) => r.role));
  };

  useEffect(() => {
    let mounted = true;
    let initialDone = false;

    // onAuthStateChange fires INITIAL_SESSION first, then getSession resolves.
    // We must NOT await inside the listener to avoid blocking Supabase internals.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fire-and-forget: fetch user data without blocking the callback
        fetchUserData(session.user.id).then(() => {
          if (mounted && !initialDone) {
            initialDone = true;
            setLoading(false);
          }
        });
      } else {
        setProfile(null);
        setRoles([]);
        if (!initialDone) {
          initialDone = true;
          setLoading(false);
        }
      }
    });

    // Fallback: if onAuthStateChange never fires (edge case), resolve loading
    const timeout = setTimeout(() => {
      if (mounted && !initialDone) {
        initialDone = true;
        setLoading(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
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
      isStaff: roles.includes("admin") || roles.includes("team_member"),
      loading, signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};
