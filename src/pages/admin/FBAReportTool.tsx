import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, ChevronRight, Plus, Trash2, Printer, ArrowLeft,
  User, ClipboardList, Heart, AlertTriangle, MessageSquare, Eye,
  Lightbulb, FileText, CheckCircle2, Brain, Scale,
} from "lucide-react";
import { METAL_BG } from "@/components/portal/PortalShell";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Strength {
  title: string;
  description: string;
}

interface TargetBehaviour {
  name: string;
  topography: string;
  frequency: string;
  intensity: string;
  duration: string;
  context: string;
}

interface ObservationSession {
  sessionNumber: number;
  date: string;
  setting: string;
  participants: string;
  purpose: string;
  observations: string;
  analysis: string;
}

interface BehaviourHypothesis {
  behaviour: string;
  function: string;
  benefitsOfBehaviour: string;   // Nonlinear: what maintaining this behaviour gives the person
  costsOfAlternatives: string;   // Nonlinear: what happens if they DON'T do this behaviour
  hypothesis: string;
}

interface FBAData {
  // Step 1 – Client Info
  clientName: string;
  clientDOB: string;
  diagnosis: string;
  settingType: string;
  settingName: string;
  referralReason: string;
  assessor: string;
  assessmentDates: string;
  // Step 2 – Assessment Methods
  methods: Record<string, boolean>;
  methodsOther: string;
  // Step 3 – Background
  background: string;
  environment: string;
  supportStaff: string;
  // Step 4 – Strengths (current relevant repertoire assets)
  strengths: Strength[];
  // Step 5 – Target Behaviours
  behaviours: TargetBehaviour[];
  // Step 6 – Goldiamond's Constructional Questionnaire
  cq_statedOutcome: string;        // 1. "What would the outcome be for you?"
  cq_observedOutcome: string;      // 2. "What would others observe?"
  cq_currentState: string;         // 3. "How does current differ from desired?"
  cq_historyOfPattern: string;     // 4. History of how the pattern developed
  cq_conditionsWhenBetter: string; // 5. When is the problem less severe or absent?
  cq_whatHasWorked: string;        // 6. Related successes / what worked before
  cq_naturalReinforcer: string;    // 7. What would maintain progress toward goals?
  cq_subgoals: string;             // 8. Systematic approximations / stepping stones
  // Step 7 – ACT Assessment (Hexaflex)
  act_languageComplexity: string;  // Candidacy for ACT (language/relational repertoire)
  act_presentMoment: string;       // Distractibility, contact with now vs. past/future
  act_defusion: string;            // Cognitive fusion, rigid rule-following, repetitive formulations
  act_acceptance: string;          // Experiential avoidance, escape/avoidance patterns
  act_selfAsContext: string;       // Self-as-content, conceptualised self
  act_values: string;              // Stated values, what matters, heroes/guides
  act_committedAction: string;     // Patterns of values-based action / inaction/impulsivity
  act_statedValues: string;        // Client's own values expressed
  act_reinforcers: string;         // Preferred activities and items
  // Step 8 – Direct Observations
  observations: ObservationSession[];
  // Step 9 – Hypotheses (Nonlinear Contingency Analysis)
  hypotheses: BehaviourHypothesis[];
  // Step 10 – Recommendations
  recommendations: string;
  additionalNotes: string;
}

const BEHAVIOUR_FUNCTIONS = [
  "Escape / Avoidance (Sr–)",
  "Access to Attention (Sr+)",
  "Access to Tangibles / Preferred Activities (Sr+)",
  "Automatic / Sensory Reinforcement",
  "Social Positive Reinforcement – Power/Control",
  "Social Negative Reinforcement – Demands/Expectations",
  "Multiple functions",
];

const ASSESSMENT_METHODS = [
  { key: "fai", label: "Functional Assessment Interview (FAI – O'Neill et al., 2014)" },
  { key: "mas", label: "Motivation Assessment Scale (MAS – Durand & Crimmins)" },
  { key: "qabf", label: "Questions About Behavior Function (QABF)" },
  { key: "constructional_questionnaire", label: "Goldiamond's Constructional Questionnaire (1974)" },
  { key: "cpfq", label: "Child Psychological Flexibility Questionnaire (CPFQ)" },
  { key: "camm", label: "Child & Adolescent Mindfulness Measure (CAMM)" },
  { key: "peak", label: "PEAK Comprehensive Assessment (PCA – Dixon, 2019)" },
  { key: "records_review", label: "Records Review (previous reports, assessments)" },
  { key: "parent_interview", label: "Parent / Caregiver Interview" },
  { key: "client_interview", label: "Client Interview" },
  { key: "staff_interview", label: "Staff / Teacher Interview" },
  { key: "direct_observation_abc", label: "Direct Observation – ABC Data Recording" },
  { key: "scatter_plot", label: "Scatter Plot" },
  { key: "daily_events_log", label: "Daily Events Log" },
];

const STEPS = [
  { id: 1, label: "Client Info", icon: User },
  { id: 2, label: "Methods", icon: ClipboardList },
  { id: 3, label: "Background", icon: FileText },
  { id: 4, label: "Strengths & Resources", icon: Heart },
  { id: 5, label: "Target Behaviours", icon: AlertTriangle },
  { id: 6, label: "Constructional Interview", icon: MessageSquare },
  { id: 7, label: "ACT Assessment", icon: Brain },
  { id: 8, label: "Direct Observations", icon: Eye },
  { id: 9, label: "Nonlinear Analysis", icon: Scale },
  { id: 10, label: "Recommendations", icon: Lightbulb },
  { id: 11, label: "Report Preview", icon: Printer },
];

