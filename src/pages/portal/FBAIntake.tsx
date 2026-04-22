import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ClipboardList, CheckCircle2, Save, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  FBA_INTAKE_SECTIONS,
  IntakeQuestion,
  calcCompletion,
} from "@/lib/fbaIntakeQuestions";
import { ArrowRight, Sparkles } from "lucide-react";

interface AssignmentRow {
  id: string;
  client_id: string;
  child_name: string;
  status: string;
  notes: string;
  submitted_at: string | null;
  created_at: string;
}

const FBAIntake = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const active = useMemo(
    () => assignments.find((a) => a.id === activeId) || null,
    [assignments, activeId],
  );
  const completion = calcCompletion(responses);

  const allQuestions = useMemo(
    () => FBA_INTAKE_SECTIONS.flatMap((s) => s.questions.map((q) => ({ ...q, sectionId: s.id, sectionTitle: s.title }))),
    [],
  );
  const answeredCount = useMemo(
    () => Object.values(responses).filter((v) => (v ?? "").toString().trim().length > 0).length,
    [responses],
  );
  const nextQuestion = useMemo(
    () => allQuestions.find((q) => !(responses[q.key] ?? "").toString().trim()),
    [allQuestions, responses],
  );
  const hasStarted = answeredCount > 0;

  const scrollToQuestion = (key: string) => {
    const el = document.getElementById(`q-${key}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = el.querySelector("input, textarea, button") as HTMLElement | null;
      setTimeout(() => input?.focus(), 400);
    }
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data: rows } = await supabase
        .from("fba_intake_assignments")
        .select("id, client_id, child_name, status, notes, submitted_at, created_at")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });
      setAssignments(rows || []);
      if (rows && rows.length && !activeId) setActiveId(rows[0].id);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const { data } = await supabase
        .from("fba_intake_responses")
        .select("responses")
        .eq("assignment_id", activeId)
        .maybeSingle();
      setResponses(((data?.responses as Record<string, string>) ?? {}) || {});
    })();
  }, [activeId]);

  const updateResponse = (key: string, value: string) =>
    setResponses((r) => ({ ...r, [key]: value }));

  const persist = async (markStatus?: "in_progress" | "submitted") => {
    if (!active || !user) return;
    const { error: upErr } = await supabase
      .from("fba_intake_responses")
      .upsert(
        {
          assignment_id: active.id,
          client_id: user.id,
          responses,
        },
        { onConflict: "assignment_id" },
      );
    if (upErr) throw upErr;
    if (markStatus) {
      const update: { status: string; submitted_at?: string } = { status: markStatus };
      if (markStatus === "submitted") update.submitted_at = new Date().toISOString();
      const { error: aErr } = await supabase
        .from("fba_intake_assignments")
        .update(update)
        .eq("id", active.id);
      if (aErr) throw aErr;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await persist(active?.status === "pending" ? "in_progress" : undefined);
      toast.success("Progress saved");
      const { data: rows } = await supabase
        .from("fba_intake_assignments")
        .select("id, client_id, child_name, status, notes, submitted_at, created_at")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false });
      setAssignments(rows || []);
    } catch (e: any) {
      toast.error(e.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (completion < 60) {
      const ok = window.confirm(
        `You've answered ${completion}% of the questions. Submit anyway? You can edit later only if your therapist re-opens it.`,
      );
      if (!ok) return;
    }
    setSubmitting(true);
    try {
      await persist("submitted");
      toast.success("Intake submitted to your therapist");
      const { data: rows } = await supabase
        .from("fba_intake_assignments")
        .select("id, client_id, child_name, status, notes, submitted_at, created_at")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false });
      setAssignments(rows || []);
    } catch (e: any) {
      toast.error(e.message || "Could not submit");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (q: IntakeQuestion) => {
    const v = responses[q.key] ?? "";
    if (q.type === "textarea")
      return <Textarea rows={q.rows ?? 4} value={v} onChange={(e) => updateResponse(q.key, e.target.value)} />;
    if (q.type === "date")
      return <Input type="date" value={v} onChange={(e) => updateResponse(q.key, e.target.value)} />;
    if (q.type === "radio")
      return (
        <div className="flex flex-wrap gap-2">
          {(q.options ?? []).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => updateResponse(q.key, opt)}
              className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                v === opt
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/40"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    return <Input value={v} onChange={(e) => updateResponse(q.key, e.target.value)} />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-3xl">
          <Link
            to="/portal"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to portal
          </Link>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                <ClipboardList size={22} />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif text-foreground">FBA intake interview</h1>
            </div>
            <p className="text-muted-foreground mb-8 ml-14 font-light">
              Open-ended questions to help your therapist understand your child before assessment.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="rounded-2xl border border-border bg-muted/20 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Your therapist hasn't requested an FBA intake yet. They will let you know when it's ready.
              </p>
            </div>
          ) : (
            <>
              {assignments.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {assignments.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setActiveId(a.id)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                        a.id === activeId
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {a.child_name || "Intake"} · {a.status}
                    </button>
                  ))}
                </div>
              )}

              {active && (
                <>
                  <div className="rounded-2xl border border-border bg-card/50 p-5 mb-4">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                          Intake for
                        </p>
                        <div className="text-lg font-serif text-foreground">
                          {active.child_name || "Your child"}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase ${
                          active.status === "submitted"
                            ? "border-primary/40 text-primary bg-primary/5"
                            : active.status === "in_progress"
                              ? "border-primary/30 text-primary bg-primary/5"
                              : "border-border text-muted-foreground"
                        }`}
                      >
                        {active.status === "pending"
                          ? "Pending — not started"
                          : active.status.replace("_", " ")}
                      </Badge>
                    </div>
                    {active.notes && (
                      <p className="text-xs text-muted-foreground mb-3 italic">"{active.notes}"</p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                      <span>
                        {answeredCount} of {allQuestions.length} answered
                      </span>
                      <span className="font-medium text-foreground">{completion}%</span>
                    </div>
                    <Progress value={completion} className="h-2" />
                  </div>

                  {active.status !== "submitted" && nextQuestion && (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="button"
                      onClick={() => scrollToQuestion(nextQuestion.key)}
                      className="w-full text-left rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 p-4 mb-6 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary rounded-lg p-2 shrink-0">
                          <Sparkles size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] uppercase tracking-wider text-primary font-medium mb-1">
                            {hasStarted ? "Continue where you left off" : "Start your intake"}
                          </p>
                          <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                            {nextQuestion.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {nextQuestion.sectionTitle}
                          </p>
                        </div>
                        <ArrowRight
                          size={18}
                          className="text-primary mt-1 shrink-0 group-hover:translate-x-0.5 transition-transform"
                        />
                      </div>
                    </motion.button>
                  )}

                  {active.status === "submitted" && (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6 flex items-start gap-2">
                      <CheckCircle2 className="text-primary mt-0.5 shrink-0" size={16} />
                      <p className="text-xs text-foreground">
                        Submitted on{" "}
                        {active.submitted_at
                          ? new Date(active.submitted_at).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : ""}
                        . You can still edit and re-save your answers below.
                      </p>
                    </div>
                  )}

                  <div className="space-y-8">
                    {FBA_INTAKE_SECTIONS.map((sec) => (
                      <motion.div
                        key={sec.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-2xl border border-border bg-card/30 p-5 sm:p-6"
                      >
                        <h2 className="text-lg font-serif text-foreground mb-1">{sec.title}</h2>
                        {sec.description && (
                          <p className="text-xs text-muted-foreground mb-5 leading-relaxed">{sec.description}</p>
                        )}
                        <div className="space-y-5">
                          {sec.questions.map((q) => {
                            const isNext = nextQuestion?.key === q.key;
                            return (
                              <div
                                key={q.key}
                                id={`q-${q.key}`}
                                className={`space-y-1.5 scroll-mt-24 rounded-lg transition-all ${
                                  isNext ? "ring-2 ring-primary/40 bg-primary/5 p-3 -m-3" : ""
                                }`}
                              >
                                <Label className="text-sm font-medium leading-snug">{q.label}</Label>
                                {q.hint && <p className="text-[11px] text-muted-foreground">{q.hint}</p>}
                                {renderField(q)}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="sticky bottom-4 mt-6 flex flex-col sm:flex-row gap-2 bg-background/80 backdrop-blur-md border border-border rounded-2xl p-3 shadow-lg">
                    <Button variant="outline" onClick={handleSave} disabled={saving} className="gap-2 flex-1">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save progress
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting} className="gap-2 flex-1">
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      {active.status === "submitted" ? "Re-submit updated answers" : "Submit to therapist"}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FBAIntake;
