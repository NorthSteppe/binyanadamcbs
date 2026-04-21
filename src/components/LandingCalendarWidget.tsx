import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay,
  addMonths, subMonths, startOfWeek, endOfWeek, parseISO, isToday, isAfter,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, ArrowUpRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getHebrewDay } from "@/utils/hebrewCalendar";
import { Button } from "@/components/ui/button";

type CalEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "session" | "task";
  status?: string;
};

const LandingCalendarWidget = () => {
  const { user, isAdmin, isTeamMember } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hovered, setHovered] = useState<string | null>(null);

  const portalLink = isAdmin ? "/admin/calendar" : isTeamMember ? "/staff" : "/portal";

  // Fetch sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ["landing-sessions", user?.id, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      if (!user) return [];
      const start = startOfMonth(currentDate).toISOString();
      const end = endOfMonth(currentDate).toISOString();
      const { data, error } = await supabase
        .from("sessions")
        .select("id, title, session_date, duration_minutes, status, client_id, therapist_id, attendee_ids")
        .gte("session_date", start)
        .lte("session_date", end)
        .order("session_date", { ascending: true });
      if (error) return [];
      return (data || []).filter((s: any) =>
        s.client_id === user.id ||
        s.therapist_id === user.id ||
        (s.attendee_ids || []).includes(user.id) ||
        isAdmin
      );
    },
    enabled: !!user,
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ["landing-tasks", user?.id, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      if (!user) return [];
      const start = startOfMonth(currentDate).toISOString();
      const end = endOfMonth(currentDate).toISOString();
      const { data } = await supabase
        .from("user_tasks")
        .select("id, title, scheduled_start, scheduled_end, due_date, status, is_completed")
        .eq("user_id", user.id)
        .or(`scheduled_start.gte.${start},due_date.gte.${start.slice(0, 10)}`)
        .order("scheduled_start", { ascending: true })
        .limit(60);
      return (data || []).filter((t: any) => !t.is_completed);
    },
    enabled: !!user,
  });

  const events: CalEvent[] = useMemo(() => {
    const evs: CalEvent[] = [];
    sessions.forEach((s: any) => {
      const start = parseISO(s.session_date);
      const end = new Date(start.getTime() + (s.duration_minutes || 60) * 60000);
      evs.push({ id: s.id, title: s.title, start, end, type: "session", status: s.status });
    });
    tasks.forEach((t: any) => {
      if (t.scheduled_start) {
        const start = parseISO(t.scheduled_start);
        const end = t.scheduled_end ? parseISO(t.scheduled_end) : new Date(start.getTime() + 30 * 60000);
        evs.push({ id: t.id, title: t.title, start, end, type: "task", status: t.status });
      } else if (t.due_date) {
        const d = parseISO(t.due_date);
        evs.push({ id: t.id, title: t.title, start: d, end: d, type: "task", status: t.status });
      }
    });
    return evs;
  }, [sessions, tasks]);

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 0 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
    });
  }, [currentDate]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    events.forEach((e) => {
      const key = format(e.start, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  const selectedEvents = useMemo(() => {
    return events
      .filter((e) => isSameDay(e.start, selectedDate))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, selectedDate]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => isAfter(e.end, now))
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 5);
  }, [events]);

  if (!user) return null;

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-foreground/[0.04] blur-3xl" />
      </div>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider">Your schedule</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3 tracking-tight">
            Welcome back
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your upcoming sessions and tasks at a glance
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid lg:grid-cols-[1.4fr,1fr] gap-6 max-w-6xl mx-auto"
          style={{ perspective: "2000px" }}
        >
          {/* Calendar card with 3D tilt */}
          <motion.div
            whileHover={{ rotateX: 2, rotateY: -2, scale: 1.005 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="relative rounded-3xl overflow-hidden"
            style={{
              transformStyle: "preserve-3d",
              background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)",
              boxShadow: `
                0 1px 0 0 hsla(0, 0%, 100%, 0.6) inset,
                0 -1px 0 0 hsla(0, 0%, 0%, 0.04) inset,
                0 30px 60px -20px hsla(0, 0%, 0%, 0.18),
                0 18px 36px -18px hsla(0, 0%, 0%, 0.22),
                0 4px 8px -4px hsla(0, 0%, 0%, 0.08)
              `,
              border: "1px solid hsl(var(--border))",
            }}
          >
            {/* Glossy top sheen */}
            <div
              className="absolute inset-x-0 top-0 h-32 pointer-events-none opacity-60"
              style={{
                background: "linear-gradient(180deg, hsla(0,0%,100%,0.5) 0%, transparent 100%)",
              }}
            />

            <div className="relative p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-display font-semibold text-foreground tracking-tight">
                    {format(currentDate, "MMMM")}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-1">
                    {format(currentDate, "yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-full bg-muted/60 backdrop-blur-sm">
                  <button
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className="w-8 h-8 rounded-full hover:bg-background flex items-center justify-center transition-all hover:shadow-sm active:scale-95"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4 text-foreground" />
                  </button>
                  <button
                    onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}
                    className="px-3 h-8 rounded-full text-xs font-medium hover:bg-background transition-all"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="w-8 h-8 rounded-full hover:bg-background flex items-center justify-center transition-all hover:shadow-sm active:scale-95"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-4 h-4 text-foreground" />
                  </button>
                </div>
              </div>

              {/* Weekday header */}
              <div className="grid grid-cols-7 gap-1 mb-3">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 font-medium py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                <AnimatePresence mode="popLayout">
                  {monthDays.map((day, idx) => {
                    const key = format(day, "yyyy-MM-dd");
                    const dayEvents = eventsByDay.get(key) || [];
                    const inMonth = isSameMonth(day, currentDate);
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentDay = isToday(day);
                    const hebrew = getHebrewDay(day);

                    return (
                      <motion.button
                        key={key}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.005, duration: 0.3 }}
                        onClick={() => setSelectedDate(day)}
                        onMouseEnter={() => setHovered(key)}
                        onMouseLeave={() => setHovered(null)}
                        className={`
                          relative aspect-square rounded-2xl p-1.5 flex flex-col items-center justify-start
                          transition-all duration-300 group
                          ${!inMonth ? "opacity-30" : ""}
                          ${isSelected
                            ? "bg-primary text-primary-foreground shadow-lg scale-105"
                            : isCurrentDay
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "hover:bg-muted/80 text-foreground"
                          }
                        `}
                        style={isSelected ? {
                          boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.5), inset 0 1px 0 hsla(255,255,255,0.15)",
                          transform: "translateZ(20px) scale(1.05)",
                        } : hovered === key && inMonth ? {
                          transform: "translateZ(8px)",
                          boxShadow: "0 4px 12px -4px hsla(0,0%,0%,0.12)",
                        } : undefined}
                      >
                        <span className={`text-sm font-medium leading-none mt-1 ${isCurrentDay && !isSelected ? "font-bold" : ""}`}>
                          {format(day, "d")}
                        </span>
                        {hebrew && inMonth && (
                          <span className={`text-[8px] mt-0.5 leading-none ${isSelected ? "opacity-70" : "text-muted-foreground/60"}`}>
                            {hebrew}
                          </span>
                        )}
                        {/* Event dots */}
                        {dayEvents.length > 0 && (
                          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                            {dayEvents.slice(0, 3).map((e, i) => (
                              <span
                                key={i}
                                className={`w-1 h-1 rounded-full ${
                                  isSelected
                                    ? "bg-primary-foreground/80"
                                    : e.type === "session"
                                      ? "bg-primary"
                                      : "bg-orange-500"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Events panel */}
          <motion.div
            whileHover={{ rotateX: 2, rotateY: 2, scale: 1.005 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="relative rounded-3xl overflow-hidden flex flex-col"
            style={{
              transformStyle: "preserve-3d",
              background: "linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 100%)",
              boxShadow: `
                0 1px 0 0 hsla(255,255,255,0.15) inset,
                0 -1px 0 0 hsla(0,0%,0%,0.2) inset,
                0 30px 60px -20px hsla(0, 0%, 0%, 0.35),
                0 18px 36px -18px hsla(0, 0%, 0%, 0.3)
              `,
            }}
          >
            {/* Sheen */}
            <div
              className="absolute inset-x-0 top-0 h-40 pointer-events-none opacity-40"
              style={{
                background: "linear-gradient(180deg, hsla(0,0%,100%,0.18) 0%, transparent 100%)",
              }}
            />
            {/* Decorative orbs */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-foreground/5 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-primary-foreground/5 blur-2xl" />

            <div className="relative p-6 md:p-7 flex-1 flex flex-col text-primary-foreground">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60 mb-1">
                    {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE")}
                  </p>
                  <h3 className="text-xl font-display font-semibold tracking-tight">
                    {format(selectedDate, "MMMM d")}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>

              {/* Selected day events */}
              <div className="flex-1 space-y-2 min-h-[180px]">
                <AnimatePresence mode="wait">
                  {selectedEvents.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center py-8"
                    >
                      <p className="text-primary-foreground/50 text-sm">Nothing scheduled</p>
                      <p className="text-primary-foreground/30 text-xs mt-1">Enjoy a clear day</p>
                    </motion.div>
                  ) : (
                    selectedEvents.slice(0, 4).map((e, i) => (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative p-3 rounded-2xl bg-primary-foreground/8 hover:bg-primary-foreground/12 backdrop-blur-sm border border-primary-foreground/10 transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-1 self-stretch rounded-full ${e.type === "session" ? "bg-primary-foreground" : "bg-orange-300"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-primary-foreground truncate">{e.title}</p>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-primary-foreground/60">
                              <Clock className="w-3 h-3" />
                              {e.start.getTime() === e.end.getTime() ? (
                                <span>All day</span>
                              ) : (
                                <span>{format(e.start, "h:mm a")} – {format(e.end, "h:mm a")}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Upcoming summary */}
              {upcomingEvents.length > 0 && (
                <div className="mt-5 pt-5 border-t border-primary-foreground/10">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50 mb-2">
                    Coming up
                  </p>
                  <p className="text-sm text-primary-foreground/80">
                    {upcomingEvents.length} {upcomingEvents.length === 1 ? "event" : "events"} this month
                  </p>
                </div>
              )}

              <Button
                asChild
                className="mt-5 bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full h-11 font-medium shadow-lg group"
              >
                <Link to={portalLink} className="inline-flex items-center justify-center gap-2">
                  Open full calendar
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingCalendarWidget;