const emptyStrength = (): Strength => ({ title: "", description: "" });
const emptyBehaviour = (): TargetBehaviour => ({
  name: "", topography: "", frequency: "", intensity: "", duration: "", context: "",
});
const emptyObservation = (n: number): ObservationSession => ({
  sessionNumber: n, date: "", setting: "", participants: "", purpose: "", observations: "", analysis: "",
});
const emptyHypothesis = (): BehaviourHypothesis => ({
  behaviour: "", function: "", benefitsOfBehaviour: "", costsOfAlternatives: "", hypothesis: "",
});

const initialData: FBAData = {
  clientName: "", clientDOB: "", diagnosis: "", settingType: "School",
  settingName: "", referralReason: "", assessor: "Adam Dayan – Behaviour Analyst",
  assessmentDates: "",
  methods: Object.fromEntries(ASSESSMENT_METHODS.map((m) => [m.key, false])),
  methodsOther: "",
  background: "", environment: "", supportStaff: "",
  strengths: [emptyStrength()],
  behaviours: [emptyBehaviour()],
  cq_statedOutcome: "", cq_observedOutcome: "", cq_currentState: "",
  cq_historyOfPattern: "", cq_conditionsWhenBetter: "", cq_whatHasWorked: "",
  cq_naturalReinforcer: "", cq_subgoals: "",
  act_languageComplexity: "", act_presentMoment: "", act_defusion: "",
  act_acceptance: "", act_selfAsContext: "", act_values: "",
  act_committedAction: "", act_statedValues: "", act_reinforcers: "",
  observations: [emptyObservation(1)],
  hypotheses: [emptyHypothesis()],
  recommendations: "", additionalNotes: "",
};

// ── Report Generator ───────────────────────────────────────────────────────────

