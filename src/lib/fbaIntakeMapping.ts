// Maps a submitted Hanley intake (fba_intake_responses.responses jsonb) to a
// partial draft for the FBA report builder. Keys mirror the IntakeQuestion keys
// defined in src/lib/fbaIntakeQuestions.ts.

export interface IntakePrefillSource {
  child_name?: string | null;
  responses: Record<string, string>;
}

export interface FBAReportDraftPatch {
  clientName?: string;
  clientDOB?: string;
  diagnosis?: string;
  referralReason?: string;
  background?: string;
  environment?: string;
  behaviours?: Array<{
    name: string;
    topography: string;
    frequency: string;
    intensity: string;
    duration: string;
    context: string;
  }>;
  hypotheses?: Array<{
    behaviour: string;
    function: string;
    benefitsOfBehaviour: string;
    costsOfAlternatives: string;
    hypothesis: string;
  }>;
  cq_currentState?: string;
  cq_historyOfPattern?: string;
  cq_conditionsWhenBetter?: string;
  cq_whatHasWorked?: string;
}

const v = (r: Record<string, string>, k: string) => (r[k] ?? "").toString().trim();

const join = (...parts: string[]) => parts.filter(Boolean).join("\n\n");

export const mapIntakeToReportDraft = (src: IntakePrefillSource): FBAReportDraftPatch => {
  const r = src.responses || {};

  const clientName = src.child_name?.trim() || v(r, "childName");
  const clientDOB = v(r, "dob");

  const referralReason = join(
    v(r, "topConcern") && `Most concerning behaviour: ${v(r, "topConcern")}`,
    v(r, "topThreeConcerns") && `Top three concerns:\n${v(r, "topThreeConcerns")}`,
  );

  const background = join(
    v(r, "languageAbilities") && `Language and communication:\n${v(r, "languageAbilities")}`,
    v(r, "playSkills") && `Play and leisure:\n${v(r, "playSkills")}`,
    v(r, "otherPreferences") && `Other preferences:\n${v(r, "otherPreferences")}`,
  );

  const environment = join(
    v(r, "conditionsMostLikely") && `Conditions most likely to evoke behaviour:\n${v(r, "conditionsMostLikely")}`,
    v(r, "activitiesTriggering") && `Activities that reliably trigger:\n${v(r, "activitiesTriggering")}`,
  );

  const primaryBehaviour = v(r, "topConcern") || v(r, "problemBehavioursDescription").split(/[.\n]/)[0] || "";
  const triggerSummary = join(
    v(r, "specificTriggers"),
    v(r, "routineInterruptions") && `Routine interruptions: ${v(r, "routineInterruptions")}`,
    v(r, "notGettingTheirWay") && `Not getting their way: ${v(r, "notGettingTheirWay")}`,
  );

  const behaviours = primaryBehaviour
    ? [{
        name: primaryBehaviour,
        topography: v(r, "problemBehavioursDescription"),
        frequency: "",
        intensity: v(r, "intensityRange"),
        duration: "",
        context: triggerSummary || v(r, "burstsAndPrecursors"),
      }]
    : undefined;

  const hypothesisSeed = join(
    v(r, "communicating") && `Parent's hunch — communication: ${v(r, "communicating")}`,
    v(r, "selfStimulation") && `Possible self-stimulation: ${v(r, "selfStimulation")}`,
    v(r, "whyEngaging") && `Why parent thinks behaviour occurs: ${v(r, "whyEngaging")}`,
  );

  const hypotheses = primaryBehaviour && hypothesisSeed
    ? [{
        behaviour: primaryBehaviour,
        function: "",
        benefitsOfBehaviour: v(r, "whyEngaging"),
        costsOfAlternatives: "",
        hypothesis: hypothesisSeed,
      }]
    : undefined;

  return {
    ...(clientName && { clientName }),
    ...(clientDOB && { clientDOB }),
    ...(referralReason && { referralReason }),
    ...(background && { background }),
    ...(environment && { environment }),
    ...(behaviours && { behaviours }),
    ...(hypotheses && { hypotheses }),
    ...(v(r, "calmingStrategies") && { cq_whatHasWorked: v(r, "calmingStrategies") }),
    ...(v(r, "howYouRespond") && { cq_historyOfPattern: v(r, "howYouRespond") }),
    ...(v(r, "burstsAndPrecursors") && { cq_currentState: v(r, "burstsAndPrecursors") }),
  };
};

// Custom event used to pre-fill the report builder from anywhere in the app.
export const FBA_PREFILL_EVENT = "fba-report-prefill";
export const FBA_PREFILL_STORAGE_KEY = "fba-report-prefill-pending";
