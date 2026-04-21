// Hanley Open-Ended Functional Assessment Interview (2002, rev. 2009)
// Used with the standing permission Greg Hanley grants for clinical use.
// Each question maps to a key stored in fba_intake_responses.responses (jsonb).

export type IntakeFieldType = "text" | "textarea" | "date" | "radio";

export interface IntakeQuestion {
  key: string;
  label: string;
  hint?: string;
  type: IntakeFieldType;
  options?: string[];
  rows?: number;
}

export interface IntakeSection {
  id: string;
  title: string;
  description?: string;
  questions: IntakeQuestion[];
}

export const FBA_INTAKE_SECTIONS: IntakeSection[] = [
  {
    id: "header",
    title: "About this interview",
    description:
      "These open-ended questions help your therapist understand your child before designing supports. Take your time — your answers can be saved and finished later.",
    questions: [
      { key: "interviewDate", label: "Date of interview", type: "date" },
      { key: "childName", label: "Child / client name", type: "text" },
      { key: "respondentName", label: "Your name", type: "text" },
      { key: "respondentRelation", label: "Your relationship to the child", type: "text", hint: "e.g. Mother, Father, Carer, Teacher" },
    ],
  },
  {
    id: "background",
    title: "Background information",
    questions: [
      { key: "dob", label: "Date of birth", type: "date" },
      { key: "ageYears", label: "Age (years and months)", type: "text", hint: "e.g. 7 years 4 months" },
      { key: "sex", label: "Sex", type: "radio", options: ["Male", "Female", "Prefer not to say"] },
      {
        key: "languageAbilities",
        label: "Describe their language abilities",
        type: "textarea",
        rows: 4,
        hint: "How do they communicate? Words, sentences, gestures, AAC device?",
      },
      {
        key: "playSkills",
        label: "Describe their play skills and preferred toys or leisure activities",
        type: "textarea",
        rows: 4,
      },
      {
        key: "otherPreferences",
        label: "What else do they prefer? (foods, people, places, sensory experiences)",
        type: "textarea",
        rows: 3,
      },
    ],
  },
  {
    id: "behaviours",
    title: "Defining the behaviours",
    description:
      "Help us picture exactly what the behaviour looks like, so we can recognise it during assessment.",
    questions: [
      {
        key: "problemBehavioursDescription",
        label: "What are the problem behaviours? What do they look like?",
        hint: "Describe what someone would actually see and hear.",
        type: "textarea",
        rows: 5,
      },
      {
        key: "topConcern",
        label: "What is the single most concerning behaviour?",
        type: "textarea",
        rows: 3,
      },
      {
        key: "topThreeConcerns",
        label: "What are the top three most concerning behaviours? Are there other behaviours you are worried about?",
        type: "textarea",
        rows: 5,
      },
    ],
  },
  {
    id: "safety",
    title: "Safety & precautions",
    questions: [
      {
        key: "intensityRange",
        label:
          "Describe the range of intensity of the behaviours and the extent to which they or others may be hurt or injured.",
        type: "textarea",
        rows: 5,
      },
      {
        key: "burstsAndPrecursors",
        label:
          "Do the behaviours occur in bursts or clusters? Does any behaviour typically come before another (e.g. yelling before hitting)?",
        type: "textarea",
        rows: 4,
      },
    ],
  },
  {
    id: "antecedents",
    title: "Triggers and conditions",
    description: "When and where the behaviours are most likely to happen.",
    questions: [
      {
        key: "conditionsMostLikely",
        label: "Under what conditions or situations are the behaviours most likely to occur?",
        type: "textarea",
        rows: 4,
      },
      {
        key: "activitiesTriggering",
        label: "Do the behaviours reliably occur during any particular activities?",
        type: "textarea",
        rows: 3,
      },
      {
        key: "specificTriggers",
        label: "What seems to trigger the behaviour?",
        type: "textarea",
        rows: 3,
      },
      {
        key: "routineInterruptions",
        label: "Does the behaviour occur when you break routines or interrupt activities? If so, describe.",
        type: "textarea",
        rows: 3,
      },
      {
        key: "notGettingTheirWay",
        label: "Does the behaviour occur when it appears they won't get their way? If so, describe.",
        type: "textarea",
        rows: 3,
      },
    ],
  },
  {
    id: "consequences",
    title: "How others respond",
    questions: [
      {
        key: "howYouRespond",
        label: "How do you and others react or respond to the problem behaviour?",
        type: "textarea",
        rows: 4,
      },
      {
        key: "calmingStrategies",
        label: "What do you and others do to calm them down once the problem behaviour has happened?",
        type: "textarea",
        rows: 4,
      },
      {
        key: "distractionStrategies",
        label: "What do you and others do to distract them from engaging in the problem behaviour?",
        type: "textarea",
        rows: 4,
      },
    ],
  },
  {
    id: "hypotheses",
    title: "Your hunches",
    description: "Your insight is invaluable — there are no wrong answers here.",
    questions: [
      {
        key: "communicating",
        label: "What do you think they are trying to communicate with their behaviour, if anything?",
        type: "textarea",
        rows: 4,
      },
      {
        key: "selfStimulation",
        label: "Do you think this behaviour is a form of self-stimulation? If so, what gives you that impression?",
        type: "textarea",
        rows: 4,
      },
      {
        key: "whyEngaging",
        label: "Why do you think they are engaging in the problem behaviour?",
        type: "textarea",
        rows: 4,
      },
    ],
  },
];

export const TOTAL_INTAKE_QUESTIONS = FBA_INTAKE_SECTIONS.reduce(
  (n, s) => n + s.questions.length,
  0,
);

export const calcCompletion = (responses: Record<string, string>) => {
  const filled = Object.values(responses ?? {}).filter((v) => (v ?? "").toString().trim().length > 0).length;
  return Math.round((filled / TOTAL_INTAKE_QUESTIONS) * 100);
};