function generateReport(d: FBAData): string {
  const firstName = d.clientName.split(" ")[0] || d.clientName;
  const enabledMethods = ASSESSMENT_METHODS
    .filter((m) => d.methods[m.key]).map((m) => m.label);
  if (d.methodsOther) enabledMethods.push(d.methodsOther);

  const strengthsText = d.strengths
    .filter((s) => s.title.trim())
    .map((s, i) => `${i + 1}. ${s.title}${s.description ? `\n   ${s.description}` : ""}`)
    .join("\n\n");

  const behavioursText = d.behaviours
    .filter((b) => b.name.trim())
    .map((b, i) => {
      let text = `${i + 1}. ${b.name}`;
      if (b.topography) text += `\n   Topography: ${b.topography}`;
      if (b.frequency) text += `\n   Frequency: ${b.frequency}`;
      if (b.intensity) text += `\n   Intensity: ${b.intensity}`;
      if (b.duration) text += `\n   Duration: ${b.duration}`;
      if (b.context) text += `\n   Antecedents/Context: ${b.context}`;
      return text;
    })
    .join("\n\n");

  const observationsText = d.observations
    .filter((o) => o.date || o.observations)
    .map((o) => {
      let text = `Session ${o.sessionNumber}${o.date ? ` — ${new Date(o.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}`;
      if (o.setting) text += `\nSetting: ${o.setting}`;
      if (o.participants) text += `\nParticipants: ${o.participants}`;
      if (o.purpose) text += `\nPurpose: ${o.purpose}`;
      if (o.observations) text += `\n\nObservations:\n${o.observations}`;
      if (o.analysis) text += `\n\nAnalysis:\n${o.analysis}`;
      return text;
    })
    .join("\n\n─────────────────────────────────────\n\n");

  const hypothesesText = d.hypotheses
    .filter((h) => h.behaviour.trim())
    .map((h, i) => {
      let text = `${i + 1}. Behaviour: ${h.behaviour}`;
      if (h.function) text += `\n   Identified Function: ${h.function}`;
      if (h.benefitsOfBehaviour) text += `\n   Benefits of the Current Pattern (what it provides): ${h.benefitsOfBehaviour}`;
      if (h.costsOfAlternatives) text += `\n   Costs of Alternatives (what happens without the behaviour): ${h.costsOfAlternatives}`;
      if (h.hypothesis) text += `\n   Hypothesis Statement: ${h.hypothesis}`;
      return text;
    })
    .join("\n\n");

  return `
ASSESSMENT AND RECOMMENDATIONS REPORT
ACT-Informed Constructional Functional Behaviour Assessment

─────────────────────────────────────────────────────────────────────────────────

CLIENT: ${d.clientName}
Date of Birth: ${d.clientDOB || "—"}
Diagnosis / Profile: ${d.diagnosis || "—"}
Setting: ${d.settingType}${d.settingName ? ` — ${d.settingName}` : ""}
Conducted by: ${d.assessor}
Assessment Dates: ${d.assessmentDates || "—"}
Report Date: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}

─────────────────────────────────────────────────────────────────────────────────

ASSESSMENT METHODS

${enabledMethods.length ? enabledMethods.map((m) => `• ${m}`).join("\n") : "—"}

─────────────────────────────────────────────────────────────────────────────────

REASON FOR REFERRAL

${d.referralReason || "—"}

─────────────────────────────────────────────────────────────────────────────────

BACKGROUND

This report presents the findings of a Functional Behaviour Assessment (FBA) conducted with ${d.clientName}${d.diagnosis ? `, who has a diagnosis of ${d.diagnosis}` : ""}. The assessment adopts a constructional approach, viewing ${firstName}'s behaviour as the competent outcome of available contingencies, rather than as a pathology to be eliminated (Goldiamond, 1974; Layng et al., 2022). Where relevant, an ACT-informed lens is applied to understand the role of language, relational responding, and psychological flexibility in maintaining current patterns and shaping future ones (Dixon et al., 2023).

${d.background || "—"}

Educational / Clinical Environment:
${d.environment || "—"}

Support Staff and Key People:
${d.supportStaff || "—"}

─────────────────────────────────────────────────────────────────────────────────

CURRENT RELEVANT REPERTOIRE — STRENGTHS AND RESOURCES

The following strengths form the foundation upon which a constructional programme can be built. These are the existing repertoires and assets that ${firstName} can draw upon.

${strengthsText || "—"}

─────────────────────────────────────────────────────────────────────────────────

PRESENTING CONCERNS — TARGET BEHAVIOURS

${behavioursText || "—"}

─────────────────────────────────────────────────────────────────────────────────

CONSTRUCTIONAL INTERVIEW
Goldiamond's Constructional Questionnaire (1974)

Note: This interview is designed to obtain information for a constructional programme. It explores not what to eliminate, but what to establish. The goal is to understand where ${firstName} wants to go, where they are now, and what steps can be taken to get there.

1. Stated Outcome
   (What would the outcome be for you? What do you want?)
${d.cq_statedOutcome || "—"}

2. Observed Outcome
   (What would others observe when a successful outcome has been achieved?)
${d.cq_observedOutcome || "—"}

3. Current State
   (How does the present situation differ from the desired outcome?)
${d.cq_currentState || "—"}

4. History of the Pattern
   (How has this pattern developed? What shaped and maintains it?)
${d.cq_historyOfPattern || "—"}

5. Conditions When Better
   (When is the problem less severe or absent? What is different then?)
${d.cq_conditionsWhenBetter || "—"}

6. Related Successes
   (What related problems has ${firstName} tackled successfully before? What has worked?)
${d.cq_whatHasWorked || "—"}

7. Natural Reinforcers for Progress
   (What consequences would naturally maintain progress toward the terminal goals?)
${d.cq_naturalReinforcer || "—"}

8. Systematic Approximations — Subgoals
   (Stepping stones from current state toward terminal outcomes)
${d.cq_subgoals || "—"}

─────────────────────────────────────────────────────────────────────────────────

ACT-INFORMED ASSESSMENT — PSYCHOLOGICAL FLEXIBILITY ANALYSIS

Language and Relational Repertoire
(Candidate for ACT? Does ${firstName} speak about past/future, take perspective of others?)
${d.act_languageComplexity || "—"}

Present-Moment Awareness
(Contact with the here and now; distractibility; attention to current context)
${d.act_presentMoment || "—"}

Defusion (vs. Cognitive Fusion)
(Entanglement with thoughts; rigid rule-following; formulaic responding; arguing about who is right)
${d.act_defusion || "—"}

Acceptance (vs. Experiential Avoidance)
(Escape/avoidance of private events; suppression; attempts to control thoughts/feelings)
${d.act_acceptance || "—"}

Self-as-Context (vs. Self-as-Content)
(Conceptualised self; rigidity about identity; perspective-taking ability)
${d.act_selfAsContext || "—"}

Values
(What does ${firstName} care about? What would they want their life to be about?)
${d.act_values || "—"}

Committed Action (vs. Inaction or Impulsive Action)
(Values-consistent action patterns; habits; goal-directed vs. avoidance-driven behaviour)
${d.act_committedAction || "—"}

Client's Stated Values and Areas of Importance:
${d.act_statedValues || "—"}

Preferred Reinforcers:
${d.act_reinforcers || "—"}

─────────────────────────────────────────────────────────────────────────────────

DIRECT OBSERVATIONS

${observationsText || "—"}

─────────────────────────────────────────────────────────────────────────────────

FUNCTIONAL AND NONLINEAR CONTINGENCY ANALYSIS

The following hypotheses are informed by a nonlinear contingency analysis (Goldiamond, 1974; Layng et al., 2022), which considers not only the consequences of the presenting behaviour but also the consequences of alternatives — that is, what would happen if ${firstName} did NOT engage in the behaviour? This analysis typically reveals that the disturbing behaviour is a rational and competent outcome of the available contingencies.

${hypothesesText || "—"}

─────────────────────────────────────────────────────────────────────────────────

RECOMMENDATIONS

The following recommendations are constructional in nature: they focus on establishing new repertoires that are aligned with ${firstName}'s stated values and terminal goals, rather than on eliminating or suppressing existing behaviours.

${d.recommendations || "—"}

─────────────────────────────────────────────────────────────────────────────────

ADDITIONAL NOTES

${d.additionalNotes || "—"}

─────────────────────────────────────────────────────────────────────────────────

REFERENCES

Dixon, M. R., Belisle, J., Stanley, C. R., & Rowsey, K. E. (2023). Promoting psychological flexibility with clients and in our field. In M. R. Dixon (Ed.), Acceptance and commitment therapy for behavior analysts.

Goldiamond, I. (1974). Toward a constructional approach to social problems: Ethical and constitutional issues raised by applied behaviour analysis. Behaviourism, 2(1), 1–84.

Hayes, S. C., Strosahl, K. D., & Wilson, K. G. (2012). Acceptance and commitment therapy: The process and practice of mindful change (2nd ed.). Guilford Press.

Layng, T. V. J., Andronis, P. T., Codd, R. T., III, & Abdel-Jalil, A. (2022). Nonlinear contingency analysis: Going beyond cognition and behavior in clinical practice. Routledge.

O'Neill, R. E., Albin, R. W., Storey, K., Horner, R. H., & Sprague, J. R. (2014). Functional assessment and program development. Cengage Learning.

─────────────────────────────────────────────────────────────────────────────────

Report prepared by: ${d.assessor}
Date of Report: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
`.trim();
}

// ── Main Component ─────────────────────────────────────────────────────────────

const FBAReportTool = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FBAData>(initialData);
  const printRef = useRef<HTMLPreElement>(null);

  const set = <K extends keyof FBAData>(key: K, value: FBAData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handlePrint = () => {
    const content = generateReport(data);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>FBA Report – ${data.clientName}</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.7;
          max-width: 820px; margin: 40px auto; padding: 0 24px; color: #111; }
        pre { white-space: pre-wrap; font-family: inherit; font-size: 12pt; }
        @media print { body { margin: 20px; } }
      </style></head><body><pre>${content
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      }</pre></body></html>`);
    w.document.close();
    w.print();
  };

  // ── Step Renderers ─────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-4">
      <SectionTitle>Client Information</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Client Full Name *">
          <Input value={data.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="e.g. John Smith" />
        </Field>
        <Field label="Date of Birth">
          <Input type="date" value={data.clientDOB} onChange={(e) => set("clientDOB", e.target.value)} />
        </Field>
        <Field label="Diagnosis / Presenting Profile">
          <Input value={data.diagnosis} onChange={(e) => set("diagnosis", e.target.value)} placeholder="e.g. ADHD, ASD, anxiety..." />
        </Field>
        <Field label="Setting Type">
          <Select value={data.settingType} onValueChange={(v) => set("settingType", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["School", "Home", "Clinic", "Residential", "Community", "Other"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Setting Name">
          <Input value={data.settingName} onChange={(e) => set("settingName", e.target.value)} placeholder="e.g. Bury & Whitefield Jewish Primary School" />
        </Field>
        <Field label="Assessor">
          <Input value={data.assessor} onChange={(e) => set("assessor", e.target.value)} />
        </Field>
        <Field label="Assessment Dates" className="sm:col-span-2">
          <Input value={data.assessmentDates} onChange={(e) => set("assessmentDates", e.target.value)} placeholder="e.g. May–June 2025" />
        </Field>
      </div>
      <Field label="Reason for Referral">
        <Textarea rows={4} value={data.referralReason} onChange={(e) => set("referralReason", e.target.value)}
          placeholder="Why was this assessment requested? What are the key concerns and who referred?" />
      </Field>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <SectionTitle>Assessment Methods Used</SectionTitle>
      <p className="text-sm text-muted-foreground">Select all methods used in this assessment.</p>
      <div className="space-y-2">
        {ASSESSMENT_METHODS.map((m) => (
          <label key={m.key} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
            <Checkbox
              checked={!!data.methods[m.key]}
              onCheckedChange={(v) => set("methods", { ...data.methods, [m.key]: !!v })}
            />
            <span className="text-sm">{m.label}</span>
          </label>
        ))}
      </div>
      <Field label="Other (specify)">
        <Input value={data.methodsOther} onChange={(e) => set("methodsOther", e.target.value)} placeholder="Any other methods not listed..." />
      </Field>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <SectionTitle>Background</SectionTitle>
      <InfoBox color="blue">
        Present the client as a person functioning competently given their circumstances and available contingencies
        (Goldiamond, 1974). Background informs the nonlinear analysis: understanding how the current pattern was shaped
        helps explain why it is a sensible response to life's demands.
      </InfoBox>
      <Field label="Personal & Family Background">
        <Textarea rows={5} value={data.background} onChange={(e) => set("background", e.target.value)}
          placeholder="Living situation, family composition, medical/developmental history, prior assessments or interventions, cultural/linguistic context, relevant life events..." />
      </Field>
      <Field label="Educational / Clinical Environment">
        <Textarea rows={4} value={data.environment} onChange={(e) => set("environment", e.target.value)}
          placeholder="Describe the setting: classroom structure, routines, sensory environment, available resources, learning supports..." />
      </Field>
      <Field label="Support Staff and Key People">
        <Textarea rows={3} value={data.supportStaff} onChange={(e) => set("supportStaff", e.target.value)}
          placeholder="LSAs, teachers, therapists, family members — include roles and duration of involvement..." />
      </Field>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <SectionTitle>Current Relevant Repertoire — Strengths & Resources</SectionTitle>
      <InfoBox color="green">
        The constructional approach begins here. Strengths are not just positives — they are the existing repertoires,
        skills, and resources that a programme can be built upon. These are what make progress possible.
        What does the client already bring to the table?
      </InfoBox>
      {data.strengths.map((s, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">Strength {i + 1}</Badge>
              {data.strengths.length > 1 && (
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => set("strengths", data.strengths.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
            <Field label="Strength / Resource Title">
              <Input value={s.title} onChange={(e) => {
                const arr = [...data.strengths]; arr[i] = { ...arr[i], title: e.target.value }; set("strengths", arr);
              }} placeholder="e.g. Cognitive Foundations, Social Motivation, Creativity, Family Support..." />
            </Field>
            <Field label="Description">
              <Textarea rows={3} value={s.description} onChange={(e) => {
                const arr = [...data.strengths]; arr[i] = { ...arr[i], description: e.target.value }; set("strengths", arr);
              }} placeholder="Describe how this strength manifests and how it is relevant to the programme..." />
            </Field>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => set("strengths", [...data.strengths, emptyStrength()])}>
        <Plus size={14} /> Add Strength
      </Button>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <SectionTitle>Target Behaviours</SectionTitle>
      <InfoBox color="amber">
        Define each behaviour operationally — its topography (what it looks like physically), not its assumed cause.
        Be precise. Remember: the behaviour is a competent adaptation to existing contingencies, not a pathology.
      </InfoBox>
      {data.behaviours.map((b, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs bg-red-50 border-red-200 text-red-700">Behaviour {i + 1}</Badge>
              {data.behaviours.length > 1 && (
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => set("behaviours", data.behaviours.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
            <Field label="Behaviour Name">
              <Input value={b.name} onChange={(e) => {
                const arr = [...data.behaviours]; arr[i] = { ...arr[i], name: e.target.value }; set("behaviours", arr);
              }} placeholder="e.g. Physical Aggression, Task Refusal, Verbal Outburst, Elopement..." />
            </Field>
            <Field label="Topography (what it looks like — not why)">
              <Textarea rows={2} value={b.topography} onChange={(e) => {
                const arr = [...data.behaviours]; arr[i] = { ...arr[i], topography: e.target.value }; set("behaviours", arr);
              }} placeholder="Specific physical form: hitting with open hand toward others' face, throwing objects less than 2 metres, screaming words at volume louder than conversation..." />
            </Field>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Frequency">
                <Input value={b.frequency} onChange={(e) => {
                  const arr = [...data.behaviours]; arr[i] = { ...arr[i], frequency: e.target.value }; set("behaviours", arr);
                }} placeholder="e.g. 3–5 × per day" />
              </Field>
              <Field label="Intensity">
                <Input value={b.intensity} onChange={(e) => {
                  const arr = [...data.behaviours]; arr[i] = { ...arr[i], intensity: e.target.value }; set("behaviours", arr);
                }} placeholder="Mild / Moderate / Severe" />
              </Field>
              <Field label="Duration">
                <Input value={b.duration} onChange={(e) => {
                  const arr = [...data.behaviours]; arr[i] = { ...arr[i], duration: e.target.value }; set("behaviours", arr);
                }} placeholder="e.g. 5–20 minutes" />
              </Field>
            </div>
            <Field label="Antecedents & Context (when/where does this occur?)">
              <Textarea rows={2} value={b.context} onChange={(e) => {
                const arr = [...data.behaviours]; arr[i] = { ...arr[i], context: e.target.value }; set("behaviours", arr);
              }} placeholder="Setting events, immediate antecedents, who is present, what was happening beforehand..." />
            </Field>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => set("behaviours", [...data.behaviours, emptyBehaviour()])}>
        <Plus size={14} /> Add Behaviour
      </Button>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-4">
      <SectionTitle>Constructional Interview — Goldiamond's Questionnaire</SectionTitle>
      <InfoBox color="blue">
        <strong>Goldiamond (1974):</strong> "The goal is not to ask about the problem but about where the client wants to go.
        The intervention is then designed to take the client there — using the very same contingencies that maintain the current pattern."
        A typical interview takes 2–3 hours. Record the client's responses as closely to verbatim as possible.
      </InfoBox>

      <Field label="1. Stated Outcome" hint={`"Assuming we were successful, what would the outcome be for you?" — Record verbatim.`}>
        <Textarea rows={4} value={data.cq_statedOutcome} onChange={(e) => set("cq_statedOutcome", e.target.value)}
          placeholder={`e.g. "I wouldn't be sent out of class. I'd have friends. My teacher would like me. I could show everyone I'm smart."`} />
      </Field>

      <Field label="2. Observed Outcome" hint={`"What would others observe when a successful outcome has been achieved? What would they see you doing?"`}>
        <Textarea rows={4} value={data.cq_observedOutcome} onChange={(e) => set("cq_observedOutcome", e.target.value)}
          placeholder="Observable, specific descriptions: 'You would see him sitting at his desk for 20 minutes, completing work, talking to peers at lunch, responding to instructions within 30 seconds...'" />
      </Field>

      <Field label="3. Current State" hint={`"How does the present situation differ from what you'd like?"`}>
        <Textarea rows={4} value={data.cq_currentState} onChange={(e) => set("cq_currentState", e.target.value)}
          placeholder="How is today different from the desired outcome? What is happening now that should be different?" />
      </Field>

      <Field label="4. History of the Pattern" hint="How was this pattern shaped? What events and contingencies led to it developing? (Not to assign blame — to understand the ecology.)">
        <Textarea rows={4} value={data.cq_historyOfPattern} onChange={(e) => set("cq_historyOfPattern", e.target.value)}
          placeholder="What experiences, transitions, or changes shaped the current pattern? When did it begin? What maintained it over time?" />
      </Field>

      <Field label="5. Conditions When Better" hint={`"Are there situations when the problem is less severe or absent? What is different about those times?"`}>
        <Textarea rows={3} value={data.cq_conditionsWhenBetter} onChange={(e) => set("cq_conditionsWhenBetter", e.target.value)}
          placeholder="Describe settings, people, activities, or times when the challenging behaviour is notably reduced or does not occur. What makes those conditions different?" />
      </Field>

      <Field label="6. Related Successes" hint={`"What related problems have you tackled successfully? What change programmes have you succeeded in?"`}>
        <Textarea rows={3} value={data.cq_whatHasWorked} onChange={(e) => set("cq_whatHasWorked", e.target.value)}
          placeholder="Skills or challenges the client has overcome in the past. Any previous interventions that had some success. Evidence of capacity for change." />
      </Field>

      <Field label="7. Natural Reinforcers for Progress" hint="What would naturally maintain the client's movement toward their goals? (No extraneous reinforcers needed — progress itself and existing reinforcers are enough.)">
        <Textarea rows={3} value={data.cq_naturalReinforcer} onChange={(e) => set("cq_naturalReinforcer", e.target.value)}
          placeholder="What would the client naturally gain as they make progress? What consequences are already available in the environment that would sustain the new repertoire?" />
      </Field>

      <Field label="8. Systematic Approximations — Subgoals" hint="Stepping stones from the current relevant repertoire toward the terminal outcomes. Small enough to ensure success.">
        <Textarea rows={4} value={data.cq_subgoals} onChange={(e) => set("cq_subgoals", e.target.value)}
          placeholder="List incremental steps, in order of proximity to current repertoire. Each step should be achievable and move toward the terminal goal. Keep steps small enough to ensure early success." />
      </Field>
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-4">
      <SectionTitle>ACT-Informed Assessment — Psychological Flexibility</SectionTitle>
      <InfoBox color="purple">
        <strong>Dixon et al. (2023):</strong> Once a client communicates about past/future and takes others' perspectives,
        a comprehensive functional analysis must account for how language interacts with contingencies.
        The ACT Hexaflex provides a framework for assessing the role of verbal behaviour in maintaining current patterns
        and building psychological flexibility.
      </InfoBox>

      <Field label="Language & Relational Repertoire" hint="Candidate for ACT? Does the client speak about past/future events? Do they take the perspective of others? Use metaphor, empathy?">
        <Textarea rows={3} value={data.act_languageComplexity} onChange={(e) => set("act_languageComplexity", e.target.value)}
          placeholder="Describe language complexity: Does the client refer to past events? Talk about the future? Show empathy or perspective-taking? Understand metaphor or jokes? This determines the appropriateness and depth of ACT-based intervention." />
      </Field>

      <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-200">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Hexaflex Assessment</p>

        <Field label="Present-Moment Awareness" hint="Contact with current experience. Observation: Can the client attend to and describe what is happening now? Or is attention dominated by past/future concerns?">
          <Textarea rows={2} value={data.act_presentMoment} onChange={(e) => set("act_presentMoment", e.target.value)}
            placeholder="e.g. Frequently distracted by worries about later in the day / cannot describe what is happening in front of them / strong contact with present activity when interests are engaged..." />
        </Field>

        <Field label="Defusion (vs. Cognitive Fusion)" hint="Rigid entanglement with thoughts. Observation: Does the client act as if thoughts are literal truth? Argue persistently about being right? Repeat formulaic statements regardless of context?">
          <Textarea rows={2} value={data.act_defusion} onChange={(e) => set("act_defusion", e.target.value)}
            placeholder="e.g. Repeatedly states 'nobody likes me' and acts consistently with this rule regardless of evidence / new information does not change stated formulations / strong emotion when beliefs are challenged..." />
        </Field>

        <Field label="Acceptance (vs. Experiential Avoidance)" hint="Willingness to experience discomfort. Observation: Does the client flee from uncomfortable thoughts, feelings, or situations? Are escape/avoidance patterns prominent?">
          <Textarea rows={2} value={data.act_acceptance} onChange={(e) => set("act_acceptance", e.target.value)}
            placeholder="e.g. Refuses tasks when frustrated rather than persisting / leaves situation at first sign of discomfort / low frustration tolerance consistent with escape-maintained behaviour..." />
        </Field>

        <Field label="Self-as-Context (vs. Self-as-Content)" hint="Perspective-taking, flexible sense of self. Observation: Does the client have a rigid, inflexible self-story? Difficulty seeing situations from another's view?">
          <Textarea rows={2} value={data.act_selfAsContext} onChange={(e) => set("act_selfAsContext", e.target.value)}
            placeholder="e.g. Identifies strongly as 'the naughty one' and acts consistent with this / difficulty considering other perspectives / OR: shows flexible self-awareness and empathy..." />
        </Field>

        <Field label="Values" hint="What matters to the client? Observation: Can they say why things are important? Do they have heroes or guides? Do they act toward things beyond immediate reward?">
          <Textarea rows={2} value={data.act_values} onChange={(e) => set("act_values", e.target.value)}
            placeholder="e.g. Frequently references fairness and being respected / strong value placed on being seen as competent / family and relationships are stated as important / or: unable to articulate what matters beyond immediate preferences..." />
        </Field>

        <Field label="Committed Action (vs. Inaction / Impulsivity)" hint="Patterns of purposeful action. Observation: Does the client show values-consistent behaviour, or is action governed by immediate contingencies and avoidance?">
          <Textarea rows={2} value={data.act_committedAction} onChange={(e) => set("act_committedAction", e.target.value)}
            placeholder="e.g. Cannot persist with tasks that do not produce immediate reward / values stated but not acted upon / OR: shows capacity for delayed gratification and goal-directed work when motivated..." />
        </Field>
      </div>

      <Field label="Client's Stated Values and Interests">
        <Textarea rows={3} value={data.act_statedValues} onChange={(e) => set("act_statedValues", e.target.value)}
          placeholder="Record directly what the client says matters to them: fairness, being respected, friendships, family, sports, creativity, being seen as clever, autonomy/control..." />
      </Field>

      <Field label="Preferred Reinforcers">
        <Textarea rows={2} value={data.act_reinforcers} onChange={(e) => set("act_reinforcers", e.target.value)}
          placeholder="Identify high-preference activities, items, and interactions that can serve as motivators in a constructional programme..." />
      </Field>
    </div>
  );

  const renderStep8 = () => (
    <div className="space-y-4">
      <SectionTitle>Direct Observations</SectionTitle>
      <p className="text-sm text-muted-foreground">
        Document each observation session. Record ABC data, setting events, staff interactions, and patterns across sessions.
      </p>
      {data.observations.map((o, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">Session {o.sessionNumber}</Badge>
              {data.observations.length > 1 && (
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => set("observations", data.observations.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Date"><Input type="date" value={o.date} onChange={(e) => {
                const arr = [...data.observations]; arr[i] = { ...arr[i], date: e.target.value }; set("observations", arr);
              }} /></Field>
              <Field label="Setting"><Input value={o.setting} onChange={(e) => {
                const arr = [...data.observations]; arr[i] = { ...arr[i], setting: e.target.value }; set("observations", arr);
              }} placeholder="e.g. Year 2 classroom / Choice Room" /></Field>
            </div>
            <Field label="Participants"><Input value={o.participants} onChange={(e) => {
              const arr = [...data.observations]; arr[i] = { ...arr[i], participants: e.target.value }; set("observations", arr);
            }} placeholder="Client, LSA (name), class teacher, assessor..." /></Field>
            <Field label="Purpose of this Session"><Textarea rows={2} value={o.purpose} onChange={(e) => {
              const arr = [...data.observations]; arr[i] = { ...arr[i], purpose: e.target.value }; set("observations", arr);
            }} placeholder="What were you specifically assessing in this session?" /></Field>
            <Field label="Observations (ABC format where possible)"><Textarea rows={6} value={o.observations} onChange={(e) => {
              const arr = [...data.observations]; arr[i] = { ...arr[i], observations: e.target.value }; set("observations", arr);
            }} placeholder="Describe chronologically. Include antecedents (A), behaviours (B), consequences (C). Record setting events, staff responses, duration, any positive behaviours or strengths observed..." /></Field>
            <Field label="Analysis of Findings"><Textarea rows={3} value={o.analysis} onChange={(e) => {
              const arr = [...data.observations]; arr[i] = { ...arr[i], analysis: e.target.value }; set("observations", arr);
            }} placeholder="What patterns emerged? What did this observation add to the functional hypothesis? Were there moments that challenged or confirmed prior assumptions?" /></Field>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" size="sm" className="gap-1.5"
        onClick={() => set("observations", [...data.observations, emptyObservation(data.observations.length + 1)])}>
        <Plus size={14} /> Add Session
      </Button>
    </div>
  );

  const renderStep9 = () => (
    <div className="space-y-4">
      <SectionTitle>Nonlinear Contingency Analysis — Functional Hypotheses</SectionTitle>
      <InfoBox color="amber">
        <strong>Layng et al. (2022):</strong> A nonlinear analysis considers not just the consequences of the presenting behaviour,
        but also the consequences of <em>not</em> doing it — what are the costs of the alternatives?
        This typically reveals that the disturbing behaviour is the rational, competent outcome of available contingencies.
        "While the costs are often the focus, there are real benefits, especially when measured against the alternatives."
      </InfoBox>
      {data.hypotheses.map((h, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">Hypothesis {i + 1}</Badge>
              {data.hypotheses.length > 1 && (
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => set("hypotheses", data.hypotheses.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
            <Field label="Behaviour">
              <Input value={h.behaviour} onChange={(e) => {
                const arr = [...data.hypotheses]; arr[i] = { ...arr[i], behaviour: e.target.value }; set("hypotheses", arr);
              }} placeholder="Which target behaviour does this hypothesis address?" />
            </Field>
            <Field label="Identified Function">
              <Select value={h.function} onValueChange={(v) => {
                const arr = [...data.hypotheses]; arr[i] = { ...arr[i], function: v }; set("hypotheses", arr);
              }}>
                <SelectTrigger><SelectValue placeholder="Select function..." /></SelectTrigger>
                <SelectContent>
                  {BEHAVIOUR_FUNCTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Benefits of the Current Pattern" hint="What does this behaviour provide? (Nonlinear lens: what would be lost if the behaviour disappeared?)">
              <Textarea rows={2} value={h.benefitsOfBehaviour} onChange={(e) => {
                const arr = [...data.hypotheses]; arr[i] = { ...arr[i], benefitsOfBehaviour: e.target.value }; set("hypotheses", arr);
              }} placeholder="e.g. Escape from non-preferred demands; control over social environment; access to preferred space; sense of power and agency; teacher attention; avoiding feelings of failure..." />
            </Field>
            <Field label="Costs of Alternatives" hint="What happens if the client does NOT engage in this behaviour? Why isn't a 'better' alternative already happening?">
              <Textarea rows={2} value={h.costsOfAlternatives} onChange={(e) => {
                const arr = [...data.hypotheses]; arr[i] = { ...arr[i], costsOfAlternatives: e.target.value }; set("hypotheses", arr);
              }} placeholder="e.g. Complying with demands results in overwhelming workload / social approach leads to rejection / asking for help results in shame / staying in class provides no access to preferred reinforcers..." />
            </Field>
            <Field label="Full Hypothesis Statement">
              <Textarea rows={4} value={h.hypothesis} onChange={(e) => {
                const arr = [...data.hypotheses]; arr[i] = { ...arr[i], hypothesis: e.target.value }; set("hypotheses", arr);
              }} placeholder="e.g. When presented with non-preferred academic tasks (antecedent), [name] engages in task refusal (behaviour) maintained by escape from demands (function). The nonlinear analysis indicates this behaviour is the rational outcome: escape from demands provides immediate relief not available through any alternative currently in [name]'s repertoire..." />
            </Field>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => set("hypotheses", [...data.hypotheses, emptyHypothesis()])}>
        <Plus size={14} /> Add Hypothesis
      </Button>
    </div>
  );

  const renderStep10 = () => (
    <div className="space-y-4">
      <SectionTitle>Recommendations</SectionTitle>
      <InfoBox color="green">
        Recommendations are constructional: they establish new repertoires, not eliminate old ones.
        Use the same reinforcers currently maintaining the challenging behaviour to build the alternative repertoire.
        No extraneous reinforcers needed — progress toward the terminal goal IS the reinforcer (Goldiamond, 1974).
      </InfoBox>
      <Field label="Constructional Programme Recommendations"
        hint="Structure around: environmental modifications (antecedents); skill-building targets (approximations); reinforcement strategies; staff/family guidance; ACT components where indicated; monitoring plan.">
        <Textarea rows={14} value={data.recommendations} onChange={(e) => set("recommendations", e.target.value)}
          placeholder={`Recommendations should address:\n\n• Environmental modifications (antecedent strategies — adjust setting events and immediate triggers)\n• Skill-building targets (systematic approximations toward terminal goals)\n• Reinforcement strategies — use natural reinforcers already maintaining current patterns\n• ACT-based components (values clarification, defusion, present-moment, acceptance, committed action — as applicable)\n• Staff/caregiver guidance — consistent responding, prompting style, relationship quality\n• Monitoring plan — how progress will be tracked and what data will be collected\n• Review schedule — when and how the programme will be reviewed and adjusted`} />
      </Field>
      <Field label="Additional Notes / Caveats">
        <Textarea rows={4} value={data.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)}
          placeholder="Limitations of this assessment, areas requiring further information, any urgent concerns, follow-up actions..." />
      </Field>
    </div>
  );

  const renderStep11 = () => {
    const report = generateReport(data);
    return (
      <div className="space-y-4">
        <SectionTitle>Report Preview</SectionTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handlePrint} className="gap-2">
            <Printer size={15} /> Print / Save as PDF
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigator.clipboard?.writeText(report)}>
            Copy Text
          </Button>
        </div>
        <div className="bg-white border border-border/50 rounded-xl p-6 shadow-sm max-h-[70vh] overflow-y-auto">
          <pre ref={printRef} className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-foreground">
            {report}
          </pre>
        </div>
      </div>
    );
  };

  const stepRenderers: Record<number, () => React.ReactNode> = {
    1: renderStep1, 2: renderStep2, 3: renderStep3, 4: renderStep4, 5: renderStep5,
    6: renderStep6, 7: renderStep7, 8: renderStep8, 9: renderStep9, 10: renderStep10,
    11: renderStep11,
  };

  return (
    <div className="min-h-screen" style={METAL_BG}>
      <Header />

      {/* Top bar */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-white/10 px-4 py-3">
        <div className="container max-w-6xl flex items-center gap-3">
          <Link to="/admin" className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-white font-semibold text-sm tracking-wide">FBA Report Tool</h1>
            <p className="text-white/50 text-[11px]">
              Constructional Approach (Goldiamond, 1974) · Nonlinear Contingency Analysis (Layng et al., 2022) · ACT-Informed
            </p>
          </div>
          {data.clientName && (
            <Badge className="ml-auto bg-white/10 text-white border-white/20 text-[11px]">
              {data.clientName}
            </Badge>
          )}
        </div>
      </div>

      <div className="container max-w-6xl py-6">
        <div className="flex gap-6">

          {/* Sidebar */}
          <div className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-6 space-y-1">
              {STEPS.map((s) => {
                const Icon = s.icon;
                const active = step === s.id;
                const done = step > s.id;
                return (
                  <button key={s.id} onClick={() => setStep(s.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200 text-[12px] font-medium
                      ${active ? "bg-primary text-white shadow-sm" : done ? "text-muted-foreground hover:bg-white/60 hover:text-foreground" : "text-muted-foreground/60 hover:bg-white/40 hover:text-muted-foreground"}`}>
                    <Icon size={13} className="shrink-0" />
                    <span className="truncate">{s.label}</span>
                    {done && <CheckCircle2 size={11} className="ml-auto shrink-0 text-green-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Mobile step indicator */}
            <div className="lg:hidden mb-4 flex items-center gap-1.5 overflow-x-auto pb-1">
              {STEPS.map((s) => (
                <button key={s.id} onClick={() => setStep(s.id)}
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors
                    ${step === s.id ? "bg-primary text-white" : step > s.id ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {s.id}
                </button>
              ))}
            </div>

            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bg-white/80 backdrop-blur-sm border border-black/[0.06] rounded-2xl p-6 shadow-sm">
                {stepRenderers[step]?.()}
              </div>
            </motion.div>

            <div className="flex items-center justify-between mt-4">
              <Button variant="outline" onClick={prev} disabled={step === 1} className="gap-1.5">
                <ChevronLeft size={14} /> Back
              </Button>
              <span className="text-xs text-muted-foreground">Step {step} of {STEPS.length}</span>
              {step < STEPS.length ? (
                <Button onClick={next} className="gap-1.5">Next <ChevronRight size={14} /></Button>
              ) : (
                <Button onClick={handlePrint} className="gap-1.5"><Printer size={14} /> Print Report</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// ── Small helpers ──────────────────────────────────────────────────────────────

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-base font-semibold text-foreground mb-1">{children}</h2>
);

const Field = ({
  label, hint, children, className,
}: {
  label: string; hint?: string; children: React.ReactNode; className?: string;
}) => (
  <div className={`space-y-1.5 ${className ?? ""}`}>
    <Label className="text-xs font-medium">{label}</Label>
    {hint && <p className="text-[11px] text-muted-foreground leading-snug">{hint}</p>}
    {children}
  </div>
);

const InfoBox = ({ children, color }: { children: React.ReactNode; color: "blue" | "green" | "amber" | "purple" }) => {
  const cls = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  }[color];
  return (
    <div className={`rounded-lg border p-3 text-xs leading-relaxed ${cls}`}>
      {children}
    </div>
  );
};

export default FBAReportTool;
