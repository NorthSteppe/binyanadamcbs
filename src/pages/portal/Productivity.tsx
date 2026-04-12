import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Calendar, ListTodo, Maximize2, FolderOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TaskBoard from "@/components/productivity/TaskBoard";
import PersonalCalendar from "@/components/productivity/PersonalCalendar";
import ProjectManager from "@/components/productivity/ProjectManager";
import AISuggestionsPanel from "@/components/productivity/AISuggestionsPanel";
import { useLanguage } from "@/i18n/LanguageContext";

const Productivity = () => {
  const { t } = useLanguage();
  const portalT = (t as any).portalProductivity || {};
  const [searchParams] = useSearchParams();
  const [calendarFullscreen, setCalendarFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "board");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Fullscreen Calendar Overlay */}
      <AnimatePresence>
        {calendarFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background overflow-auto"
          >
            <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
              <PersonalCalendar
                isFullscreen={true}
                onToggleFullscreen={() => setCalendarFullscreen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="pt-28 pb-20">
        <div className="container max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1 flex items-center gap-3">
              <LayoutDashboard className="text-primary" size={28} />{portalT.title || "Productivity Hub"}</h1>
            <p className="text-muted-foreground mb-8">{portalT.subtitle || "Manage tasks, plan your day with AI, and stay focused — all in one place."}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar — Projects + AI Suggestions */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-card border border-border/50 rounded-2xl p-4">
                <ProjectManager
                  selectedProjectId={selectedProjectId}
                  onSelectProject={setSelectedProjectId}
                />
              </div>
              <div className="bg-card border border-border/50 rounded-2xl p-4">
                <AISuggestionsPanel activeTab={activeTab} />
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-9">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="board" className="gap-1.5"><ListTodo size={14} /> {portalT.board || "Board"}</TabsTrigger>
                  <TabsTrigger value="calendar" className="gap-1.5"><Calendar size={14} /> {portalT.calendar || "Calendar"}</TabsTrigger>
                </TabsList>

                <TabsContent value="board">
                  <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-6">
                    <TaskBoard filterProjectId={selectedProjectId} />
                  </div>
                </TabsContent>

                <TabsContent value="calendar">
                  <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-6">
                    <PersonalCalendar
                      isFullscreen={false}
                      onToggleFullscreen={() => setCalendarFullscreen(true)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Productivity;
