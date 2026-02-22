import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MessageSquare, BookOpen, Bot, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("sessions")
      .select("*")
      .eq("client_id", user.id)
      .gte("session_date", new Date().toISOString())
      .order("session_date", { ascending: true })
      .limit(3)
      .then(({ data }) => { if (data) setUpcomingSessions(data); });

    supabase
      .from("messages")
      .select("id", { count: "exact" })
      .eq("recipient_id", user.id)
      .eq("read", false)
      .then(({ count }) => { if (count) setUnreadCount(count); });
  }, [user]);

  const portalT = (t as any).portal || {};

  const cards = [
    { icon: Calendar, label: portalT.booking || "Book a Session", path: "/portal/booking", color: "bg-primary" },
    { icon: MessageSquare, label: portalT.messages || "Messages", path: "/portal/messages", color: "bg-accent", badge: unreadCount },
    { icon: BookOpen, label: portalT.resources || "Resource Library", path: "/portal/resources", color: "bg-family" },
    { icon: Bot, label: portalT.aiChat || "AI Assistant", path: "/portal/chat", color: "bg-supervision" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl mb-2">
              {portalT.welcome || "Welcome back"}{profile?.full_name ? `, ${profile.full_name}` : ""}
            </h1>
            <p className="text-muted-foreground mb-10">{portalT.dashboardSubtitle || "Your client portal"}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {cards.map((card, i) => (
              <motion.div key={card.path} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link
                  to={card.path}
                  className="relative bg-card border border-border/50 rounded-2xl p-6 flex flex-col items-start gap-3 hover:border-primary/30 hover:shadow-sm transition-all block"
                >
                  <div className={`${card.color} text-primary-foreground rounded-xl p-3`}>
                    <card.icon size={22} />
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">{card.label}</p>
                  {card.badge ? (
                    <span className="absolute top-4 end-4 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {card.badge}
                    </span>
                  ) : null}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Upcoming sessions */}
          <div className="bg-card rounded-2xl border border-border/50 p-8">
            <h2 className="text-xl mb-5 flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              {portalT.upcoming || "Upcoming Sessions"}
            </h2>
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{portalT.noSessions || "No upcoming sessions. Book one to get started."}</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-background rounded-xl p-4 border border-border/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.session_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {" · "}{s.duration_minutes} min
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">{s.status}</span>
                  </div>
                ))}
              </div>
            )}
            <Button asChild variant="outline" size="sm" className="rounded-full mt-5">
              <Link to="/portal/booking">{portalT.bookNew || "Book a Session"}</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Dashboard;
