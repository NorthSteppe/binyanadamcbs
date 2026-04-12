import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { ClipboardList, Activity, Target, Brain, BarChart3, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const tools = [
  {
    label: "ABC Data Sheet",
    path: "/staff/clinical/abc",
    icon: ClipboardList,
    description: "Record Antecedent–Behaviour–Consequence chains for functional analysis",
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Functional Assessment",
    path: "/staff/clinical/functional-assessment",
    icon: Activity,
    description: "Comprehensive functional behaviour assessment with setting events & establishing operations",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    label: "Values Bull's Eye",
    path: "/staff/clinical/values-bullseye",
    icon: Target,
    description: "Rate values importance and consistency across life domains",
    color: "bg-accent text-accent-foreground",
  },
  {
    label: "Hexaflex Tracker",
    path: "/staff/clinical/hexaflex",
    icon: Brain,
    description: "Track the six core ACT processes of psychological flexibility",
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Behaviour Tracking Log",
    path: "/staff/clinical/behaviour-log",
    icon: BarChart3,
    description: "Daily frequency, intensity, and context tracking for target behaviours",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    label: "Case Formulation",
    path: "/staff/clinical/case-formulation",
    icon: FileText,
    description: "Structured CBS case conceptualisation with functional analysis summary",
    color: "bg-accent text-accent-foreground",
  },
];

const ClinicalTools = () => {
  const { t } = useLanguage();
  const portalT = (t as any).staffFunctional || {};
  const staffT = (t as any).staffClinical || {};
  const advT = (t as any).advancedModels || {};

    const tools = [
        {
            label: staffT.abcTitle || "ABC Data Sheet",
            path: "/staff/clinical/abc",
            icon: ClipboardList,
            description: staffT.abcDesc || "Record Antecedent–Behaviour–Consequence chains for functional analysis",
            color: "bg-primary/10 text-primary",
        },
        {
            label: portalT.title || "Functional Assessment",
            path: "/staff/clinical/functional-assessment",
            icon: Activity,
            description: portalT.desc || "Comprehensive functional behaviour assessment with setting events & establishing operations",
            color: "bg-secondary text-secondary-foreground",
        },
        {
            label: advT.bullseyeTitle || "Values Bull's Eye",
            path: "/staff/clinical/values-bullseye",
            icon: Target,
            description: advT.bullseyeDesc || "Rate values importance and consistency across life domains",
            color: "bg-accent text-accent-foreground",
        },
        {
            label: advT.hexaflexTitle || "Hexaflex Tracker",
            path: "/staff/clinical/hexaflex",
            icon: Brain,
            description: advT.hexaflexDesc || "Track the six core ACT processes of psychological flexibility",
            color: "bg-primary/10 text-primary",
        },
        {
            label: staffT.logTitle || "Behaviour Tracking Log",
            path: "/staff/clinical/behaviour-log",
            icon: BarChart3,
            description: staffT.logDesc || "Daily frequency, intensity, and context tracking for target behaviours",
            color: "bg-secondary text-secondary-foreground",
        },
        {
            label: staffT.caseTitle || "Case Formulation",
            path: "/staff/clinical/case-formulation",
            icon: FileText,
            description: staffT.caseDesc || "Structured CBS case conceptualisation with functional analysis summary",
            color: "bg-accent text-accent-foreground",
        },
    ];
    

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                <ClipboardList size={22} />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif text-foreground">{portalT.clinicalDataTitle || "Clinical Data Collection"}</h1>
            </div>
            <p className="text-muted-foreground mb-10 ms-14 font-light">{portalT.clinicalDataDesc || "Contextual Behaviour Science tools for assessment, tracking, and case formulation"}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.path}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link
                  to={tool.path}
                  className="group bg-card border border-border/50 p-5 flex items-start gap-4 hover:border-primary/30 hover:shadow-sm transition-all block h-full"
                >
                  <div className={`${tool.color} rounded-lg p-3 shrink-0`}>
                    <tool.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">{tool.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tool.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ClinicalTools;
