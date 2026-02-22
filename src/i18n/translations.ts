export type Language = "en" | "he";

export const translations = {
  en: {
    // Header
    nav: {
      services: "Services",
      education: "Education",
      therapy: "Therapy",
      families: "Families",
      organisations: "Organisations",
      supervision: "Supervision",
      bookConsultation: "Book a Consultation",
    },

    // Landing page
    landing: {
      title: "Welcome to Binyan",
      subtitle: "Constructional Behaviour Analysis for Education, Families, Therapy, and Organisations. Grounded in ethics. Driven by evidence. Built to last.",
      exploreServices: "Explore Services",
      logIn: "Log In",
      signUp: "Sign Up",
      quote: "We do not remove behaviour. We build capability.",
      quoteAuthor: "Adam Dayan, MSc",
    },

    // Services page
    services: {
      tagline: "What We Do",
      title: "Specialist Behavioural Services",
      subtitle: "Five distinct pathways of support, each designed with clarity, dignity, and measurable outcomes at the centre.",
      approachTagline: "Our Approach",
      approachTitle: "Constructional, Not Reductional",
      approachText: "We don't seek to suppress, control, or eliminate behaviour. Instead, we build new capabilities, skills, and repertoires that make meaningful change possible. Every intervention starts with understanding context and ends with measurable growth.",
      approachPoints: [
        "Build repertoires, don't suppress behaviour",
        "Behaviour as communication, not defiance",
        "System-wide thinking for sustainable change",
        "Ethical, evidence-based, and culturally sensitive",
      ],
      credentialsTagline: "Evidence & Credentials",
      credentialsTitle: "Grounded in Science. Led with Integrity.",
      credentials: [
        "UKBA (Cert) Registered",
        "15+ Years' Experience",
        "Senior Leadership Team Member",
        "MSc Applied Behaviour Analysis",
        "MEd Psychology of Education (candidate)",
        "UK-SBA & ACBS Member",
      ],
      ctaTitle: "Let's Start a Conversation",
      ctaText: "Whether you're a school, family, organisation, or practitioner — we're here to help build capability.",
      ctaButton: "Book a Consultation",
      quoteText: "We do not remove behaviour. We build capability.",
      quoteAuthor: "Adam Dayan, MSc",
      quoteRole: "UKBA (Cert) · Clinical Behaviour Analyst & Consultant",
      cards: {
        education: { title: "PBS in Education", description: "Whole-school behavioural culture built on clarity and dignity. From policy to practice." },
        therapy: { title: "Therapy", description: "Understanding behaviour through context, not blame. ACT-informed, constructional, and person-centred." },
        family: { title: "Family Support", description: "Support for families navigating complexity. Practical, personalised, and blame-free." },
        organisations: { title: "Organisations", description: "Behavioural science applied to systems. Culture change, governance, and performance." },
        supervision: { title: "Supervision", description: "Developing thoughtful, ethical practitioners. UKBA supervision, mentoring, and reflective practice." },
      },
      learnMore: "Learn more",
    },

    // Service page layout
    serviceLayout: {
      whatWeOffer: "What We Offer",
      packages: "Packages",
      packagesSubtitle: "Clear, structured support tailored to your needs. Every package includes measurable outcomes and a collaborative approach.",
      idealFor: "Ideal for:",
      readyTitle: "Ready to Begin?",
      readyText: "We do not remove behaviour. We build capability. Let's start with a conversation.",
    },

    // Offer detail page
    offerPage: {
      overview: "Overview",
      keyPoints: "Key Points",
      whoIsThisFor: "Who Is This For?",
      outcomes: "Expected Outcomes",
      ctaTitle: "Interested in This Service?",
      ctaText: "Get in touch to discuss how this service can support you.",
    },

    // Education page
    education: {
      title: "PBS in Education",
      subtitle: "Schools & Education Settings",
      tagline: "Whole-school behavioural culture built on clarity and dignity. From assessment to implementation, we build systems that sustain.",
      ctaText: "Request a School Assessment",
      services: [
        { name: "Whole-School PBS Framework Design", slug: "whole-school-pbs" },
        { name: "Behaviour Policy Development", slug: "behaviour-policy" },
        { name: "Functional Behaviour Assessment (FBA)", slug: "fba" },
        { name: "Individual Behaviour Support Plans", slug: "individual-support-plans" },
        { name: "Risk Assessment & Management Plans", slug: "risk-assessment" },
        { name: "Staff Training & CPD", slug: "staff-training" },
        { name: "Data-Driven Decision Systems", slug: "data-driven-decisions" },
        { name: "Multi-Disciplinary Collaboration", slug: "multi-disciplinary" },
        { name: "Behaviour Strategy for SLT", slug: "behaviour-strategy-slt" },
        { name: "Behaviour Culture Change Projects", slug: "culture-change" },
      ],
      packages: [
        {
          name: "Starter School Package",
          description: "An initial assessment to understand your school's behavioural landscape and identify priorities.",
          includes: ["Behavioural audit", "Staff consultation", "Priority report with recommendations"],
          ideal: "Schools exploring PBS for the first time",
        },
        {
          name: "Assessment & Strategic Roadmap",
          description: "Deep-dive assessment with a structured implementation roadmap aligned to your school's values.",
          includes: ["Comprehensive FBAs", "Staff survey & analysis", "Strategic roadmap document", "SLT briefing"],
          ideal: "Schools ready to commit to cultural change",
        },
        {
          name: "Full PBS Implementation",
          description: "End-to-end design and delivery of a whole-school PBS framework with ongoing support.",
          includes: ["Framework design", "Policy development", "Staff training programme", "Data systems", "Termly reviews"],
          ideal: "Schools seeking transformational, sustained change",
        },
        {
          name: "Ongoing Behaviour Leadership Partnership",
          description: "Retained advisory support for your leadership team with regular consultation and supervision.",
          includes: ["Monthly SLT consultations", "Case supervision", "Training updates", "Data review sessions"],
          ideal: "Schools maintaining and evolving their PBS culture",
        },
      ],
    },

    // Therapy page
    therapy: {
      title: "Understanding Behaviour Through Context, Not Blame",
      subtitle: "Therapy & Intervention",
      tagline: "ACT-informed, constructional, and person-centred. We help individuals build the skills and flexibility to live a values-driven life.",
      ctaText: "Book a Consultation",
      services: [
        { name: "ACT-Informed Therapy", slug: "act-therapy" },
        { name: "Constructional Behavioural Intervention", slug: "constructional-intervention" },
        { name: "Emotional Regulation Support", slug: "emotional-regulation" },
        { name: "Parent Coaching", slug: "parent-coaching" },
        { name: "Functional Communication Training", slug: "functional-communication" },
        { name: "Anxiety & Avoidance Patterns", slug: "anxiety-avoidance" },
        { name: "Values-Based Behaviour Building", slug: "values-based" },
        { name: "Trauma-Informed Behaviour Planning", slug: "trauma-informed" },
      ],
      packages: [
        {
          name: "Initial Behavioural Assessment",
          description: "A comprehensive assessment to understand the individual's context, needs, and strengths.",
          includes: ["Clinical interview", "Functional assessment", "Contextual analysis", "Written formulation & recommendations"],
          ideal: "Individuals or families seeking clarity before intervention",
        },
        {
          name: "Short-Term Focused Intervention",
          description: "A structured 8–12 week programme targeting specific behavioural goals.",
          includes: ["Weekly sessions", "Collaborative goal setting", "Skill building activities", "Progress reviews"],
          ideal: "Specific, focused concerns with clear goals",
        },
        {
          name: "Extended Therapeutic Partnership",
          description: "Longer-term support for complex or multi-layered needs.",
          includes: ["Flexible session schedule", "Ongoing formulation", "Multi-system coordination", "Regular outcome reviews"],
          ideal: "Complex presentations requiring sustained, adaptive support",
        },
        {
          name: "Parent Guidance Package",
          description: "Empowering parents with practical strategies grounded in behavioural science.",
          includes: ["Parent coaching sessions", "Contextual analysis at home", "Strategy development", "Follow-up support"],
          ideal: "Parents seeking evidence-based guidance and confidence",
        },
      ],
    },

    // Families page
    families: {
      title: "Support for Families Navigating Complexity",
      subtitle: "Family Support",
      tagline: "Practical, personalised, and blame-free. We help families build consistency, communication, and confidence at home.",
      ctaText: "Speak to Us",
      services: [
        { name: "Behavioural Assessment at Home", slug: "home-assessment" },
        { name: "Parent Strategy Coaching", slug: "parent-strategy" },
        { name: "Sibling Dynamics Support", slug: "sibling-dynamics" },
        { name: "Consistency Planning", slug: "consistency-planning" },
        { name: "Home-School Alignment", slug: "home-school-alignment" },
        { name: "Crisis Planning & De-Escalation Strategies", slug: "crisis-planning" },
      ],
      packages: [
        {
          name: "Clarity Session",
          description: "A single in-depth session to explore concerns, identify priorities, and map next steps.",
          includes: ["90-minute consultation", "Contextual discussion", "Written summary with next steps"],
          ideal: "Families wanting clarity before committing to a programme",
        },
        {
          name: "Home Behaviour Blueprint",
          description: "A structured assessment resulting in a tailored behaviour support plan for the home environment.",
          includes: ["Home observation", "Family interview", "Written behaviour plan", "Strategy coaching session"],
          ideal: "Families ready for a structured plan at home",
        },
        {
          name: "Family Support Programme",
          description: "A 6–10 week programme with regular coaching, strategy implementation, and progress reviews.",
          includes: ["Weekly coaching sessions", "Strategy development", "Home-school coordination", "Progress tracking"],
          ideal: "Families navigating ongoing or complex needs",
        },
        {
          name: "Ongoing Behaviour Coaching",
          description: "Retained support with flexible scheduling for families with evolving needs.",
          includes: ["Fortnightly sessions", "Responsive crisis support", "Plan adjustments", "Review meetings"],
          ideal: "Families seeking sustained, adaptive guidance",
        },
      ],
    },

    // Organisations page
    organisations: {
      title: "Behavioural Science Applied to Systems",
      subtitle: "Organisations & Leadership",
      tagline: "Evidence-based organisational behaviour management. We help leadership teams build culture, governance, and performance frameworks that work.",
      ctaText: "Request an Organisational Assessment",
      services: [
        { name: "Organisational Behaviour Management (OBM)", slug: "obm" },
        { name: "Behaviour Strategy Design", slug: "behaviour-strategy" },
        { name: "Culture Change Projects", slug: "culture-change" },
        { name: "Staff Performance Systems", slug: "staff-performance" },
        { name: "Risk Governance Frameworks", slug: "risk-governance" },
        { name: "Clinical Governance Structures", slug: "clinical-governance" },
        { name: "Safeguarding & Behaviour Audits", slug: "safeguarding-audits" },
        { name: "Behaviour Data Systems", slug: "behaviour-data" },
      ],
      packages: [
        {
          name: "Behaviour Systems Audit",
          description: "A thorough audit of your current behavioural systems, policies, and practices.",
          includes: ["Document review", "Staff interviews", "Observational assessment", "Audit report with recommendations"],
          ideal: "Organisations seeking an independent behavioural review",
        },
        {
          name: "Strategic Implementation Partnership",
          description: "A collaborative programme to design and implement behaviour-led systems across your organisation.",
          includes: ["Strategy co-design", "Policy development", "Staff training", "Implementation support", "Quarterly reviews"],
          ideal: "Organisations committing to systemic behavioural change",
        },
        {
          name: "Clinical Supervision Framework",
          description: "Design and embed a clinical supervision framework for your practitioner team.",
          includes: ["Framework design", "Supervisor training", "Documentation templates", "Quality assurance system"],
          ideal: "Care providers and clinical services",
        },
        {
          name: "Training & Accreditation Pathways",
          description: "Bespoke training programmes aligned to your organisation's needs and professional standards.",
          includes: ["Training needs analysis", "Programme design", "Delivery & assessment", "Accreditation guidance"],
          ideal: "Organisations investing in workforce development",
        },
      ],
    },

    // Supervision page
    supervision: {
      title: "Developing Thoughtful, Ethical Practitioners",
      subtitle: "Supervision & Development",
      tagline: "Reflective, rigorous, and values-aligned. Supporting behaviour analysts and practitioners to grow with clarity and integrity.",
      ctaText: "Apply for Supervision",
      services: [
        { name: "UKBA Supervision", slug: "ukba-supervision" },
        { name: "Case Formulation Supervision", slug: "case-formulation" },
        { name: "Constructional Approach Mentoring", slug: "constructional-mentoring" },
        { name: "ACT Integration Support", slug: "act-integration" },
        { name: "Ethical Consultation", slug: "ethical-consultation" },
        { name: "Practitioner Development Pathways", slug: "practitioner-development" },
        { name: "Reflective Practice Groups", slug: "reflective-practice" },
      ],
      packages: [
        {
          name: "Foundational Supervision",
          description: "Structured supervision for developing practitioners building core competencies.",
          includes: ["Monthly supervision sessions", "Case discussion", "Competency tracking", "Written feedback"],
          ideal: "Early-career practitioners and trainees",
        },
        {
          name: "Advanced Clinical Supervision",
          description: "In-depth clinical supervision for experienced practitioners managing complex caseloads.",
          includes: ["Fortnightly sessions", "Complex case formulation", "Ethical decision-making support", "Professional development planning"],
          ideal: "Experienced practitioners seeking clinical depth",
        },
        {
          name: "Leadership Supervision",
          description: "Supervision for clinical leaders managing teams and organisational behaviour strategy.",
          includes: ["Strategic supervision sessions", "Leadership reflection", "Team dynamics consultation", "Governance guidance"],
          ideal: "Clinical leads and service managers",
        },
        {
          name: "Group Supervision Circles",
          description: "Facilitated group supervision for peer learning and reflective practice.",
          includes: ["Monthly group sessions", "Structured reflection framework", "Peer case discussion", "Facilitated learning"],
          ideal: "Teams and peer groups seeking shared professional growth",
        },
      ],
    },

    // Contact page
    contact: {
      tagline: "Get in Touch",
      title: "Book a Consultation",
      subtitle: "Tell us a little about your needs and we'll respond within 48 hours. No obligation, no pressure — just a conversation about how we can help.",
      location: "Manchester, UK",
      nameLabel: "Name",
      namePlaceholder: "Your name",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      interestedLabel: "I'm interested in",
      selectService: "Select a service area",
      serviceOptions: ["PBS in Education", "Therapy", "Family Support", "Organisations", "Supervision", "Other"],
      messageLabel: "Message",
      messagePlaceholder: "Tell us a little about your situation and how we might help...",
      sendButton: "Send Message",
      sending: "Sending...",
      successTitle: "Message sent",
      successDescription: "We'll be in touch shortly.",
    },

    // Login page
    login: {
      title: "Log In",
      subtitle: "Welcome back to Binyan",
      emailLabel: "Email",
      passwordLabel: "Password",
      button: "Log In",
      loading: "Logging in…",
      noAccount: "Don't have an account?",
      signUpLink: "Sign Up",
    },

    // Signup page
    signup: {
      title: "Sign Up",
      subtitle: "Create your Binyan account",
      emailLabel: "Email",
      passwordLabel: "Password",
      button: "Sign Up",
      loading: "Creating account…",
      hasAccount: "Already have an account?",
      logInLink: "Log In",
      successTitle: "Check your email",
      successDescription: "We've sent you a confirmation link.",
    },

    // Footer
    footer: {
      description: "Clinical Behaviour Services. Building behavioural capability through constructional, ethical, and evidence-based practice. We do not remove behaviour. We build capability.",
      servicesTitle: "Services",
      contactTitle: "Contact",
      copyright: "Binyan Clinical Behaviour Services. All rights reserved.",
      links: {
        education: "PBS in Education",
        therapy: "Therapy",
        families: "Family Support",
        organisations: "Organisations",
        supervision: "Supervision",
        bookConsultation: "Book a Consultation",
      },
    },

    // Offer detail content
    offerDetails: {
      education: [
        {
          slug: "whole-school-pbs",
          title: "Whole-School PBS Framework Design",
          summary: "A comprehensive, values-driven framework that transforms school-wide behaviour culture from the ground up.",
          description: [
            "Positive Behaviour Support (PBS) at a whole-school level is about creating an environment where every pupil and staff member understands the shared expectations, values, and systems that guide behaviour. It's not about control — it's about building a culture of clarity and dignity.",
            "We work alongside your senior leadership team to design a bespoke PBS framework that reflects your school's identity, addresses your unique challenges, and creates sustainable systems for recognising and supporting positive behaviour.",
            "This process includes environmental audits, stakeholder consultation, tiered support design, and the creation of clear documentation that can guide practice across every classroom and corridor."
          ],
          keyPoints: [
            "Grounded in constructional behaviour analysis",
            "Designed with your school's values at the centre",
            "Covers universal, targeted, and intensive tiers",
            "Includes visual systems and environmental design",
            "Built for sustainability — not quick fixes"
          ],
          whoIsThisFor: [
            "Schools looking to replace punitive behaviour systems",
            "Schools in special measures or requiring improvement",
            "New schools establishing their behaviour culture",
            "Schools merging or undergoing significant change",
            "Senior leaders seeking a coherent behaviour vision"
          ],
          outcomes: [
            "A comprehensive PBS framework document",
            "Clear tiered support structure",
            "Aligned staff understanding and expectations",
            "Reduced exclusions and behavioural incidents",
            "Improved pupil wellbeing and engagement"
          ]
        },
        {
          slug: "behaviour-policy",
          title: "Behaviour Policy Development",
          summary: "Evidence-based behaviour policies that are practical, fair, and grounded in your school's values.",
          description: [
            "A strong behaviour policy doesn't sit in a drawer — it lives in every interaction, every corridor, and every classroom. We help schools develop behaviour policies that are clear, fair, and reflective of the principles they want to uphold.",
            "Our approach begins with understanding your current policy landscape and the lived experience of staff, pupils, and families. From there, we co-design a policy that is not only Ofsted-aligned but genuinely useful in everyday practice.",
            "Every policy we create includes guidance for implementation, staff training recommendations, and review cycles to ensure it evolves with your school."
          ],
          keyPoints: [
            "Rooted in ethical, constructional principles",
            "Co-designed with school leadership",
            "Practical and accessible language",
            "Aligned to statutory guidance",
            "Includes implementation support"
          ],
          whoIsThisFor: [
            "Schools reviewing or rewriting their behaviour policy",
            "Schools seeking Ofsted-ready documentation",
            "New headteachers establishing their vision",
            "MATs seeking consistency across schools"
          ],
          outcomes: [
            "A clear, values-driven behaviour policy",
            "Staff confidence in consistent application",
            "Improved parent and community understanding",
            "A framework for policy review and evolution"
          ]
        },
        {
          slug: "fba",
          title: "Functional Behaviour Assessment (FBA)",
          summary: "Understanding the function and context of behaviour to design interventions that actually work.",
          description: [
            "Functional Behaviour Assessment is the cornerstone of effective behavioural support. Rather than labelling behaviour as 'good' or 'bad', FBA seeks to understand why a behaviour occurs — what purpose it serves for the individual in their specific context.",
            "We conduct thorough FBAs using direct observation, structured interviews, and data collection to develop a clear picture of the environmental and contextual factors maintaining behaviour. This forms the foundation for intervention design.",
            "Our FBAs go beyond simple ABC charts. We consider setting events, motivational operations, skill deficits, and systemic factors that influence behaviour over time."
          ],
          keyPoints: [
            "Evidence-based assessment methodology",
            "Considers broad contextual factors",
            "Identifies function, not just form, of behaviour",
            "Directly informs intervention planning",
            "Respectful, non-blaming approach"
          ],
          whoIsThisFor: [
            "Schools supporting pupils with complex behaviour",
            "SENCOs seeking clarity on individual cases",
            "Families wanting to understand their child's behaviour",
            "Multi-agency teams requiring shared formulations"
          ],
          outcomes: [
            "A clear functional behaviour assessment report",
            "Understanding of behavioural function and context",
            "Targeted intervention recommendations",
            "A shared understanding across stakeholders"
          ]
        },
        {
          slug: "individual-support-plans",
          title: "Individual Behaviour Support Plans",
          summary: "Personalised behaviour support plans that build capability and promote dignity.",
          description: [
            "Every individual deserves support that is tailored to their unique strengths, needs, and context. Our behaviour support plans are built on thorough assessment and designed to be practical, respectful, and effective.",
            "We create plans that focus on skill building, environmental adjustments, and proactive strategies rather than reactive consequences. Each plan includes clear guidance for implementation and measurable outcomes.",
            "Plans are developed collaboratively with the individual (where appropriate), their family, and the professionals who support them daily."
          ],
          keyPoints: [
            "Person-centred and strengths-based",
            "Includes proactive and reactive strategies",
            "Measurable goals and review points",
            "Practical for daily implementation",
            "Collaborative development process"
          ],
          whoIsThisFor: [
            "Pupils with SEND and behavioural needs",
            "Individuals in residential or care settings",
            "Children and young people at risk of exclusion",
            "Families seeking structured support strategies"
          ],
          outcomes: [
            "A comprehensive, personalised behaviour support plan",
            "Clear strategies for all key settings",
            "Measurable behavioural goals",
            "Improved quality of life and engagement"
          ]
        },
        {
          slug: "risk-assessment",
          title: "Risk Assessment & Management Plans",
          summary: "Proportionate, dynamic risk assessments that prioritise safety and dignity.",
          description: [
            "Effective risk assessment balances safety with the individual's right to dignity, inclusion, and positive experience. We create dynamic risk assessments that are responsive to changing contexts and grounded in behavioural understanding.",
            "Our risk management plans include clear escalation procedures, de-escalation strategies, and environmental adjustments. They are designed to be practical tools — not bureaucratic documents that sit unused.",
            "We work closely with teams to ensure risk assessments are understood, implemented consistently, and reviewed regularly."
          ],
          keyPoints: [
            "Proportionate and rights-respecting",
            "Dynamic and regularly reviewed",
            "Includes de-escalation protocols",
            "Practical for frontline staff",
            "Legally and ethically sound"
          ],
          whoIsThisFor: [
            "Schools managing complex risk profiles",
            "Residential and care settings",
            "Services supporting individuals with challenging behaviour",
            "Teams requiring updated risk documentation"
          ],
          outcomes: [
            "Clear, proportionate risk assessment documentation",
            "Staff confidence in managing risk situations",
            "Reduced reliance on restrictive practices",
            "Safer environments for all"
          ]
        },
        {
          slug: "staff-training",
          title: "Staff Training & CPD",
          summary: "Practical, engaging professional development that transforms how staff understand and respond to behaviour.",
          description: [
            "Training is most effective when it changes how people think, not just what they do. Our CPD programmes are designed to equip staff with both the understanding and the practical skills to support behaviour constructionally.",
            "We offer bespoke training packages covering topics from PBS fundamentals to advanced FBA, from trauma-informed practice to de-escalation techniques. Every session is interactive, evidence-based, and tailored to your setting.",
            "We don't do death-by-PowerPoint. Our training uses real scenarios, collaborative exercises, and reflective discussions to embed lasting change."
          ],
          keyPoints: [
            "Interactive and evidence-based",
            "Tailored to your setting and needs",
            "Covers theory and practical application",
            "Supports ongoing professional development",
            "Can be delivered as single sessions or programmes"
          ],
          whoIsThisFor: [
            "Teaching and support staff at all levels",
            "Senior leadership teams",
            "NQTs and early-career teachers",
            "Multi-disciplinary teams",
            "Residential and care staff"
          ],
          outcomes: [
            "Increased staff confidence and competence",
            "Shared language and understanding of behaviour",
            "Practical strategies for immediate use",
            "CPD documentation and certificates"
          ]
        },
        {
          slug: "data-driven-decisions",
          title: "Data-Driven Decision Systems",
          summary: "Harnessing behavioural data to inform decisions, track outcomes, and demonstrate impact.",
          description: [
            "Good data drives good decisions. We help schools design and implement systems for collecting, analysing, and using behavioural data to guide strategy, allocate resources, and measure the impact of interventions.",
            "From choosing the right recording systems to building dashboards that make data accessible and meaningful, we support every step of the data journey. Our approach ensures that data serves people — not the other way around.",
            "We also support schools in using data for accountability, reporting to governors, and evidencing impact to Ofsted and other stakeholders."
          ],
          keyPoints: [
            "Practical data collection systems",
            "Meaningful analysis and reporting",
            "Supports strategic decision-making",
            "Evidence for accountability and reporting",
            "Accessible to non-specialists"
          ],
          whoIsThisFor: [
            "Schools wanting to use data more effectively",
            "Behaviour leads and SENCOs",
            "Senior leaders seeking evidence of impact",
            "Schools preparing for inspection"
          ],
          outcomes: [
            "A functioning behavioural data system",
            "Regular data reports and analysis",
            "Evidence-informed decision-making",
            "Demonstrable impact of behaviour strategies"
          ]
        },
        {
          slug: "multi-disciplinary",
          title: "Multi-Disciplinary Collaboration",
          summary: "Facilitating effective collaboration between professionals to deliver joined-up support.",
          description: [
            "Complex behaviour rarely has a single cause or a single solution. Effective support requires collaboration between educators, therapists, families, and external agencies — all working towards shared goals.",
            "We facilitate multi-disciplinary collaboration by providing a common behavioural framework, shared assessment tools, and structured processes for communication and joint planning.",
            "Whether you're coordinating an EHCP review, a TAC meeting, or a complex case conference, we can support the process with behavioural expertise and facilitation skills."
          ],
          keyPoints: [
            "Shared assessment and formulation frameworks",
            "Facilitated multi-agency meetings",
            "Common language across disciplines",
            "Coordinated intervention planning",
            "Focus on the individual at the centre"
          ],
          whoIsThisFor: [
            "Schools working with external agencies",
            "Multi-agency teams around a child or young person",
            "SENCOs coordinating complex support",
            "Local authorities and commissioning bodies"
          ],
          outcomes: [
            "Improved multi-agency communication",
            "Coordinated, coherent support plans",
            "Reduced duplication and contradiction",
            "Better outcomes for individuals and families"
          ]
        },
        {
          slug: "behaviour-strategy-slt",
          title: "Behaviour Strategy for SLT",
          summary: "Strategic behavioural leadership support for senior leadership teams driving whole-school change.",
          description: [
            "Senior leaders set the tone for behaviour culture. We provide strategic advisory support to help SLTs develop and implement a coherent behavioural vision that permeates every aspect of school life.",
            "This includes strategic planning sessions, governance briefings, data interpretation support, and ongoing consultation to ensure behaviour strategy remains aligned with school improvement priorities.",
            "We help leaders move beyond reactive crisis management to proactive, system-level thinking about behaviour."
          ],
          keyPoints: [
            "Strategic-level consultation",
            "Aligned to school improvement plans",
            "Governance and accountability support",
            "Data interpretation and reporting",
            "Proactive, not reactive, approach"
          ],
          whoIsThisFor: [
            "Headteachers and deputy headteachers",
            "SLT members responsible for behaviour",
            "Governing bodies seeking strategic oversight",
            "MAT leaders driving cross-school consistency"
          ],
          outcomes: [
            "A clear behavioural strategy aligned to school vision",
            "Confident, informed leadership on behaviour",
            "Effective governance reporting",
            "Sustained cultural improvement"
          ]
        },
        {
          slug: "culture-change",
          title: "Behaviour Culture Change Projects",
          summary: "Transformational projects that shift school culture from punitive to constructional, sustainably.",
          description: [
            "Culture change is the most ambitious and impactful work a school can undertake. It requires vision, commitment, and expert guidance to shift deeply embedded norms and practices.",
            "Our culture change projects are designed as multi-phase partnerships. We begin with an in-depth cultural audit, develop a shared vision with stakeholders, and guide implementation over terms and academic years.",
            "This is not about quick fixes. It's about building a school community where every interaction reflects the values of respect, dignity, and growth."
          ],
          keyPoints: [
            "Multi-phase, sustained partnership",
            "Begins with cultural audit and visioning",
            "Involves all stakeholders",
            "Measurable milestones and outcomes",
            "Supported by ongoing consultation"
          ],
          whoIsThisFor: [
            "Schools in crisis or requiring improvement",
            "Schools seeking transformational change",
            "New leadership teams establishing their vision",
            "MATs seeking to unify behaviour culture"
          ],
          outcomes: [
            "A transformed behaviour culture",
            "Reduced exclusions and incidents",
            "Improved staff wellbeing and retention",
            "A sustainable framework for ongoing development"
          ]
        }
      ],
      therapy: [
        {
          slug: "act-therapy",
          title: "ACT-Informed Therapy",
          summary: "Acceptance and Commitment Therapy that builds psychological flexibility and values-driven living.",
          description: [
            "ACT (Acceptance and Commitment Therapy) is a modern, evidence-based therapeutic approach that helps individuals develop psychological flexibility — the ability to be present, open to experience, and engaged in values-driven action.",
            "Rather than trying to eliminate difficult thoughts and feelings, ACT teaches skills for relating differently to internal experiences while taking committed action towards what matters most.",
            "Our ACT-informed approach is integrated with constructional behavioural principles, creating a uniquely powerful combination that addresses both the internal experience and the environmental context."
          ],
          keyPoints: [
            "Builds psychological flexibility",
            "Values-driven, not symptom-focused",
            "Strong evidence base across populations",
            "Integrated with behavioural principles",
            "Practical skills for everyday use"
          ],
          whoIsThisFor: [
            "Individuals experiencing anxiety or depression",
            "People struggling with avoidance patterns",
            "Those seeking greater meaning and direction",
            "Parents managing stress and overwhelm",
            "Professionals experiencing burnout"
          ],
          outcomes: [
            "Increased psychological flexibility",
            "Clearer connection to personal values",
            "Reduced impact of difficult thoughts and feelings",
            "Greater engagement in meaningful activities"
          ]
        },
        {
          slug: "constructional-intervention",
          title: "Constructional Behavioural Intervention",
          summary: "Building new skills and repertoires rather than suppressing existing behaviour.",
          description: [
            "Constructional intervention is the philosophical heart of our practice. Instead of asking 'how do we stop this behaviour?', we ask 'what skills does this person need to thrive?'",
            "This approach focuses on identifying and building the capabilities, skills, and environmental supports that make adaptive behaviour more likely. It respects the individual's autonomy and works with their existing strengths.",
            "Every intervention is designed to expand the person's repertoire — giving them more options, more skills, and more pathways to success."
          ],
          keyPoints: [
            "Builds capability rather than suppressing behaviour",
            "Respects individual autonomy and dignity",
            "Focuses on skill acquisition and environmental design",
            "Grounded in Applied Behaviour Analysis",
            "Ethical and evidence-based"
          ],
          whoIsThisFor: [
            "Individuals with learning disabilities",
            "Children and young people with SEND",
            "Anyone whose behaviour is seen as 'challenging'",
            "Families seeking a positive, non-punitive approach"
          ],
          outcomes: [
            "Expanded behavioural repertoire",
            "New functional skills",
            "Reduced need for restrictive practices",
            "Improved quality of life"
          ]
        },
        {
          slug: "emotional-regulation",
          title: "Emotional Regulation Support",
          summary: "Developing skills for understanding, managing, and expressing emotions effectively.",
          description: [
            "Emotional regulation is the ability to manage and respond to emotional experiences in adaptive ways. Difficulties with regulation can manifest as intense outbursts, withdrawal, anxiety, or rigid behaviour patterns.",
            "We take a contextual approach to emotional regulation, understanding that regulation happens within relationships and environments — not just within the individual. Our support combines skill teaching with environmental adjustments.",
            "We work with individuals and their support systems to develop personalised regulation strategies that are practical, accessible, and respectful of the person's experience."
          ],
          keyPoints: [
            "Contextual understanding of regulation",
            "Practical, teachable strategies",
            "Works with the whole support system",
            "Developmentally appropriate approaches",
            "Combines behavioural and therapeutic methods"
          ],
          whoIsThisFor: [
            "Children and young people with emotional difficulties",
            "Individuals with autism or ADHD",
            "People experiencing heightened anxiety",
            "Families wanting to support regulation at home"
          ],
          outcomes: [
            "Improved emotional awareness and vocabulary",
            "Practical regulation strategies",
            "Reduced intensity and frequency of dysregulation",
            "Greater participation in daily activities"
          ]
        },
        {
          slug: "parent-coaching",
          title: "Parent Coaching",
          summary: "Empowering parents with understanding, confidence, and practical behavioural strategies.",
          description: [
            "Parents are the most important people in their child's life — and the most powerful agents of change. Our parent coaching is designed to equip you with the understanding and strategies to support your child's behaviour effectively.",
            "We don't prescribe rigid programmes. Instead, we work collaboratively to understand your child's behaviour in context, identify what's working, and develop strategies that fit your family's values and routines.",
            "Coaching sessions are practical, supportive, and free from judgement. We believe every parent is doing their best, and our role is to help you feel more confident and effective."
          ],
          keyPoints: [
            "Collaborative and non-judgemental",
            "Tailored to your family's needs",
            "Evidence-based strategies",
            "Focuses on understanding, then action",
            "Ongoing support and adjustment"
          ],
          whoIsThisFor: [
            "Parents of children with behavioural needs",
            "Families navigating SEND diagnoses",
            "Parents feeling overwhelmed or uncertain",
            "Families wanting to build positive routines"
          ],
          outcomes: [
            "Increased parental confidence",
            "Practical strategies for home use",
            "Improved parent-child relationship",
            "Greater family harmony"
          ]
        },
        {
          slug: "functional-communication",
          title: "Functional Communication Training",
          summary: "Teaching communication skills that replace challenging behaviour with effective expression.",
          description: [
            "Many behaviours described as 'challenging' are, in fact, communication. When someone lacks the skills to express their needs, wants, or feelings verbally, they use the tools available to them — which may include behaviours that others find difficult.",
            "Functional Communication Training (FCT) identifies the communicative function of behaviour and teaches alternative, more effective ways to express the same message. It's one of the most well-evidenced interventions in behaviour analysis.",
            "We design FCT programmes that are practical, sustainable, and appropriate to the individual's developmental level and communication modality."
          ],
          keyPoints: [
            "Addresses the function of behaviour",
            "Teaches alternative communication skills",
            "Strong evidence base",
            "Appropriate across communication modalities",
            "Practical for everyday implementation"
          ],
          whoIsThisFor: [
            "Non-verbal or pre-verbal individuals",
            "Individuals with autism spectrum conditions",
            "People with learning disabilities",
            "Anyone whose behaviour serves a communicative function"
          ],
          outcomes: [
            "Effective alternative communication skills",
            "Reduction in challenging behaviour",
            "Improved social interaction",
            "Greater autonomy and self-expression"
          ]
        },
        {
          slug: "anxiety-avoidance",
          title: "Anxiety & Avoidance Patterns",
          summary: "Understanding and addressing anxiety-driven avoidance through contextual behavioural approaches.",
          description: [
            "Anxiety and avoidance often work together in a cycle that narrows a person's world. The more we avoid, the more our world shrinks — and the more anxiety grows. Breaking this cycle requires understanding, not force.",
            "Our approach combines ACT-informed methods with behavioural analysis to understand the specific contexts that trigger anxiety and the avoidance patterns that maintain it. We then build graduated, values-driven approaches to re-engagement.",
            "This is not about 'facing your fears' through sheer willpower. It's about building the skills and supports that make re-engagement possible and meaningful."
          ],
          keyPoints: [
            "Contextual understanding of anxiety",
            "Values-driven exposure and engagement",
            "ACT-informed psychological flexibility",
            "Graduated and compassionate approach",
            "Addresses both behaviour and experience"
          ],
          whoIsThisFor: [
            "Individuals with anxiety-driven school refusal",
            "People with specific phobias or generalised anxiety",
            "Those whose anxiety limits daily participation",
            "Families supporting an anxious child"
          ],
          outcomes: [
            "Increased engagement in avoided activities",
            "Practical anxiety management skills",
            "Greater psychological flexibility",
            "Expanded participation in valued activities"
          ]
        },
        {
          slug: "values-based",
          title: "Values-Based Behaviour Building",
          summary: "Helping individuals identify what matters and build behaviours aligned with their values.",
          description: [
            "When behaviour change is connected to what someone truly cares about, it becomes meaningful and sustainable. Values-based behaviour building starts with exploring what matters most and then creating pathways to live in alignment with those values.",
            "This approach moves beyond compliance and control, instead empowering individuals to make choices that reflect their authentic selves. It's applicable across age groups and settings.",
            "We use a combination of values exploration, committed action planning, and skill building to support individuals in living more fully aligned with what they care about."
          ],
          keyPoints: [
            "Grounded in personal values exploration",
            "Promotes autonomy and self-direction",
            "Applicable across age groups",
            "Integrates with ACT and behavioural approaches",
            "Focuses on meaningful, sustainable change"
          ],
          whoIsThisFor: [
            "Young people seeking direction and purpose",
            "Individuals feeling disconnected or stuck",
            "People in transition or facing life changes",
            "Anyone wanting to live more intentionally"
          ],
          outcomes: [
            "Clarity about personal values",
            "Increased values-aligned behaviour",
            "Greater sense of purpose and meaning",
            "Improved wellbeing and satisfaction"
          ]
        },
        {
          slug: "trauma-informed",
          title: "Trauma-Informed Behaviour Planning",
          summary: "Behaviour support that recognises and responds to the impact of trauma with sensitivity and skill.",
          description: [
            "Trauma can profoundly affect how individuals perceive, interpret, and respond to their environment. Behaviour that appears 'challenging' may be a survival response shaped by adverse experiences.",
            "Our trauma-informed approach ensures that behaviour planning always considers the potential impact of trauma, avoids re-traumatisation, and prioritises safety, trust, and empowerment.",
            "We integrate trauma-informed principles with constructional behaviour analysis to create support plans that are both compassionate and effective."
          ],
          keyPoints: [
            "Recognises trauma's impact on behaviour",
            "Prioritises safety and trust",
            "Avoids re-traumatisation",
            "Integrates with constructional approaches",
            "Empowers individuals in their own support"
          ],
          whoIsThisFor: [
            "Individuals with known or suspected trauma histories",
            "Children in care or with care experience",
            "Schools and settings supporting trauma-affected pupils",
            "Teams wanting to embed trauma-informed practice"
          ],
          outcomes: [
            "Behaviour plans that are trauma-sensitive",
            "Reduced risk of re-traumatisation",
            "Improved trust and therapeutic relationship",
            "More effective and sustainable support"
          ]
        }
      ],
      families: [
        {
          slug: "home-assessment",
          title: "Behavioural Assessment at Home",
          summary: "In-depth assessment in your home environment to understand behaviour in its natural context.",
          description: [
            "Behaviour doesn't happen in a vacuum — it happens within the rich, complex context of home life. A home-based assessment allows us to observe behaviour in the environment where it naturally occurs, giving us the most accurate understanding of what's happening and why.",
            "During a home assessment, we observe routines, interactions, environmental factors, and the broader family context. We combine observation with structured interviews to build a comprehensive picture.",
            "The outcome is a clear, practical formulation that explains behaviour in context and provides the foundation for effective, family-friendly support strategies."
          ],
          keyPoints: [
            "Assessment in the natural environment",
            "Observes real routines and interactions",
            "Combines observation and interview",
            "Non-judgemental and supportive",
            "Directly informs support strategies"
          ],
          whoIsThisFor: [
            "Families experiencing behavioural difficulties at home",
            "Parents seeking clarity about their child's needs",
            "Families preparing for professional assessments",
            "Multi-agency teams needing home context"
          ],
          outcomes: [
            "Clear understanding of behaviour in context",
            "Practical, actionable recommendations",
            "Foundation for a home behaviour support plan",
            "Shared understanding across the family"
          ]
        },
        {
          slug: "parent-strategy",
          title: "Parent Strategy Coaching",
          summary: "Targeted coaching to help parents develop and implement effective behavioural strategies at home.",
          description: [
            "Parent strategy coaching goes beyond general advice. We work with you to develop specific, practical strategies tailored to your child's needs and your family's context.",
            "Each coaching session focuses on understanding a particular challenge, developing a strategy, practising implementation, and reviewing progress. It's hands-on, practical, and responsive to your evolving needs.",
            "We believe parents are experts on their own children. Our role is to bring behavioural science knowledge and help you apply it in ways that work for your family."
          ],
          keyPoints: [
            "Specific, practical strategy development",
            "Collaborative and empowering",
            "Responsive to your family's needs",
            "Evidence-based approaches",
            "Ongoing review and adjustment"
          ],
          whoIsThisFor: [
            "Parents wanting practical strategies for specific behaviours",
            "Families who have had assessments but need implementation support",
            "Parents of children with SEND",
            "Any parent seeking confidence in managing behaviour"
          ],
          outcomes: [
            "A repertoire of practical strategies",
            "Increased parental confidence",
            "Improved child behaviour at home",
            "Stronger parent-child relationships"
          ]
        },
        {
          slug: "sibling-dynamics",
          title: "Sibling Dynamics Support",
          summary: "Supporting families to navigate the complex dynamics between siblings, especially where one child has additional needs.",
          description: [
            "When one child in a family has significant behavioural needs, sibling relationships can become strained. Brothers and sisters may feel overlooked, confused, or resentful — and these dynamics can amplify behavioural difficulties across the family.",
            "We help families understand and address sibling dynamics with sensitivity and practical strategies. This includes supporting siblings to understand their brother or sister's needs, addressing jealousy or frustration, and creating family routines that work for everyone.",
            "Our approach is family-centred, recognising that the wellbeing of each family member matters."
          ],
          keyPoints: [
            "Addresses the whole family system",
            "Supports siblings' emotional needs",
            "Practical strategies for family routines",
            "Reduces conflict and resentment",
            "Promotes positive sibling relationships"
          ],
          whoIsThisFor: [
            "Families where one child has SEND or behavioural needs",
            "Families experiencing sibling conflict",
            "Parents concerned about the impact on other children",
            "Families wanting to strengthen sibling bonds"
          ],
          outcomes: [
            "Improved sibling relationships",
            "Reduced family conflict",
            "Better understanding across the family",
            "Practical routines that work for everyone"
          ]
        },
        {
          slug: "consistency-planning",
          title: "Consistency Planning",
          summary: "Creating consistent, predictable routines and responses that support positive behaviour.",
          description: [
            "Consistency is one of the most powerful tools in behaviour support — and one of the hardest to maintain. When adults respond predictably and routines are clear, children feel safer and more able to engage positively.",
            "We help families develop consistency plans that cover daily routines, behavioural expectations, consequences, and communication between caregivers. We also address common barriers to consistency — tiredness, disagreements, and changing circumstances.",
            "A good consistency plan isn't rigid. It's a flexible framework that provides structure while accommodating the realities of family life."
          ],
          keyPoints: [
            "Clear, practical routines and expectations",
            "Aligned responses across caregivers",
            "Flexible and realistic for family life",
            "Addresses common barriers to consistency",
            "Regular review and adjustment"
          ],
          whoIsThisFor: [
            "Families struggling with inconsistent responses",
            "Separated families needing alignment",
            "Families with multiple caregivers",
            "Parents wanting structure without rigidity"
          ],
          outcomes: [
            "Clear, shared expectations at home",
            "Aligned adult responses to behaviour",
            "Reduced confusion and conflict",
            "More predictable, calmer home environment"
          ]
        },
        {
          slug: "home-school-alignment",
          title: "Home-School Alignment",
          summary: "Bridging the gap between home and school to create consistent support across settings.",
          description: [
            "Children move between home and school every day — and when the expectations, language, and strategies differ significantly between settings, it can create confusion and stress.",
            "We work with families and schools together to align approaches, share information effectively, and create consistency across the child's day. This might involve attending meetings, facilitating communication systems, or co-designing shared strategies.",
            "Effective home-school alignment means the child experiences coherent support wherever they are."
          ],
          keyPoints: [
            "Bridges home and school approaches",
            "Facilitates effective communication",
            "Creates shared strategies and language",
            "Supports collaborative relationships",
            "Puts the child at the centre"
          ],
          whoIsThisFor: [
            "Families feeling disconnected from their child's school",
            "Schools seeking better family engagement",
            "Children experiencing inconsistency across settings",
            "Multi-agency teams needing coherent support"
          ],
          outcomes: [
            "Aligned approaches across home and school",
            "Improved communication and trust",
            "More consistent experience for the child",
            "Stronger home-school partnership"
          ]
        },
        {
          slug: "crisis-planning",
          title: "Crisis Planning & De-Escalation Strategies",
          summary: "Preparing families with clear, calm strategies for managing crisis situations safely.",
          description: [
            "Crises happen. When they do, having a clear plan can make the difference between escalation and resolution. Our crisis planning helps families prepare for difficult moments with confidence and clarity.",
            "We develop personalised crisis plans that include early warning signs, de-escalation strategies, safety considerations, and recovery protocols. Plans are practical, accessible, and designed to be used in the moment.",
            "De-escalation is a skill that can be learned. We teach specific techniques grounded in behavioural science and trauma-informed practice that help reduce intensity and restore safety."
          ],
          keyPoints: [
            "Personalised crisis planning",
            "Practical de-escalation techniques",
            "Includes early warning identification",
            "Safety-focused and trauma-informed",
            "Recovery and reflection protocols"
          ],
          whoIsThisFor: [
            "Families managing frequent or intense behavioural crises",
            "Parents feeling unsafe or overwhelmed during incidents",
            "Families with risk management plans in place",
            "Carers of individuals with complex needs"
          ],
          outcomes: [
            "A clear, personalised crisis plan",
            "Confidence in de-escalation techniques",
            "Reduced duration and intensity of crises",
            "Improved safety for the whole family"
          ]
        }
      ],
      organisations: [
        {
          slug: "obm",
          title: "Organisational Behaviour Management (OBM)",
          summary: "Applying the science of behaviour to improve organisational performance, culture, and wellbeing.",
          description: [
            "Organisational Behaviour Management (OBM) applies the principles of behaviour analysis to improve how organisations function. It's a data-driven, systems-level approach to creating environments where people perform at their best.",
            "We help organisations understand the behavioural drivers behind performance, engagement, and culture. By analysing antecedents, consequences, and systems, we identify the levers that create meaningful, sustainable change.",
            "OBM is not about controlling people. It's about designing systems and environments that support people to do their best work."
          ],
          keyPoints: [
            "Evidence-based approach to organisational performance",
            "Data-driven analysis and intervention",
            "Systems-level thinking",
            "Improves both performance and wellbeing",
            "Sustainable, not quick-fix"
          ],
          whoIsThisFor: [
            "Organisations seeking performance improvement",
            "Leadership teams wanting to understand workforce behaviour",
            "HR and people teams",
            "Services undergoing transformation"
          ],
          outcomes: [
            "Improved organisational performance metrics",
            "Better understanding of behavioural drivers",
            "Data-informed decision-making",
            "Sustainable cultural improvement"
          ]
        },
        {
          slug: "behaviour-strategy",
          title: "Behaviour Strategy Design",
          summary: "Co-designing organisational behaviour strategies that align with your mission and deliver measurable results.",
          description: [
            "A behaviour strategy gives your organisation a coherent, evidence-based approach to managing and supporting behaviour at every level. We co-design strategies that reflect your organisation's values, context, and objectives.",
            "Our process includes stakeholder consultation, environmental analysis, and strategy co-design workshops. The resulting strategy document provides clear guidance for policy, practice, training, and monitoring.",
            "A good strategy doesn't just sit on a shelf. We help you build implementation plans that bring it to life."
          ],
          keyPoints: [
            "Co-designed with your leadership team",
            "Reflects organisational values and context",
            "Covers policy, practice, training, and monitoring",
            "Includes implementation planning",
            "Measurable outcomes and review points"
          ],
          whoIsThisFor: [
            "Organisations lacking a coherent behaviour approach",
            "Services undergoing transformation or growth",
            "Leadership teams seeking strategic clarity",
            "MATs and large organisations needing consistency"
          ],
          outcomes: [
            "A comprehensive behaviour strategy document",
            "Clear implementation roadmap",
            "Aligned organisational approach to behaviour",
            "Measurable outcomes framework"
          ]
        },
        {
          slug: "culture-change",
          title: "Culture Change Projects",
          summary: "Sustained, evidence-based projects that shift organisational culture from reactive to constructional.",
          description: [
            "Organisational culture is the sum of thousands of daily interactions, decisions, and habits. Changing culture requires sustained effort, clear vision, and expert guidance.",
            "Our culture change projects are designed as long-term partnerships. We work alongside your leadership team to understand your current culture, define your aspirational culture, and build the bridge between the two.",
            "This involves staff engagement, training programmes, policy development, and ongoing consultation. We measure progress through culture indicators and regular reviews."
          ],
          keyPoints: [
            "Long-term, sustained partnership",
            "Evidence-based culture assessment",
            "Involves all levels of the organisation",
            "Measurable culture indicators",
            "Ongoing support and adaptation"
          ],
          whoIsThisFor: [
            "Organisations in crisis or facing regulatory pressure",
            "Services wanting to shift from punitive to constructional approaches",
            "Growing organisations building their culture from scratch",
            "Leadership teams committed to lasting change"
          ],
          outcomes: [
            "Measurable culture shift",
            "Improved staff satisfaction and retention",
            "Better outcomes for service users",
            "A sustainable framework for ongoing cultural development"
          ]
        },
        {
          slug: "staff-performance",
          title: "Staff Performance Systems",
          summary: "Designing systems that support, motivate, and develop staff performance through behavioural science.",
          description: [
            "Traditional performance management often relies on annual reviews and punitive measures. Behavioural science tells us there are far more effective ways to support and develop staff performance.",
            "We help organisations design performance systems that include clear expectations, regular feedback, meaningful recognition, and supportive accountability. These systems are designed to bring out the best in people.",
            "Our approach is based on the evidence: positive reinforcement, clear antecedent arrangements, and data-informed feedback are the most effective drivers of sustained performance."
          ],
          keyPoints: [
            "Based on behavioural science principles",
            "Positive reinforcement-focused",
            "Clear expectations and feedback systems",
            "Data-informed performance monitoring",
            "Supports development, not just compliance"
          ],
          whoIsThisFor: [
            "Organisations reviewing their performance management",
            "HR teams seeking evidence-based approaches",
            "Managers wanting to improve team performance",
            "Services struggling with staff engagement"
          ],
          outcomes: [
            "A modern, evidence-based performance system",
            "Improved staff engagement and motivation",
            "Clear feedback and recognition structures",
            "Better retention and development"
          ]
        },
        {
          slug: "risk-governance",
          title: "Risk Governance Frameworks",
          summary: "Building robust governance frameworks for managing behavioural risk across your organisation.",
          description: [
            "Effective risk governance ensures that behavioural risk is identified, assessed, managed, and monitored at every level of your organisation. It provides assurance to leadership, regulators, and stakeholders.",
            "We help organisations design risk governance frameworks that are proportionate, practical, and embedded in daily operations. This includes risk policies, assessment tools, reporting structures, and escalation procedures.",
            "Good risk governance is not about avoiding all risk — it's about managing risk intelligently while maintaining dignity and inclusion."
          ],
          keyPoints: [
            "Comprehensive governance structures",
            "Proportionate and practical",
            "Embedded in daily operations",
            "Meets regulatory requirements",
            "Balances safety with dignity and inclusion"
          ],
          whoIsThisFor: [
            "Services managing behavioural risk daily",
            "Organisations preparing for inspection or audit",
            "Leadership teams needing governance assurance",
            "Services supporting individuals with complex needs"
          ],
          outcomes: [
            "A robust risk governance framework",
            "Clear reporting and escalation structures",
            "Regulatory confidence",
            "Improved safety and quality"
          ]
        },
        {
          slug: "clinical-governance",
          title: "Clinical Governance Structures",
          summary: "Establishing clinical governance that ensures quality, safety, and ethical practice across your service.",
          description: [
            "Clinical governance is the framework through which organisations ensure the quality and safety of clinical practice. For behavioural services, this includes supervision structures, outcome monitoring, ethical review processes, and quality assurance.",
            "We help organisations design and implement clinical governance structures that are robust, practical, and supportive of professional development. Good governance protects both service users and practitioners.",
            "Our approach is informed by best practice in healthcare governance, adapted for behavioural and educational settings."
          ],
          keyPoints: [
            "Comprehensive clinical governance design",
            "Supervision and quality assurance structures",
            "Ethical review and decision-making processes",
            "Outcome monitoring and reporting",
            "Professional development integration"
          ],
          whoIsThisFor: [
            "Care providers and clinical services",
            "Organisations with practitioner teams",
            "Services establishing new governance structures",
            "Organisations reviewing existing governance"
          ],
          outcomes: [
            "A functioning clinical governance framework",
            "Clear supervision and quality structures",
            "Ethical practice assurance",
            "Improved clinical outcomes and accountability"
          ]
        },
        {
          slug: "safeguarding-audits",
          title: "Safeguarding & Behaviour Audits",
          summary: "Independent audits that assess the quality and safety of your behavioural practices and safeguarding systems.",
          description: [
            "Regular auditing is essential for maintaining quality and identifying areas for improvement. Our behavioural and safeguarding audits provide an independent, expert assessment of your current practices.",
            "We review documentation, observe practice, interview staff and stakeholders, and benchmark against best practice standards. The resulting audit report provides clear findings, priorities, and recommendations.",
            "Audits can be conducted as one-off assessments or as part of an ongoing quality assurance programme."
          ],
          keyPoints: [
            "Independent, expert assessment",
            "Covers documentation, practice, and systems",
            "Benchmarked against best practice",
            "Clear findings and recommendations",
            "Can be one-off or ongoing"
          ],
          whoIsThisFor: [
            "Organisations preparing for inspection",
            "Services wanting independent quality assurance",
            "Leadership teams seeking improvement priorities",
            "Organisations responding to safeguarding concerns"
          ],
          outcomes: [
            "Comprehensive audit report",
            "Clear priorities for improvement",
            "Evidence for regulatory compliance",
            "A baseline for ongoing quality monitoring"
          ]
        },
        {
          slug: "behaviour-data",
          title: "Behaviour Data Systems",
          summary: "Designing and implementing systems for collecting, analysing, and using behavioural data effectively.",
          description: [
            "Data is only valuable if it's collected well, analysed meaningfully, and used to drive decisions. We help organisations design and implement behavioural data systems that do all three.",
            "From incident recording to outcome tracking, from staff surveys to service user feedback, we help you build systems that capture what matters and present it in ways that inform action.",
            "We support the full data journey — system design, staff training, analysis protocols, and reporting structures."
          ],
          keyPoints: [
            "Practical, purpose-driven data systems",
            "Covers collection, analysis, and reporting",
            "Staff training in data use",
            "Supports evidence-based decision-making",
            "Customised to your organisation's needs"
          ],
          whoIsThisFor: [
            "Organisations wanting to improve data quality",
            "Services needing outcome evidence",
            "Leadership teams seeking data-informed decisions",
            "Quality assurance and governance teams"
          ],
          outcomes: [
            "A functioning behavioural data system",
            "Meaningful reports and analysis",
            "Staff confidence in data use",
            "Evidence-informed service improvement"
          ]
        }
      ],
      supervision: [
        {
          slug: "ukba-supervision",
          title: "UKBA Supervision",
          summary: "Structured supervision meeting UKBA requirements for registration and continuing professional development.",
          description: [
            "UKBA supervision is a requirement for practitioners seeking or maintaining registration with the UK Board of Applied Behaviour Analysts. Our supervision meets all UKBA standards and provides the structure and support needed for professional development.",
            "Supervision sessions cover casework discussion, ethical reasoning, professional development planning, and competency assessment. We provide regular written feedback and documentation to support your registration portfolio.",
            "Our approach to supervision is collaborative, reflective, and constructional — we build your capabilities as a practitioner, not just assess them."
          ],
          keyPoints: [
            "Meets UKBA supervision requirements",
            "Structured competency development",
            "Regular written feedback",
            "Supports registration portfolio",
            "Reflective and constructional approach"
          ],
          whoIsThisFor: [
            "Practitioners seeking UKBA registration",
            "Registered practitioners maintaining CPD",
            "Trainees on supervised practice pathways",
            "Professionals transitioning to behaviour analysis"
          ],
          outcomes: [
            "UKBA-compliant supervision documentation",
            "Progressive competency development",
            "Support for registration applications",
            "Professional growth and confidence"
          ]
        },
        {
          slug: "case-formulation",
          title: "Case Formulation Supervision",
          summary: "Deep-dive supervision focused on developing sophisticated case formulation skills.",
          description: [
            "Case formulation is the art and science of understanding an individual's behaviour within their full context. It goes beyond simple functional analysis to consider setting events, learning history, systemic factors, and motivational operations.",
            "In case formulation supervision, we work together to develop increasingly sophisticated formulations that lead to more effective, nuanced interventions. This is about developing your clinical thinking, not just solving individual cases.",
            "We use real case material (with appropriate consents) to practice formulation skills, test hypotheses, and refine approaches."
          ],
          keyPoints: [
            "Develops advanced formulation skills",
            "Uses real case material",
            "Considers broad contextual factors",
            "Improves clinical reasoning",
            "Directly enhances practice quality"
          ],
          whoIsThisFor: [
            "Practitioners wanting to deepen their formulation skills",
            "Behaviour analysts working with complex cases",
            "Clinicians transitioning to constructional approaches",
            "Supervisees seeking more than routine case review"
          ],
          outcomes: [
            "More sophisticated case formulations",
            "Improved intervention effectiveness",
            "Enhanced clinical reasoning skills",
            "Greater confidence with complex cases"
          ]
        },
        {
          slug: "constructional-mentoring",
          title: "Constructional Approach Mentoring",
          summary: "Dedicated mentoring for practitioners learning to apply constructional principles in their practice.",
          description: [
            "The constructional approach represents a paradigm shift in how we think about and respond to behaviour. Moving from eliminative to constructional thinking requires guidance, practice, and support.",
            "Our mentoring programme is designed for practitioners who want to embed constructional principles in their daily practice. We work through real cases, explore the philosophical foundations, and develop practical skills for implementation.",
            "Mentoring is more than supervision — it's a developmental partnership focused on transforming how you think about behaviour and intervention."
          ],
          keyPoints: [
            "Focused on constructional philosophy and practice",
            "Developmental partnership approach",
            "Real-case application",
            "Philosophical depth with practical skills",
            "Transforms practice orientation"
          ],
          whoIsThisFor: [
            "Practitioners new to constructional approaches",
            "Experienced analysts seeking philosophical development",
            "Teams transitioning from eliminative to constructional practice",
            "Anyone wanting to deepen their ethical practice"
          ],
          outcomes: [
            "Deep understanding of constructional principles",
            "Ability to apply constructional approaches in practice",
            "Transformed professional orientation",
            "Enhanced ethical practice"
          ]
        },
        {
          slug: "act-integration",
          title: "ACT Integration Support",
          summary: "Supporting practitioners to integrate Acceptance and Commitment Therapy into their behavioural practice.",
          description: [
            "ACT and Applied Behaviour Analysis share deep roots in behavioural science, but integrating them in practice requires skill and understanding. We support practitioners to bring ACT principles and processes into their existing practice.",
            "This includes understanding the ACT hexaflex, applying ACT processes in clinical work, and integrating ACT with functional analysis and constructional intervention design.",
            "Whether you're new to ACT or looking to deepen your integration, we provide structured support tailored to your development level."
          ],
          keyPoints: [
            "Bridges ACT and ABA practice",
            "Structured integration support",
            "Practical application focus",
            "Tailored to your development level",
            "Enhances therapeutic repertoire"
          ],
          whoIsThisFor: [
            "Behaviour analysts wanting to use ACT",
            "ACT practitioners wanting to strengthen behavioural foundations",
            "Clinicians seeking integrated approaches",
            "Practitioners wanting to add therapeutic depth"
          ],
          outcomes: [
            "Confident ACT integration in practice",
            "Expanded therapeutic repertoire",
            "Enhanced client outcomes",
            "Professional development in an emerging field"
          ]
        },
        {
          slug: "ethical-consultation",
          title: "Ethical Consultation",
          summary: "Expert consultation on ethical dilemmas, complex decisions, and values-aligned practice.",
          description: [
            "Ethical practice isn't always straightforward. Complex cases, competing demands, and systemic pressures can create genuine dilemmas that require careful, informed reasoning.",
            "Our ethical consultation service provides a confidential space to explore ethical dilemmas, test decision-making processes, and develop robust reasoning. We draw on professional codes, philosophical frameworks, and practical wisdom.",
            "We can support individual practitioners, teams, or organisations with ethical consultations on specific cases or broader practice issues."
          ],
          keyPoints: [
            "Confidential ethical reasoning support",
            "Drawing on professional codes and frameworks",
            "Individual or team consultation",
            "Supports complex decision-making",
            "Strengthens ethical practice culture"
          ],
          whoIsThisFor: [
            "Practitioners facing ethical dilemmas",
            "Teams managing complex, multi-stakeholder situations",
            "Organisations reviewing ethical practices",
            "Professionals wanting to strengthen their ethical reasoning"
          ],
          outcomes: [
            "Clear ethical reasoning for complex situations",
            "Improved decision-making confidence",
            "Strengthened professional integrity",
            "Documentation support for ethical decisions"
          ]
        },
        {
          slug: "practitioner-development",
          title: "Practitioner Development Pathways",
          summary: "Structured development programmes that guide practitioners from foundational skills to advanced practice.",
          description: [
            "Professional development in behaviour analysis is a journey. Our development pathways provide structured support at every stage — from foundational training through to advanced, specialist practice.",
            "We design individualised development plans that include supervision, training, mentoring, and experiential learning. Pathways are aligned to professional standards and your career aspirations.",
            "Whether you're just starting out or leading a team, we can design a development pathway that supports your growth."
          ],
          keyPoints: [
            "Structured, individualised development",
            "Aligned to professional standards",
            "Covers all career stages",
            "Combines supervision, training, and mentoring",
            "Supports career progression"
          ],
          whoIsThisFor: [
            "Early-career behaviour practitioners",
            "Mid-career professionals seeking advancement",
            "Organisations designing staff development programmes",
            "Teams wanting structured professional growth"
          ],
          outcomes: [
            "A personalised development plan",
            "Progressive skill and competency growth",
            "Career progression support",
            "Professional confidence and identity"
          ]
        },
        {
          slug: "reflective-practice",
          title: "Reflective Practice Groups",
          summary: "Facilitated group sessions that foster peer learning, reflection, and shared professional growth.",
          description: [
            "Reflective practice is essential for maintaining quality, preventing burnout, and continuing to grow as a professional. Our reflective practice groups provide a structured, facilitated space for peer learning and reflection.",
            "Groups follow a structured framework that includes case presentation, guided reflection, peer feedback, and action planning. The facilitation ensures safety, equity, and depth.",
            "Groups can be arranged for existing teams or cross-organisational cohorts. They run on a regular cycle to build trust, depth, and ongoing development."
          ],
          keyPoints: [
            "Structured facilitation framework",
            "Peer learning and support",
            "Regular, ongoing sessions",
            "Builds reflective capacity",
            "Prevents isolation and burnout"
          ],
          whoIsThisFor: [
            "Practitioner teams in behavioural services",
            "Isolated practitioners seeking peer connection",
            "Teams wanting structured reflection time",
            "Organisations investing in staff wellbeing"
          ],
          outcomes: [
            "Enhanced reflective practice skills",
            "Stronger peer support networks",
            "Improved practice quality",
            "Reduced professional isolation and burnout"
          ]
        }
      ]
    },
  },

  he: {
    // Header
    nav: {
      services: "שירותים",
      education: "חינוך",
      therapy: "טיפול",
      families: "משפחות",
      organisations: "ארגונים",
      supervision: "הנחיה",
      bookConsultation: "קביעת ייעוץ",
    },

    // Landing page
    landing: {
      title: "ברוכים הבאים לבניין",
      subtitle: "ניתוח התנהגות קונסטרוקציוני לחינוך, משפחות, טיפול וארגונים. מבוסס אתיקה. מונע על ידי ראיות. בנוי להחזיק מעמד.",
      exploreServices: "גלו את השירותים",
      logIn: "התחברות",
      signUp: "הרשמה",
      quote: "״אנחנו לא מסירים התנהגות. אנחנו בונים יכולת.״",
      quoteAuthor: "אדם דיין, MSc",
    },

    // Services page
    services: {
      tagline: "מה אנחנו עושים",
      title: "שירותי התנהגות מתמחים",
      subtitle: "חמישה מסלולי תמיכה ייחודיים, כל אחד מעוצב עם בהירות, כבוד ותוצאות מדידות במרכז.",
      approachTagline: "הגישה שלנו",
      approachTitle: "קונסטרוקציונית, לא רדוקציונית",
      approachText: "אנחנו לא מבקשים לדכא, לשלוט או לבטל התנהגות. במקום זאת, אנחנו בונים יכולות חדשות, מיומנויות ורפרטוארים שמאפשרים שינוי משמעותי. כל התערבות מתחילה בהבנת ההקשר ומסתיימת בצמיחה מדידה.",
      approachPoints: [
        "בניית רפרטוארים, לא דיכוי התנהגות",
        "התנהגות כתקשורת, לא כהתרסה",
        "חשיבה מערכתית לשינוי בר-קיימא",
        "אתי, מבוסס ראיות ורגיש תרבותית",
      ],
      credentialsTagline: "ראיות והסמכות",
      credentialsTitle: "מבוססים במדע. מובלים ביושרה.",
      credentials: [
        "רישום UKBA (Cert)",
        "15+ שנות ניסיון",
        "חבר צוות הנהגה בכיר",
        "MSc ניתוח התנהגות שימושי",
        "MEd פסיכולוגיה של חינוך (מועמד)",
        "חבר UK-SBA ו-ACBS",
      ],
      ctaTitle: "בואו נתחיל שיחה",
      ctaText: "בין אם אתם בית ספר, משפחה, ארגון או מטפל — אנחנו כאן לעזור לבנות יכולת.",
      ctaButton: "קביעת ייעוץ",
      quoteText: "״אנחנו לא מסירים התנהגות. אנחנו בונים יכולת.״",
      quoteAuthor: "אדם דיין, MSc",
      quoteRole: "UKBA (Cert) · מנתח התנהגות קליני ויועץ",
      cards: {
        education: { title: "PBS בחינוך", description: "תרבות התנהגותית בית-ספרית בנויה על בהירות וכבוד. ממדיניות לפרקטיקה." },
        therapy: { title: "טיפול", description: "הבנת התנהגות דרך הקשר, לא האשמה. מבוסס ACT, קונסטרוקציוני וממוקד באדם." },
        family: { title: "תמיכה משפחתית", description: "תמיכה למשפחות שמנווטות מורכבות. מעשית, מותאמת אישית וללא האשמה." },
        organisations: { title: "ארגונים", description: "מדע ההתנהגות מיושם למערכות. שינוי תרבותי, ממשל וביצועים." },
        supervision: { title: "הנחיה", description: "פיתוח מטפלים מתחשבים ואתיים. הנחיית UKBA, חונכות ופרקטיקה רפלקטיבית." },
      },
      learnMore: "למידע נוסף",
    },

    // Service page layout
    serviceLayout: {
      whatWeOffer: "מה אנחנו מציעים",
      packages: "חבילות",
      packagesSubtitle: "תמיכה ברורה ומובנית המותאמת לצרכים שלכם. כל חבילה כוללת תוצאות מדידות וגישה שיתופית.",
      idealFor: "אידיאלי עבור:",
      readyTitle: "מוכנים להתחיל?",
      readyText: "אנחנו לא מסירים התנהגות. אנחנו בונים יכולת. בואו נתחיל עם שיחה.",
    },

    // Offer detail page
    offerPage: {
      overview: "סקירה כללית",
      keyPoints: "נקודות מפתח",
      whoIsThisFor: "למי זה מתאים?",
      outcomes: "תוצאות צפויות",
      ctaTitle: "מתעניינים בשירות זה?",
      ctaText: "צרו קשר כדי לדון כיצד שירות זה יכול לתמוך בכם.",
    },

    // Education page
    education: {
      title: "PBS בחינוך",
      subtitle: "בתי ספר ומסגרות חינוכיות",
      tagline: "תרבות התנהגותית בית-ספרית בנויה על בהירות וכבוד. מהערכה ליישום, אנחנו בונים מערכות שמחזיקות מעמד.",
      ctaText: "בקשת הערכה בית-ספרית",
      services: [
        { name: "עיצוב מסגרת PBS בית-ספרית", slug: "whole-school-pbs" },
        { name: "פיתוח מדיניות התנהגות", slug: "behaviour-policy" },
        { name: "הערכת התנהגות פונקציונלית (FBA)", slug: "fba" },
        { name: "תוכניות תמיכה התנהגותית אישיות", slug: "individual-support-plans" },
        { name: "תוכניות הערכת סיכונים וניהול", slug: "risk-assessment" },
        { name: "הכשרת צוות ופיתוח מקצועי", slug: "staff-training" },
        { name: "מערכות קבלת החלטות מבוססות נתונים", slug: "data-driven-decisions" },
        { name: "שיתוף פעולה רב-מקצועי", slug: "multi-disciplinary" },
        { name: "אסטרטגיית התנהגות להנהגה", slug: "behaviour-strategy-slt" },
        { name: "פרויקטי שינוי תרבות התנהגותית", slug: "culture-change" },
      ],
      packages: [
        {
          name: "חבילת התחלה בית-ספרית",
          description: "הערכה ראשונית להבנת הנוף ההתנהגותי של בית הספר וזיהוי עדיפויות.",
          includes: ["ביקורת התנהגותית", "ייעוץ צוות", "דוח עדיפויות עם המלצות"],
          ideal: "בתי ספר שחוקרים PBS לראשונה",
        },
        {
          name: "הערכה ומפת דרכים אסטרטגית",
          description: "הערכה מעמיקה עם מפת דרכים ליישום מובנה בהתאם לערכי בית הספר.",
          includes: ["FBAs מקיפים", "סקר וניתוח צוות", "מסמך מפת דרכים אסטרטגית", "תדריך הנהגה"],
          ideal: "בתי ספר מוכנים להתחייב לשינוי תרבותי",
        },
        {
          name: "יישום PBS מלא",
          description: "עיצוב ומתן מסגרת PBS בית-ספרית מקצה לקצה עם תמיכה שוטפת.",
          includes: ["עיצוב מסגרת", "פיתוח מדיניות", "תוכנית הכשרת צוות", "מערכות נתונים", "סקירות תקופתיות"],
          ideal: "בתי ספר המחפשים שינוי טרנספורמטיבי ובר-קיימא",
        },
        {
          name: "שותפות הנהגה התנהגותית שוטפת",
          description: "תמיכה ייעוצית שוטפת לצוות ההנהגה עם ייעוץ והנחיה סדירים.",
          includes: ["ייעוצי הנהגה חודשיים", "הנחיית מקרים", "עדכוני הכשרה", "מפגשי סקירת נתונים"],
          ideal: "בתי ספר שמתחזקים ומפתחים את תרבות ה-PBS שלהם",
        },
      ],
    },

    // Therapy page
    therapy: {
      title: "הבנת התנהגות דרך הקשר, לא האשמה",
      subtitle: "טיפול והתערבות",
      tagline: "מבוסס ACT, קונסטרוקציוני וממוקד באדם. אנחנו עוזרים לאנשים לבנות מיומנויות וגמישות לחיים מונחי ערכים.",
      ctaText: "קביעת ייעוץ",
      services: [
        { name: "טיפול מבוסס ACT", slug: "act-therapy" },
        { name: "התערבות התנהגותית קונסטרוקציונית", slug: "constructional-intervention" },
        { name: "תמיכה בוויסות רגשי", slug: "emotional-regulation" },
        { name: "הדרכת הורים", slug: "parent-coaching" },
        { name: "אימון תקשורת פונקציונלית", slug: "functional-communication" },
        { name: "דפוסי חרדה והימנעות", slug: "anxiety-avoidance" },
        { name: "בניית התנהגות מבוססת ערכים", slug: "values-based" },
        { name: "תכנון התנהגות מודע טראומה", slug: "trauma-informed" },
      ],
      packages: [
        {
          name: "הערכה התנהגותית ראשונית",
          description: "הערכה מקיפה להבנת ההקשר, הצרכים והחוזקות של האדם.",
          includes: ["ראיון קליני", "הערכה פונקציונלית", "ניתוח הקשרי", "ניסוח כתוב והמלצות"],
          ideal: "יחידים או משפחות המחפשים בהירות לפני התערבות",
        },
        {
          name: "התערבות ממוקדת לטווח קצר",
          description: "תוכנית מובנית של 8-12 שבועות המכוונת למטרות התנהגותיות ספציפיות.",
          includes: ["מפגשים שבועיים", "הגדרת מטרות שיתופית", "פעילויות בניית מיומנויות", "סקירות התקדמות"],
          ideal: "חששות ספציפיים וממוקדים עם מטרות ברורות",
        },
        {
          name: "שותפות טיפולית מורחבת",
          description: "תמיכה ארוכת טווח לצרכים מורכבים או רב-שכבתיים.",
          includes: ["לוח זמנים גמיש", "ניסוח שוטף", "תיאום רב-מערכתי", "סקירות תוצאות סדירות"],
          ideal: "מצבים מורכבים הדורשים תמיכה מתמשכת ומותאמת",
        },
        {
          name: "חבילת הדרכת הורים",
          description: "העצמת הורים עם אסטרטגיות מעשיות מבוססות מדע ההתנהגות.",
          includes: ["מפגשי הדרכת הורים", "ניתוח הקשרי בבית", "פיתוח אסטרטגיות", "תמיכה במעקב"],
          ideal: "הורים המחפשים הדרכה מבוססת ראיות וביטחון",
        },
      ],
    },

    // Families page
    families: {
      title: "תמיכה למשפחות שמנווטות מורכבות",
      subtitle: "תמיכה משפחתית",
      tagline: "מעשית, מותאמת אישית וללא האשמה. אנחנו עוזרים למשפחות לבנות עקביות, תקשורת וביטחון בבית.",
      ctaText: "דברו איתנו",
      services: [
        { name: "הערכה התנהגותית בבית", slug: "home-assessment" },
        { name: "הדרכת אסטרטגיות להורים", slug: "parent-strategy" },
        { name: "תמיכה בדינמיקת אחים", slug: "sibling-dynamics" },
        { name: "תכנון עקביות", slug: "consistency-planning" },
        { name: "התאמה בית-ספר-בית", slug: "home-school-alignment" },
        { name: "תכנון משבר ואסטרטגיות הפחתת מתח", slug: "crisis-planning" },
      ],
      packages: [
        {
          name: "מפגש בהירות",
          description: "מפגש מעמיק יחיד לחקירת חששות, זיהוי עדיפויות ומיפוי צעדים הבאים.",
          includes: ["ייעוץ של 90 דקות", "דיון הקשרי", "סיכום כתוב עם צעדים הבאים"],
          ideal: "משפחות שרוצות בהירות לפני התחייבות לתוכנית",
        },
        {
          name: "תוכנית התנהגות ביתית",
          description: "הערכה מובנית שמביאה לתוכנית תמיכה התנהגותית מותאמת לסביבה הביתית.",
          includes: ["תצפית בבית", "ראיון משפחתי", "תוכנית התנהגות כתובה", "מפגש הדרכת אסטרטגיות"],
          ideal: "משפחות מוכנות לתוכנית מובנית בבית",
        },
        {
          name: "תוכנית תמיכה משפחתית",
          description: "תוכנית של 6-10 שבועות עם הדרכה סדירה, יישום אסטרטגיות וסקירות התקדמות.",
          includes: ["מפגשי הדרכה שבועיים", "פיתוח אסטרטגיות", "תיאום בית-ספר", "מעקב התקדמות"],
          ideal: "משפחות שמנווטות צרכים שוטפים או מורכבים",
        },
        {
          name: "הדרכה התנהגותית שוטפת",
          description: "תמיכה שוטפת עם לוח זמנים גמיש למשפחות עם צרכים מתפתחים.",
          includes: ["מפגשים דו-שבועיים", "תמיכה במשבר מגיבה", "התאמות תוכנית", "מפגשי סקירה"],
          ideal: "משפחות המחפשות הדרכה מתמשכת ומותאמת",
        },
      ],
    },

    // Organisations page
    organisations: {
      title: "מדע ההתנהגות מיושם למערכות",
      subtitle: "ארגונים והנהגה",
      tagline: "ניהול התנהגות ארגוני מבוסס ראיות. אנחנו עוזרים לצוותי הנהגה לבנות תרבות, ממשל ומסגרות ביצועים שעובדים.",
      ctaText: "בקשת הערכה ארגונית",
      services: [
        { name: "ניהול התנהגות ארגוני (OBM)", slug: "obm" },
        { name: "עיצוב אסטרטגיית התנהגות", slug: "behaviour-strategy" },
        { name: "פרויקטי שינוי תרבותי", slug: "culture-change" },
        { name: "מערכות ביצועי צוות", slug: "staff-performance" },
        { name: "מסגרות ממשל סיכונים", slug: "risk-governance" },
        { name: "מבני ממשל קליני", slug: "clinical-governance" },
        { name: "ביקורות הגנה והתנהגות", slug: "safeguarding-audits" },
        { name: "מערכות נתוני התנהגות", slug: "behaviour-data" },
      ],
      packages: [
        {
          name: "ביקורת מערכות התנהגות",
          description: "ביקורת יסודית של המערכות ההתנהגותיות, המדיניות והפרקטיקות הנוכחיות שלכם.",
          includes: ["סקירת מסמכים", "ראיונות צוות", "הערכה תצפיתית", "דוח ביקורת עם המלצות"],
          ideal: "ארגונים המחפשים סקירה התנהגותית עצמאית",
        },
        {
          name: "שותפות יישום אסטרטגית",
          description: "תוכנית שיתופית לעיצוב ויישום מערכות מובילות התנהגות בארגון שלכם.",
          includes: ["עיצוב משותף של אסטרטגיה", "פיתוח מדיניות", "הכשרת צוות", "תמיכה ביישום", "סקירות רבעוניות"],
          ideal: "ארגונים שמתחייבים לשינוי התנהגותי מערכתי",
        },
        {
          name: "מסגרת הנחיה קלינית",
          description: "עיצוב והטמעה של מסגרת הנחיה קלינית לצוות המטפלים שלכם.",
          includes: ["עיצוב מסגרת", "הכשרת מנחים", "תבניות תיעוד", "מערכת אבטחת איכות"],
          ideal: "ספקי טיפול ושירותים קליניים",
        },
        {
          name: "מסלולי הכשרה והסמכה",
          description: "תוכניות הכשרה מותאמות אישית בהתאם לצרכי הארגון ולסטנדרטים מקצועיים.",
          includes: ["ניתוח צרכי הכשרה", "עיצוב תוכנית", "מתן והערכה", "הדרכת הסמכה"],
          ideal: "ארגונים שמשקיעים בפיתוח כוח אדם",
        },
      ],
    },

    // Supervision page
    supervision: {
      title: "פיתוח מטפלים מתחשבים ואתיים",
      subtitle: "הנחיה ופיתוח",
      tagline: "רפלקטיבית, קפדנית ומיושרת ערכים. תמיכה במנתחי התנהגות ומטפלים לצמוח עם בהירות ויושרה.",
      ctaText: "הגשת בקשה להנחיה",
      services: [
        { name: "הנחיית UKBA", slug: "ukba-supervision" },
        { name: "הנחיית ניסוח מקרים", slug: "case-formulation" },
        { name: "חונכות גישה קונסטרוקציונית", slug: "constructional-mentoring" },
        { name: "תמיכה בשילוב ACT", slug: "act-integration" },
        { name: "ייעוץ אתי", slug: "ethical-consultation" },
        { name: "מסלולי פיתוח מטפלים", slug: "practitioner-development" },
        { name: "קבוצות פרקטיקה רפלקטיבית", slug: "reflective-practice" },
      ],
      packages: [
        {
          name: "הנחיה בסיסית",
          description: "הנחיה מובנית למטפלים מתפתחים הבונים כשירויות ליבה.",
          includes: ["מפגשי הנחיה חודשיים", "דיון מקרים", "מעקב כשירויות", "משוב כתוב"],
          ideal: "מטפלים בתחילת דרכם ומתמחים",
        },
        {
          name: "הנחיה קלינית מתקדמת",
          description: "הנחיה קלינית מעמיקה למטפלים מנוסים המנהלים מקרים מורכבים.",
          includes: ["מפגשים דו-שבועיים", "ניסוח מקרים מורכבים", "תמיכה בקבלת החלטות אתיות", "תכנון פיתוח מקצועי"],
          ideal: "מטפלים מנוסים המחפשים עומק קליני",
        },
        {
          name: "הנחיית הנהגה",
          description: "הנחיה למנהיגים קליניים המנהלים צוותים ואסטרטגיית התנהגות ארגונית.",
          includes: ["מפגשי הנחיה אסטרטגיים", "רפלקציה על הנהגה", "ייעוץ דינמיקת צוות", "הדרכת ממשל"],
          ideal: "מנהלים קליניים ומנהלי שירות",
        },
        {
          name: "מעגלי הנחיה קבוצתיים",
          description: "הנחיה קבוצתית מונחית ללמידת עמיתים ופרקטיקה רפלקטיבית.",
          includes: ["מפגשים קבוצתיים חודשיים", "מסגרת רפלקציה מובנית", "דיון מקרים בין עמיתים", "למידה מונחית"],
          ideal: "צוותים וקבוצות עמיתים המחפשים צמיחה מקצועית משותפת",
        },
      ],
    },

    // Contact page
    contact: {
      tagline: "צרו קשר",
      title: "קביעת ייעוץ",
      subtitle: "ספרו לנו קצת על הצרכים שלכם ונחזור אליכם תוך 48 שעות. ללא התחייבות, ללא לחץ — רק שיחה על איך נוכל לעזור.",
      location: "מנצ'סטר, בריטניה",
      nameLabel: "שם",
      namePlaceholder: "השם שלכם",
      emailLabel: "אימייל",
      emailPlaceholder: "you@example.com",
      interestedLabel: "מתעניין/ת ב",
      selectService: "בחרו תחום שירות",
      serviceOptions: ["PBS בחינוך", "טיפול", "תמיכה משפחתית", "ארגונים", "הנחיה", "אחר"],
      messageLabel: "הודעה",
      messagePlaceholder: "ספרו לנו קצת על המצב שלכם ואיך נוכל לעזור...",
      sendButton: "שליחת הודעה",
      sending: "שולח...",
      successTitle: "ההודעה נשלחה",
      successDescription: "ניצור קשר בקרוב.",
    },

    // Login page
    login: {
      title: "התחברות",
      subtitle: "ברוכים השבים לבניין",
      emailLabel: "אימייל",
      passwordLabel: "סיסמה",
      button: "התחברות",
      loading: "מתחבר…",
      noAccount: "אין לך חשבון?",
      signUpLink: "הרשמה",
    },

    // Signup page
    signup: {
      title: "הרשמה",
      subtitle: "יצירת חשבון בניין",
      emailLabel: "אימייל",
      passwordLabel: "סיסמה",
      button: "הרשמה",
      loading: "יוצר חשבון…",
      hasAccount: "כבר יש לך חשבון?",
      logInLink: "התחברות",
      successTitle: "בדקו את האימייל",
      successDescription: "שלחנו לכם קישור לאישור.",
    },

    // Footer
    footer: {
      description: "שירותי התנהגות קליניים. בניית יכולת התנהגותית באמצעות פרקטיקה קונסטרוקציונית, אתית ומבוססת ראיות. אנחנו לא מסירים התנהגות. אנחנו בונים יכולת.",
      servicesTitle: "שירותים",
      contactTitle: "צרו קשר",
      copyright: "בניין שירותי התנהגות קליניים. כל הזכויות שמורות.",
      links: {
        education: "PBS בחינוך",
        therapy: "טיפול",
        families: "תמיכה משפחתית",
        organisations: "ארגונים",
        supervision: "הנחיה",
        bookConsultation: "קביעת ייעוץ",
      },
    },

    // Offer detail content (Hebrew uses same slugs, content in Hebrew)
    offerDetails: {
      education: [
        { slug: "whole-school-pbs", title: "עיצוב מסגרת PBS בית-ספרית", summary: "מסגרת מקיפה ומונעת ערכים שמשנה את תרבות ההתנהגות בית-ספרית מהיסוד.", description: ["תמיכה התנהגותית חיובית (PBS) ברמה בית-ספרית עוסקת ביצירת סביבה שבה כל תלמיד ואיש צוות מבין את הציפיות, הערכים והמערכות המשותפות שמנחים התנהגות.", "אנחנו עובדים לצד צוות ההנהגה הבכיר שלכם לעיצוב מסגרת PBS מותאמת אישית המשקפת את זהות בית הספר שלכם."], keyPoints: ["מבוסס על ניתוח התנהגות קונסטרוקציוני", "מעוצב עם ערכי בית הספר במרכז", "מכסה שכבות אוניברסליות, ממוקדות ואינטנסיביות", "בנוי לקיימות"], whoIsThisFor: ["בתי ספר המחפשים להחליף מערכות התנהגות ענישתיות", "בתי ספר חדשים המבססים את תרבות ההתנהגות שלהם", "מנהלים בכירים המחפשים חזון התנהגותי קוהרנטי"], outcomes: ["מסמך מסגרת PBS מקיף", "מבנה תמיכה שכבתי ברור", "צמצום הרחקות ותקריות התנהגותיות"] },
        { slug: "behaviour-policy", title: "פיתוח מדיניות התנהגות", summary: "מדיניות התנהגות מבוססת ראיות שהיא מעשית, הוגנת ומושרשת בערכי בית הספר.", description: ["מדיניות התנהגות חזקה לא יושבת במגירה — היא חיה בכל אינטראקציה, מסדרון וכיתה.", "אנחנו עוזרים לבתי ספר לפתח מדיניות התנהגות ברורה, הוגנת ומשקפת את העקרונות שהם רוצים לשמור."], keyPoints: ["משורש בעקרונות אתיים וקונסטרוקציוניים", "מעוצב בשיתוף הנהגת בית הספר", "שפה מעשית ונגישה"], whoIsThisFor: ["בתי ספר הסוקרים את מדיניות ההתנהגות שלהם", "מנהלים חדשים המבססים את חזונם"], outcomes: ["מדיניות התנהגות ברורה ומונעת ערכים", "ביטחון צוות ביישום עקבי"] },
        { slug: "fba", title: "הערכת התנהגות פונקציונלית (FBA)", summary: "הבנת התפקוד וההקשר של התנהגות לעיצוב התערבויות שבאמת עובדות.", description: ["הערכת התנהגות פונקציונלית היא אבן היסוד של תמיכה התנהגותית יעילה.", "אנחנו מבצעים FBAs מעמיקים באמצעות תצפית ישירה, ראיונות מובנים ואיסוף נתונים."], keyPoints: ["מתודולוגיית הערכה מבוססת ראיות", "מזהה תפקוד, לא רק צורת התנהגות", "מיידעת ישירות תכנון התערבות"], whoIsThisFor: ["בתי ספר התומכים בתלמידים עם התנהגות מורכבת", "רכזי שילוב המחפשים בהירות"], outcomes: ["דוח הערכת התנהגות פונקציונלית ברור", "המלצות התערבות ממוקדות"] },
        { slug: "individual-support-plans", title: "תוכניות תמיכה התנהגותית אישיות", summary: "תוכניות תמיכה התנהגותית מותאמות אישית הבונות יכולת ומקדמות כבוד.", description: ["כל אדם ראוי לתמיכה המותאמת לחוזקות, לצרכים ולהקשר הייחודיים שלו.", "אנחנו יוצרים תוכניות המתמקדות בבניית מיומנויות והתאמות סביבתיות."], keyPoints: ["ממוקד באדם ומבוסס חוזקות", "כולל אסטרטגיות פרואקטיביות וריאקטיביות", "מטרות מדידות"], whoIsThisFor: ["תלמידים עם צרכים חינוכיים מיוחדים", "ילדים ובני נוער בסיכון להרחקה"], outcomes: ["תוכנית תמיכה התנהגותית מקיפה ומותאמת אישית", "מטרות התנהגותיות מדידות"] },
        { slug: "risk-assessment", title: "תוכניות הערכת סיכונים וניהול", summary: "הערכות סיכון מידתיות ודינמיות המעדיפות בטיחות וכבוד.", description: ["הערכת סיכון אפקטיבית מאזנת בין בטיחות לזכות הפרט לכבוד, הכלה וחוויה חיובית.", "אנחנו יוצרים הערכות סיכון דינמיות המגיבות להקשרים משתנים."], keyPoints: ["מידתיות ומכבדות זכויות", "דינמיות ונסקרות באופן קבוע", "כוללות פרוטוקולי הפחתת מתח"], whoIsThisFor: ["בתי ספר המנהלים פרופילי סיכון מורכבים", "שירותים התומכים באנשים עם התנהגות מאתגרת"], outcomes: ["תיעוד הערכת סיכון ברור ומידתי", "סביבות בטוחות יותר לכולם"] },
        { slug: "staff-training", title: "הכשרת צוות ופיתוח מקצועי", summary: "פיתוח מקצועי מעשי ומרתק שמשנה את האופן שבו צוות מבין ומגיב להתנהגות.", description: ["הכשרה אפקטיבית ביותר כשהיא משנה את אופן החשיבה, לא רק מה שעושים.", "אנחנו מציעים חבילות הכשרה מותאמות הכוללות נושאים מיסודות PBS ועד FBA מתקדם."], keyPoints: ["אינטראקטיבי ומבוסס ראיות", "מותאם למסגרת ולצרכים שלכם", "ניתן להעביר כמפגשים בודדים או תוכניות"], whoIsThisFor: ["צוות הוראה ותמיכה בכל הרמות", "צוותי הנהגה בכירים"], outcomes: ["ביטחון וכשירות צוות מוגברים", "אסטרטגיות מעשיות לשימוש מיידי"] },
        { slug: "data-driven-decisions", title: "מערכות קבלת החלטות מבוססות נתונים", summary: "ניצול נתוני התנהגות ליידוע החלטות, מעקב תוצאות והוכחת השפעה.", description: ["נתונים טובים מניעים החלטות טובות.", "אנחנו עוזרים לבתי ספר לעצב ולהטמיע מערכות לאיסוף, ניתוח ושימוש בנתוני התנהגות."], keyPoints: ["מערכות איסוף נתונים מעשיות", "ניתוח ודיווח משמעותיים", "נגישות ללא-מומחים"], whoIsThisFor: ["בתי ספר שרוצים להשתמש בנתונים בצורה יעילה יותר", "מנהלים בכירים המחפשים הוכחות להשפעה"], outcomes: ["מערכת נתוני התנהגות מתפקדת", "קבלת החלטות מבוססת ראיות"] },
        { slug: "multi-disciplinary", title: "שיתוף פעולה רב-מקצועי", summary: "הנחיית שיתוף פעולה אפקטיבי בין אנשי מקצוע לתמיכה מתואמת.", description: ["התנהגות מורכבת לעיתים רחוקות נובעת מסיבה אחת או פתרון אחד.", "אנחנו מנחים שיתוף פעולה רב-מקצועי על ידי מתן מסגרת התנהגותית משותפת."], keyPoints: ["מסגרות הערכה וניסוח משותפות", "שפה משותפת בין תחומים", "מיקוד בפרט במרכז"], whoIsThisFor: ["בתי ספר העובדים עם גורמים חיצוניים", "צוותים רב-מקצועיים סביב ילד"], outcomes: ["תקשורת רב-מקצועית משופרת", "תוכניות תמיכה מתואמות וקוהרנטיות"] },
        { slug: "behaviour-strategy-slt", title: "אסטרטגיית התנהגות להנהגה", summary: "תמיכה אסטרטגית בהנהגה התנהגותית לצוותי הנהגה בכירים המובילים שינוי בית-ספרי.", description: ["מנהלים בכירים קובעים את הטון לתרבות ההתנהגות.", "אנחנו מספקים תמיכה ייעוצית אסטרטגית לעזור לצוותי הנהגה לפתח חזון התנהגותי קוהרנטי."], keyPoints: ["ייעוץ ברמה אסטרטגית", "מיושר עם תוכניות שיפור בית-ספריות", "גישה פרואקטיבית, לא ריאקטיבית"], whoIsThisFor: ["מנהלים וסגני מנהלים", "חברי הנהגה האחראים על התנהגות"], outcomes: ["אסטרטגיה התנהגותית ברורה המיושרת עם חזון בית הספר", "שיפור תרבותי מתמשך"] },
        { slug: "culture-change", title: "פרויקטי שינוי תרבות התנהגותית", summary: "פרויקטים טרנספורמטיביים שמשנים את תרבות בית הספר מענישתית לקונסטרוקציונית.", description: ["שינוי תרבות הוא העבודה השאפתנית והמשפיעה ביותר שבית ספר יכול לבצע.", "פרויקטי שינוי התרבות שלנו מעוצבים כשותפויות רב-שלביות."], keyPoints: ["שותפות רב-שלבית ומתמשכת", "מתחילה בביקורת תרבותית ועיצוב חזון", "אבני דרך ותוצאות מדידות"], whoIsThisFor: ["בתי ספר במשבר או הדורשים שיפור", "צוותי הנהגה חדשים המבססים את חזונם"], outcomes: ["תרבות התנהגות שעברה טרנספורמציה", "צמצום הרחקות ותקריות"] }
      ],
      therapy: [
        { slug: "act-therapy", title: "טיפול מבוסס ACT", summary: "טיפול קבלה ומחויבות הבונה גמישות פסיכולוגית וחיים מונעי ערכים.", description: ["ACT הוא גישה טיפולית מודרנית ומבוססת ראיות שעוזרת לאנשים לפתח גמישות פסיכולוגית.", "הגישה שלנו מבוססת ACT משולבת עם עקרונות התנהגותיים קונסטרוקציוניים."], keyPoints: ["בונה גמישות פסיכולוגית", "מונע ערכים, לא ממוקד סימפטומים", "בסיס ראיות חזק"], whoIsThisFor: ["אנשים החווים חרדה או דיכאון", "אנשים שנאבקים בדפוסי הימנעות"], outcomes: ["גמישות פסיכולוגית מוגברת", "חיבור ברור יותר לערכים אישיים"] },
        { slug: "constructional-intervention", title: "התערבות התנהגותית קונסטרוקציונית", summary: "בניית מיומנויות ורפרטוארים חדשים במקום דיכוי התנהגות קיימת.", description: ["התערבות קונסטרוקציונית היא הלב הפילוסופי של העבודה שלנו.", "גישה זו מתמקדת בזיהוי ובניית היכולות והמיומנויות שהופכות התנהגות אדפטיבית לסבירה יותר."], keyPoints: ["בונה יכולת במקום לדכא התנהגות", "מכבד אוטונומיה וכבוד הפרט", "מבוסס ראיות ואתי"], whoIsThisFor: ["אנשים עם לקויות למידה", "ילדים ובני נוער עם צרכים מיוחדים"], outcomes: ["רפרטואר התנהגותי מורחב", "מיומנויות פונקציונליות חדשות"] },
        { slug: "emotional-regulation", title: "תמיכה בוויסות רגשי", summary: "פיתוח מיומנויות להבנה, ניהול והבעת רגשות באופן אפקטיבי.", description: ["ויסות רגשי הוא היכולת לנהל ולהגיב לחוויות רגשיות בדרכים אדפטיביות.", "אנחנו לוקחים גישה הקשרית לוויסות רגשי."], keyPoints: ["הבנה הקשרית של ויסות", "אסטרטגיות מעשיות וניתנות ללימוד", "עובד עם כל מערכת התמיכה"], whoIsThisFor: ["ילדים ובני נוער עם קשיים רגשיים", "אנשים עם אוטיזם או ADHD"], outcomes: ["מודעות רגשית ואוצר מילים משופרים", "אסטרטגיות ויסות מעשיות"] },
        { slug: "parent-coaching", title: "הדרכת הורים", summary: "העצמת הורים עם הבנה, ביטחון ואסטרטגיות התנהגותיות מעשיות.", description: ["הורים הם האנשים החשובים ביותר בחיי ילדם — וסוכני השינוי החזקים ביותר.", "אנחנו לא קובעים תוכניות נוקשות. במקום זאת, אנחנו עובדים בשיתוף פעולה."], keyPoints: ["שיתופי וללא שיפוטיות", "מותאם לצרכי המשפחה", "מבוסס ראיות"], whoIsThisFor: ["הורים לילדים עם צרכים התנהגותיים", "הורים שמרגישים מוצפים"], outcomes: ["ביטחון הורי מוגבר", "אסטרטגיות מעשיות לשימוש בבית"] },
        { slug: "functional-communication", title: "אימון תקשורת פונקציונלית", summary: "לימוד מיומנויות תקשורת שמחליפות התנהגות מאתגרת בהבעה אפקטיבית.", description: ["התנהגויות רבות המתוארות כ'מאתגרות' הן למעשה תקשורת.", "אימון תקשורת פונקציונלית (FCT) מזהה את התפקוד התקשורתי של ההתנהגות."], keyPoints: ["מטפל בתפקוד ההתנהגות", "מלמד מיומנויות תקשורת חלופיות", "בסיס ראיות חזק"], whoIsThisFor: ["אנשים לא-מילוליים", "אנשים עם מצבים על הספקטרום האוטיסטי"], outcomes: ["מיומנויות תקשורת חלופיות אפקטיביות", "צמצום בהתנהגות מאתגרת"] },
        { slug: "anxiety-avoidance", title: "דפוסי חרדה והימנעות", summary: "הבנה וטיפול בהימנעות מונעת חרדה באמצעות גישות התנהגותיות הקשריות.", description: ["חרדה והימנעות עובדות יחד במעגל שמצמצם את עולמו של אדם.", "הגישה שלנו משלבת שיטות מבוססות ACT עם ניתוח התנהגותי."], keyPoints: ["הבנה הקשרית של חרדה", "חשיפה ומעורבות מונעות ערכים", "גישה הדרגתית ומלאת חמלה"], whoIsThisFor: ["אנשים עם סירוב בית-ספרי מונע חרדה", "אנשים שהחרדה שלהם מגבילה השתתפות יומית"], outcomes: ["מעורבות מוגברת בפעילויות שנמנעו", "גמישות פסיכולוגית גדולה יותר"] },
        { slug: "values-based", title: "בניית התנהגות מבוססת ערכים", summary: "עזרה לאנשים לזהות מה חשוב להם ולבנות התנהגויות המיושרות עם ערכיהם.", description: ["כששינוי התנהגות מחובר למה שמישהו באמת מעוניין בו, הוא הופך למשמעותי ובר-קיימא.", "גישה זו עוברת מעבר לציות ושליטה, ומעצימה אנשים לבחירות שמשקפות את העצמי האותנטי שלהם."], keyPoints: ["מבוסס על חקירת ערכים אישיים", "מקדם אוטונומיה וכיוון עצמי", "מתאים לכל קבוצות הגיל"], whoIsThisFor: ["צעירים המחפשים כיוון ומטרה", "אנשים שמרגישים מנותקים או תקועים"], outcomes: ["בהירות לגבי ערכים אישיים", "תחושת מטרה ומשמעות גדולה יותר"] },
        { slug: "trauma-informed", title: "תכנון התנהגות מודע טראומה", summary: "תמיכה התנהגותית שמזהה ומגיבה להשפעת הטראומה ברגישות ובמיומנות.", description: ["טראומה יכולה להשפיע עמוקות על האופן שבו אנשים תופסים, מפרשים ומגיבים לסביבתם.", "הגישה שלנו מודעת לטראומה מבטיחה שתכנון ההתנהגות תמיד מתחשב בהשפעה הפוטנציאלית של טראומה."], keyPoints: ["מזהה את השפעת הטראומה על ההתנהגות", "מעדיף בטיחות ואמון", "נמנע מטראומטיזציה מחדש"], whoIsThisFor: ["אנשים עם היסטוריות טראומה ידועות או חשודות", "ילדים באומנה או עם חוויית טיפול"], outcomes: ["תוכניות התנהגות רגישות לטראומה", "תמיכה יעילה ובת-קיימא יותר"] }
      ],
      families: [
        { slug: "home-assessment", title: "הערכה התנהגותית בבית", summary: "הערכה מעמיקה בסביבת הבית להבנת התנהגות בהקשר הטבעי שלה.", description: ["התנהגות לא קורית בחלל ריק — היא קורית בהקשר העשיר והמורכב של חיי הבית.", "הערכה ביתית מאפשרת לנו לצפות בהתנהגות בסביבה שבה היא מתרחשת באופן טבעי."], keyPoints: ["הערכה בסביבה הטבעית", "צופה בשגרות ואינטראקציות אמיתיות", "לא שיפוטית ותומכת"], whoIsThisFor: ["משפחות החוות קשיים התנהגותיים בבית", "הורים המחפשים בהירות לגבי צרכי ילדם"], outcomes: ["הבנה ברורה של התנהגות בהקשר", "המלצות מעשיות וישימות"] },
        { slug: "parent-strategy", title: "הדרכת אסטרטגיות להורים", summary: "הדרכה ממוקדת לעזור להורים לפתח וליישם אסטרטגיות התנהגותיות אפקטיביות בבית.", description: ["הדרכת אסטרטגיות להורים חורגת מעבר לעצות כלליות.", "כל מפגש הדרכה מתמקד בהבנת אתגר מסוים, פיתוח אסטרטגיה ותרגול יישום."], keyPoints: ["פיתוח אסטרטגיות ספציפיות ומעשיות", "שיתופי ומעצים", "סקירה והתאמה מתמשכת"], whoIsThisFor: ["הורים שרוצים אסטרטגיות מעשיות להתנהגויות ספציפיות", "הורים לילדים עם צרכים מיוחדים"], outcomes: ["רפרטואר של אסטרטגיות מעשיות", "ביטחון הורי מוגבר"] },
        { slug: "sibling-dynamics", title: "תמיכה בדינמיקת אחים", summary: "תמיכה במשפחות לניווט הדינמיקה המורכבת בין אחים, במיוחד כשלילד אחד יש צרכים נוספים.", description: ["כשלילד אחד במשפחה יש צרכים התנהגותיים משמעותיים, יחסי אחים יכולים להפוך למתוחים.", "אנחנו עוזרים למשפחות להבין ולטפל בדינמיקת אחים ברגישות."], keyPoints: ["מטפל בכל המערכת המשפחתית", "תומך בצרכים הרגשיים של אחים", "מקדם יחסי אחים חיוביים"], whoIsThisFor: ["משפחות שבהן לילד אחד יש צרכים מיוחדים", "משפחות החוות קונפליקט בין אחים"], outcomes: ["יחסי אחים משופרים", "הפחתת קונפליקט משפחתי"] },
        { slug: "consistency-planning", title: "תכנון עקביות", summary: "יצירת שגרות ותגובות עקביות וצפויות התומכות בהתנהגות חיובית.", description: ["עקביות היא אחד הכלים החזקים ביותר בתמיכה התנהגותית.", "אנחנו עוזרים למשפחות לפתח תוכניות עקביות המכסות שגרות יומיות וציפיות התנהגותיות."], keyPoints: ["שגרות וציפיות ברורות ומעשיות", "תגובות מיושרות בין מטפלים", "גמיש וריאליסטי לחיי המשפחה"], whoIsThisFor: ["משפחות שנאבקות בתגובות לא עקביות", "משפחות מפוצלות הזקוקות ליישור"], outcomes: ["ציפיות ברורות ומשותפות בבית", "סביבה ביתית צפויה ושקטה יותר"] },
        { slug: "home-school-alignment", title: "התאמה בית-ספר-בית", summary: "גישור על הפער בין בית לבית ספר ליצירת תמיכה עקבית בין מסגרות.", description: ["ילדים עוברים בין בית ובית ספר כל יום.", "אנחנו עובדים עם משפחות ובתי ספר יחד ליישר גישות ולשתף מידע."], keyPoints: ["מגשר על גישות בית ובית ספר", "מנחה תקשורת אפקטיבית", "שם את הילד במרכז"], whoIsThisFor: ["משפחות שמרגישות מנותקות מבית הספר של ילדן", "ילדים החווים חוסר עקביות בין מסגרות"], outcomes: ["גישות מיושרות בין בית ובית ספר", "חוויה עקבית יותר עבור הילד"] },
        { slug: "crisis-planning", title: "תכנון משבר ואסטרטגיות הפחתת מתח", summary: "הכנת משפחות עם אסטרטגיות ברורות ורגועות לניהול מצבי משבר בבטחה.", description: ["משברים קורים. כשהם מתרחשים, תוכנית ברורה יכולה לעשות את ההבדל.", "אנחנו מפתחים תוכניות משבר מותאמות אישית הכוללות סימני אזהרה מוקדמים ואסטרטגיות הפחתת מתח."], keyPoints: ["תכנון משבר מותאם אישית", "טכניקות הפחתת מתח מעשיות", "ממוקד בטיחות ומודע טראומה"], whoIsThisFor: ["משפחות המנהלות משברים התנהגותיים תכופים או אינטנסיביים", "הורים שמרגישים לא בטוחים במהלך תקריות"], outcomes: ["תוכנית משבר ברורה ומותאמת אישית", "ביטחון בטכניקות הפחתת מתח"] }
      ],
      organisations: [
        { slug: "obm", title: "ניהול התנהגות ארגוני (OBM)", summary: "יישום מדע ההתנהגות לשיפור ביצועים, תרבות ורווחה ארגוניים.", description: ["OBM מיישם את עקרונות ניתוח ההתנהגות לשיפור תפקוד ארגונים.", "אנחנו עוזרים לארגונים להבין את המניעים ההתנהגותיים מאחורי ביצועים, מעורבות ותרבות."], keyPoints: ["גישה מבוססת ראיות לביצועים ארגוניים", "ניתוח והתערבות מונעי נתונים", "חשיבה ברמת מערכות"], whoIsThisFor: ["ארגונים המחפשים שיפור ביצועים", "צוותי משאבי אנוש ואנשים"], outcomes: ["מדדי ביצועים ארגוניים משופרים", "שיפור תרבותי בר-קיימא"] },
        { slug: "behaviour-strategy", title: "עיצוב אסטרטגיית התנהגות", summary: "עיצוב משותף של אסטרטגיות התנהגות ארגוניות המיושרות עם המשימה שלכם.", description: ["אסטרטגיית התנהגות נותנת לארגון שלכם גישה קוהרנטית ומבוססת ראיות.", "התהליך שלנו כולל ייעוץ עם בעלי עניין, ניתוח סביבתי וסדנאות עיצוב משותף."], keyPoints: ["מעוצב בשיתוף צוות ההנהגה", "כולל תכנון יישום", "תוצאות מדידות"], whoIsThisFor: ["ארגונים ללא גישה התנהגותית קוהרנטית", "צוותי הנהגה המחפשים בהירות אסטרטגית"], outcomes: ["מסמך אסטרטגיית התנהגות מקיף", "מפת דרכים ליישום ברורה"] },
        { slug: "culture-change", title: "פרויקטי שינוי תרבותי", summary: "פרויקטים מתמשכים ומבוססי ראיות שמשנים תרבות ארגונית מריאקטיבית לקונסטרוקציונית.", description: ["תרבות ארגונית היא סכום אלפי אינטראקציות, החלטות והרגלים יומיים.", "פרויקטי שינוי התרבות שלנו מעוצבים כשותפויות ארוכות טווח."], keyPoints: ["שותפות ארוכת טווח ומתמשכת", "הערכת תרבות מבוססת ראיות", "מדדי תרבות מדידים"], whoIsThisFor: ["ארגונים במשבר או מול לחץ רגולטורי", "ארגונים גדלים שבונים את תרבותם מאפס"], outcomes: ["שינוי תרבותי מדיד", "שיפור שביעות רצון ושימור צוות"] },
        { slug: "staff-performance", title: "מערכות ביצועי צוות", summary: "עיצוב מערכות שתומכות, מניעות ומפתחות ביצועי צוות באמצעות מדע ההתנהגות.", description: ["ניהול ביצועים מסורתי מסתמך לעיתים על סקירות שנתיות ואמצעים ענישתיים.", "אנחנו עוזרים לארגונים לעצב מערכות ביצועים הכוללות ציפיות ברורות, משוב סדיר ותגמול משמעותי."], keyPoints: ["מבוסס עקרונות מדע ההתנהגות", "ממוקד חיזוק חיובי", "תומך בפיתוח, לא רק בציות"], whoIsThisFor: ["ארגונים הסוקרים את ניהול הביצועים שלהם", "מנהלים שרוצים לשפר ביצועי צוות"], outcomes: ["מערכת ביצועים מודרנית ומבוססת ראיות", "מעורבות ומוטיבציה משופרת של צוות"] },
        { slug: "risk-governance", title: "מסגרות ממשל סיכונים", summary: "בניית מסגרות ממשל חזקות לניהול סיכון התנהגותי בארגון.", description: ["ממשל סיכונים אפקטיבי מבטיח שסיכון התנהגותי מזוהה, מוערך, מנוהל ומנוטר.", "אנחנו עוזרים לארגונים לעצב מסגרות ממשל סיכונים שהן מידתיות ומעשיות."], keyPoints: ["מבני ממשל מקיפים", "מידתיים ומעשיים", "עומדים בדרישות רגולטוריות"], whoIsThisFor: ["שירותים המנהלים סיכון התנהגותי באופן יומי", "ארגונים המתכוננים לפיקוח או ביקורת"], outcomes: ["מסגרת ממשל סיכונים חזקה", "בטיחות ואיכות משופרים"] },
        { slug: "clinical-governance", title: "מבני ממשל קליני", summary: "הקמת ממשל קליני שמבטיח איכות, בטיחות ופרקטיקה אתית.", description: ["ממשל קליני הוא המסגרת שדרכה ארגונים מבטיחים את איכות ובטיחות הפרקטיקה הקלינית.", "אנחנו עוזרים לארגונים לעצב ולהטמיע מבני ממשל קליני."], keyPoints: ["עיצוב ממשל קליני מקיף", "מבני הנחיה ואבטחת איכות", "שילוב פיתוח מקצועי"], whoIsThisFor: ["ספקי טיפול ושירותים קליניים", "ארגונים הסוקרים ממשל קיים"], outcomes: ["מסגרת ממשל קליני מתפקדת", "תוצאות קליניות ואחריותיות משופרות"] },
        { slug: "safeguarding-audits", title: "ביקורות הגנה והתנהגות", summary: "ביקורות עצמאיות המעריכות את איכות ובטיחות הפרקטיקות ההתנהגותיות ומערכות ההגנה.", description: ["ביקורת סדירה חיונית לשמירה על איכות.", "אנחנו סוקרים תיעוד, צופים בפרקטיקה, מראיינים צוות ומשווים לסטנדרטים."], keyPoints: ["הערכה עצמאית ומומחית", "ממצאים והמלצות ברורים", "ניתן לביצוע חד-פעמי או שוטף"], whoIsThisFor: ["ארגונים המתכוננים לפיקוח", "שירותים שרוצים אבטחת איכות עצמאית"], outcomes: ["דוח ביקורת מקיף", "עדיפויות ברורות לשיפור"] },
        { slug: "behaviour-data", title: "מערכות נתוני התנהגות", summary: "עיצוב והטמעה של מערכות לאיסוף, ניתוח ושימוש יעיל בנתוני התנהגות.", description: ["נתונים בעלי ערך רק אם הם נאספים היטב, מנותחים בצורה משמעותית ומשמשים להנעת החלטות.", "אנחנו עוזרים לארגונים לעצב ולהטמיע מערכות נתוני התנהגות."], keyPoints: ["מערכות נתונים מעשיות וממוקדות מטרה", "הכשרת צוות בשימוש בנתונים", "מותאם לצרכי הארגון"], whoIsThisFor: ["ארגונים שרוצים לשפר את איכות הנתונים", "צוותי אבטחת איכות וממשל"], outcomes: ["מערכת נתוני התנהגות מתפקדת", "שיפור שירות מבוסס ראיות"] }
      ],
      supervision: [
        { slug: "ukba-supervision", title: "הנחיית UKBA", summary: "הנחיה מובנית העומדת בדרישות UKBA לרישום ופיתוח מקצועי מתמשך.", description: ["הנחיית UKBA היא דרישה למטפלים המבקשים או מתחזקים רישום.", "מפגשי ההנחיה מכסים דיון בעבודת מקרים, חשיבה אתית ותכנון פיתוח מקצועי."], keyPoints: ["עומד בדרישות הנחיית UKBA", "פיתוח כשירויות מובנה", "גישה רפלקטיבית וקונסטרוקציונית"], whoIsThisFor: ["מטפלים המבקשים רישום UKBA", "מטפלים רשומים המתחזקים CPD"], outcomes: ["תיעוד הנחיה תואם UKBA", "צמיחה מקצועית וביטחון"] },
        { slug: "case-formulation", title: "הנחיית ניסוח מקרים", summary: "הנחיה מעמיקה המתמקדת בפיתוח מיומנויות ניסוח מקרים מתוחכמות.", description: ["ניסוח מקרים הוא האמנות והמדע של הבנת התנהגות אדם בהקשרו המלא.", "בהנחיית ניסוח מקרים, אנחנו עובדים יחד לפתח ניסוחים מתוחכמים יותר."], keyPoints: ["מפתח מיומנויות ניסוח מתקדמות", "משתמש בחומר מקרים אמיתי", "משפר חשיבה קלינית"], whoIsThisFor: ["מטפלים שרוצים להעמיק את מיומנויות הניסוח", "מנתחי התנהגות שעובדים עם מקרים מורכבים"], outcomes: ["ניסוחי מקרים מתוחכמים יותר", "ביטחון גדול יותר עם מקרים מורכבים"] },
        { slug: "constructional-mentoring", title: "חונכות גישה קונסטרוקציונית", summary: "חונכות ייעודית למטפלים הלומדים ליישם עקרונות קונסטרוקציוניים בעבודתם.", description: ["הגישה הקונסטרוקציונית מייצגת שינוי פרדיגמה באופן שבו אנחנו חושבים על התנהגות.", "תוכנית החונכות שלנו מיועדת למטפלים שרוצים להטמיע עקרונות קונסטרוקציוניים."], keyPoints: ["מתמקד בפילוסופיה ופרקטיקה קונסטרוקציונית", "יישום על מקרים אמיתיים", "משנה את אוריינטציית הפרקטיקה"], whoIsThisFor: ["מטפלים חדשים לגישות קונסטרוקציוניות", "מנתחים מנוסים המחפשים פיתוח פילוסופי"], outcomes: ["הבנה עמוקה של עקרונות קונסטרוקציוניים", "פרקטיקה אתית משופרת"] },
        { slug: "act-integration", title: "תמיכה בשילוב ACT", summary: "תמיכה במטפלים לשלב טיפול קבלה ומחויבות בפרקטיקה ההתנהגותית שלהם.", description: ["ACT וניתוח התנהגות שימושי חולקים שורשים עמוקים במדע ההתנהגות.", "אנחנו תומכים במטפלים להביא עקרונות ותהליכים של ACT לפרקטיקה הקיימת שלהם."], keyPoints: ["מגשר בין פרקטיקת ACT ו-ABA", "מיקוד ביישום מעשי", "מרחיב רפרטואר טיפולי"], whoIsThisFor: ["מנתחי התנהגות שרוצים להשתמש ב-ACT", "קלינאים המחפשים גישות משולבות"], outcomes: ["שילוב ACT בטוח בפרקטיקה", "תוצאות לקוח משופרות"] },
        { slug: "ethical-consultation", title: "ייעוץ אתי", summary: "ייעוץ מומחה בדילמות אתיות, החלטות מורכבות ופרקטיקה מיושרת ערכים.", description: ["פרקטיקה אתית לא תמיד פשוטה.", "שירות הייעוץ האתי שלנו מספק מרחב סודי לחקירת דילמות אתיות."], keyPoints: ["תמיכה בחשיבה אתית סודית", "ייעוץ פרטני או צוותי", "מחזק תרבות פרקטיקה אתית"], whoIsThisFor: ["מטפלים העומדים בפני דילמות אתיות", "צוותים המנהלים מצבים מורכבים"], outcomes: ["חשיבה אתית ברורה למצבים מורכבים", "ביטחון משופר בקבלת החלטות"] },
        { slug: "practitioner-development", title: "מסלולי פיתוח מטפלים", summary: "תוכניות פיתוח מובנות המנחות מטפלים ממיומנויות בסיסיות לפרקטיקה מתקדמת.", description: ["פיתוח מקצועי בניתוח התנהגות הוא מסע.", "אנחנו מעצבים תוכניות פיתוח אישיות הכוללות הנחיה, הכשרה וחונכות."], keyPoints: ["פיתוח מובנה ואישי", "מיושר עם סטנדרטים מקצועיים", "משלב הנחיה, הכשרה וחונכות"], whoIsThisFor: ["מטפלים בתחילת הקריירה", "מקצוענים באמצע הקריירה המחפשים התקדמות"], outcomes: ["תוכנית פיתוח מותאמת אישית", "ביטחון וזהות מקצועיים"] },
        { slug: "reflective-practice", title: "קבוצות פרקטיקה רפלקטיבית", summary: "מפגשים קבוצתיים מונחים המטפחים למידת עמיתים, רפלקציה וצמיחה מקצועית משותפת.", description: ["פרקטיקה רפלקטיבית חיונית לשמירה על איכות ולמניעת שחיקה.", "הקבוצות שלנו מספקות מרחב מובנה ומונחה ללמידת עמיתים ורפלקציה."], keyPoints: ["מסגרת הנחיה מובנית", "למידה ותמיכת עמיתים", "מונע בידוד ושחיקה"], whoIsThisFor: ["צוותי מטפלים בשירותי התנהגות", "מטפלים מבודדים המחפשים חיבור עמיתים"], outcomes: ["מיומנויות פרקטיקה רפלקטיבית משופרות", "הפחתת בידוד מקצועי ושחיקה"] }
      ]
    },
  },
} as const;
