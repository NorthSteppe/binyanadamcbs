import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Calendar, ListTodo, Sparkles, FolderOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingAIChat from "@/components/FloatingAIChat";
import TaskBoard from "@/components/productivity/TaskBoard";
import PersonalCalendar from "@/components/productivity/PersonalCalendar";
import DailyPlanner from "@/components/productivity/DailyPlanner";
import ProjectManager from "@/components/productivity/ProjectManager";

const Productivity = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1 flex items-center gap-3">
              <LayoutDashboard className="text-primary" size={28} />
              Productivity Hub
            </h1>
            <p className="text-muted-foreground mb-8">
              Manage tasks, plan your day with AI, and stay focused — all in one place.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar — Projects */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card border border-border/50 rounded-2xl p-4">
                <ProjectManager />
              </div>
              <div className="bg-card border border-border/50 rounded-2xl p-4">
                <DailyPlanner />
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="board" className="space-y-4">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="board" className="gap-1.5"><ListTodo size={14} /> Board</TabsTrigger>
                  <TabsTrigger value="calendar" className="gap-1.5"><Calendar size={14} /> Calendar</TabsTrigger>
                  <TabsTrigger value="planner" className="gap-1.5"><Sparkles size={14} /> AI Planner</TabsTrigger>
                </TabsList>

                <TabsContent value="board">
                  <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-6">
                    <TaskBoard />
                  </div>
                </TabsContent>

                <TabsContent value="calendar">
                  <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-6">
                    <PersonalCalendar />
                  </div>
                </TabsContent>

                <TabsContent value="planner">
                  <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-6">
                    <DailyPlanner />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <FloatingAIChat />
    </div>
  );
};

export default Productivity;
