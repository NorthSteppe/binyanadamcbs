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

    // Education page
    education: {
      title: "PBS in Education",
      subtitle: "Schools & Education Settings",
      tagline: "Whole-school behavioural culture built on clarity and dignity. From assessment to implementation, we build systems that sustain.",
      ctaText: "Request a School Assessment",
      services: [
        "Whole-School PBS Framework Design",
        "Behaviour Policy Development",
        "Functional Behaviour Assessment (FBA)",
        "Individual Behaviour Support Plans",
        "Risk Assessment & Management Plans",
        "Staff Training & CPD",
        "Data-Driven Decision Systems",
        "Multi-Disciplinary Collaboration",
        "Behaviour Strategy for SLT",
        "Behaviour Culture Change Projects",
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
        "ACT-Informed Therapy",
        "Constructional Behavioural Intervention",
        "Emotional Regulation Support",
        "Parent Coaching",
        "Functional Communication Training",
        "Anxiety & Avoidance Patterns",
        "Values-Based Behaviour Building",
        "Trauma-Informed Behaviour Planning",
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
        "Behavioural Assessment at Home",
        "Parent Strategy Coaching",
        "Sibling Dynamics Support",
        "Consistency Planning",
        "Home-School Alignment",
        "Crisis Planning & De-Escalation Strategies",
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
        "Organisational Behaviour Management (OBM)",
        "Behaviour Strategy Design",
        "Culture Change Projects",
        "Staff Performance Systems",
        "Risk Governance Frameworks",
        "Clinical Governance Structures",
        "Safeguarding & Behaviour Audits",
        "Behaviour Data Systems",
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
        "UKBA Supervision",
        "Case Formulation Supervision",
        "Constructional Approach Mentoring",
        "ACT Integration Support",
        "Ethical Consultation",
        "Practitioner Development Pathways",
        "Reflective Practice Groups",
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

    // Education page
    education: {
      title: "PBS בחינוך",
      subtitle: "בתי ספר ומסגרות חינוכיות",
      tagline: "תרבות התנהגותית בית-ספרית בנויה על בהירות וכבוד. מהערכה ליישום, אנחנו בונים מערכות שמחזיקות מעמד.",
      ctaText: "בקשת הערכה בית-ספרית",
      services: [
        "עיצוב מסגרת PBS בית-ספרית",
        "פיתוח מדיניות התנהגות",
        "הערכת התנהגות פונקציונלית (FBA)",
        "תוכניות תמיכה התנהגותית אישיות",
        "תוכניות הערכת סיכונים וניהול",
        "הכשרת צוות ופיתוח מקצועי",
        "מערכות קבלת החלטות מבוססות נתונים",
        "שיתוף פעולה רב-מקצועי",
        "אסטרטגיית התנהגות להנהגה",
        "פרויקטי שינוי תרבות התנהגותית",
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
        "טיפול מבוסס ACT",
        "התערבות התנהגותית קונסטרוקציונית",
        "תמיכה בוויסות רגשי",
        "הדרכת הורים",
        "אימון תקשורת פונקציונלית",
        "דפוסי חרדה והימנעות",
        "בניית התנהגות מבוססת ערכים",
        "תכנון התנהגות מודע טראומה",
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
        "הערכה התנהגותית בבית",
        "הדרכת אסטרטגיות להורים",
        "תמיכה בדינמיקת אחים",
        "תכנון עקביות",
        "התאמה בית-ספר-בית",
        "תכנון משבר ואסטרטגיות הפחתת מתח",
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
        "ניהול התנהגות ארגוני (OBM)",
        "עיצוב אסטרטגיית התנהגות",
        "פרויקטי שינוי תרבותי",
        "מערכות ביצועי צוות",
        "מסגרות ממשל סיכונים",
        "מבני ממשל קליני",
        "ביקורות הגנה והתנהגות",
        "מערכות נתוני התנהגות",
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
        "הנחיית UKBA",
        "הנחיית ניסוח מקרים",
        "חונכות גישה קונסטרוקציונית",
        "תמיכה בשילוב ACT",
        "ייעוץ אתי",
        "מסלולי פיתוח מטפלים",
        "קבוצות פרקטיקה רפלקטיבית",
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
  },
} as const;
