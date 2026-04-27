import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Calendar, Mail, UserCircle2, Users, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Member = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: "therapist" | "admin";
};

const PRACTICE_EMAIL = "adamdayan@bacbs.com";

const Avatar = ({ name, url }: { name: string; url: string | null }) => {
  const initials = name.split(" ").map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
  if (url) {
    return <img src={url} alt={name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white/80 shadow-sm" />;
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center ring-2 ring-white/80 shadow-sm">
      {initials}
    </div>
  );
};

const MyCareTeam = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        // Therapists assigned to this client
        const { data: assignments } = await supabase
          .from("client_assignments")
          .select("assignee_id")
          .eq("client_id", user.id);

        const therapistIds = (assignments || []).map(a => a.assignee_id);

        // Admins (practice owners) — discoverable so clients always have a path to admin
        const { data: adminRoles } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin");
        const adminIds = (adminRoles || []).map(r => r.user_id);

        const allIds = Array.from(new Set([...therapistIds, ...adminIds]));
        if (allIds.length === 0) { setLoading(false); return; }

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", allIds);

        const list: Member[] = [];
        therapistIds.forEach(id => {
          const p = profiles?.find(x => x.id === id);
          if (p) list.push({ ...p, role: "therapist" });
        });
        adminIds.forEach(id => {
          if (therapistIds.includes(id)) return; // avoid double listing if admin also therapist
          const p = profiles?.find(x => x.id === id);
          if (p) list.push({ ...p, role: "admin" });
        });

        setMembers(list);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return null;
  if (members.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl bg-white/85 backdrop-blur-md border border-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-black/[0.05]">
        <div className="w-1 h-7 rounded-full" style={{ background: "#0ea5e9" }} />
        <Users size={15} className="text-muted-foreground" />
        <div>
          <h3 className="text-sm font-semibold text-foreground leading-none">Your care team</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Direct line to your therapist and the practice</p>
        </div>
      </div>
      <div className="p-4 grid sm:grid-cols-2 gap-3">
        {members.map(m => (
          <div
            key={m.id}
            className="rounded-xl border border-black/[0.06] bg-white/60 hover:bg-white/85 transition-all duration-300 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={m.full_name} url={m.avatar_url} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{m.full_name}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  {m.role === "admin" ? <ShieldCheck size={10} /> : <UserCircle2 size={10} />}
                  {m.role === "admin" ? "Practice admin" : "Your therapist"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/portal/messages?to=${m.id}`}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 transition-colors"
              >
                <MessageSquare size={11} /> Message
              </Link>
              {m.role === "therapist" && (
                <Link
                  to="/portal/booking"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 transition-colors"
                >
                  <Calendar size={11} /> Book
                </Link>
              )}
              {m.role === "admin" && (
                <a
                  href={`mailto:${PRACTICE_EMAIL}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-slate-500/10 text-slate-700 hover:bg-slate-500/20 transition-colors"
                >
                  <Mail size={11} /> Email
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default MyCareTeam;
