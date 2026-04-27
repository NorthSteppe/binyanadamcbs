import { format, formatDistanceToNow } from "date-fns";
import { Calendar, FileText, CheckCircle2, Circle, Upload, ClipboardList, Clock, TrendingUp, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { calcCompletion } from "@/lib/fbaIntakeQuestions";

interface Props {
  profile: { full_name: string; created_at: string; email?: string; phone?: string } | null;
  sessions: any[];
  notes: any[];
  todos: any[];
  documents: any[];
  intakes: any[];
  intakeResponses: Record<string, Record<string, string>>;
}

const Stat = ({ icon: Icon, label, value, hint }: any) => (
  <div className="bg-muted/30 border border-border/40 rounded-xl p-3">
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
      <Icon size={12} /> {label}
    </div>
    <div className="text-lg font-semibold">{value}</div>
    {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
  </div>
);

const ClientAutoOverview = ({ profile, sessions, notes, todos, documents, intakes, intakeResponses }: Props) => {
  const now = new Date();
  const completed = sessions.filter((s) => s.status === "completed");
  const upcoming = sessions
    .filter((s) => new Date(s.session_date) > now && s.status !== "cancelled")
    .sort((a, b) => +new Date(a.session_date) - +new Date(b.session_date));
  const lastCompleted = completed
    .slice()
    .sort((a, b) => +new Date(b.session_date) - +new Date(a.session_date))[0];
  const nextUp = upcoming[0];
  const openTodos = todos.filter((t) => !t.is_completed);
  const lastNote = notes[0];
  const lastDoc = documents[0];
  const lastIntake = intakes[0];
  const intakePct = lastIntake ? calcCompletion(intakeResponses[lastIntake.id] || {}) : 0;

  // Sessions in last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentCount = completed.filter((s) => new Date(s.session_date) >= thirtyDaysAgo).length;

  // Cadence: avg days between last 5 completed
  let cadenceLabel = "—";
  const lastFive = completed
    .slice()
    .sort((a, b) => +new Date(b.session_date) - +new Date(a.session_date))
    .slice(0, 5);
  if (lastFive.length >= 2) {
    const gaps: number[] = [];
    for (let i = 1; i < lastFive.length; i++) {
      gaps.push(
        (+new Date(lastFive[i - 1].session_date) - +new Date(lastFive[i].session_date)) /
          (1000 * 60 * 60 * 24)
      );
    }
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    cadenceLabel = `~${Math.round(avg)} days`;
  }

  return (
    <div className="space-y-6">
      {/* Auto stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat
          icon={Calendar}
          label="Sessions"
          value={completed.length}
          hint={`${recentCount} in last 30d`}
        />
        <Stat
          icon={Clock}
          label="Next session"
          value={nextUp ? format(new Date(nextUp.session_date), "d MMM") : "—"}
          hint={nextUp ? format(new Date(nextUp.session_date), "EEE HH:mm") : "Nothing scheduled"}
        />
        <Stat
          icon={Activity}
          label="Cadence"
          value={cadenceLabel}
          hint={lastCompleted ? `Last: ${formatDistanceToNow(new Date(lastCompleted.session_date), { addSuffix: true })}` : ""}
        />
        <Stat
          icon={CheckCircle2}
          label="Open to-dos"
          value={openTodos.length}
          hint={`${todos.length - openTodos.length} done`}
        />
      </div>

      {/* Auto activity */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <ClipboardList size={12} /> Latest intake
          </div>
          {lastIntake ? (
            <div className="space-y-1">
              <div className="text-sm font-medium">
                {lastIntake.status === "completed" ? "Completed" : `In progress (${intakePct}%)`}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(lastIntake.created_at), "d MMM yyyy")}
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No FBA intake assigned yet</div>
          )}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <FileText size={12} /> Latest note
          </div>
          {lastNote ? (
            <div className="space-y-1">
              <div className="text-sm line-clamp-2">{lastNote.content || lastNote.title || "Note"}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(lastNote.created_at), { addSuffix: true })}
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No notes yet</div>
          )}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Upload size={12} /> Latest document
          </div>
          {lastDoc ? (
            <div className="space-y-1">
              <div className="text-sm font-medium truncate">{lastDoc.file_name || lastDoc.name || "Document"}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(lastDoc.created_at), { addSuffix: true })}
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No documents uploaded</div>
          )}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <TrendingUp size={12} /> Engagement
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile?.created_at && (
              <Badge variant="secondary" className="text-[10px]">
                Client since {format(new Date(profile.created_at), "MMM yyyy")}
              </Badge>
            )}
            {recentCount >= 4 && <Badge className="text-[10px]">High engagement</Badge>}
            {recentCount === 0 && completed.length > 0 && (
              <Badge variant="destructive" className="text-[10px]">Inactive 30d</Badge>
            )}
            {openTodos.length > 5 && <Badge variant="destructive" className="text-[10px]">Many open tasks</Badge>}
            {!lastIntake && <Badge variant="outline" className="text-[10px]">Intake pending</Badge>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientAutoOverview;
