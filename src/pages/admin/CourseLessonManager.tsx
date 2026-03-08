import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowLeft, Video, FileText, Upload } from "lucide-react";
import { motion } from "framer-motion";

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string | null;
  duration_minutes: number;
  display_order: number;
  is_preview: boolean;
  created_at: string;
}

interface Resource {
  id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

const emptyLesson = { title: "", description: "", duration_minutes: 0, display_order: 0, is_preview: false };

const CourseLessonManager = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const qc = useQueryClient();
  const [lessonOpen, setLessonOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceTitle, setResourceTitle] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);
  const [selectedLessonForResource, setSelectedLessonForResource] = useState<string | null>(null);

  const { data: course } = useQuery({
    queryKey: ["admin-course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").eq("id", courseId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["admin-lessons", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", courseId!)
        .order("display_order");
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!courseId,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["admin-resources", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_resources")
        .select("*")
        .eq("course_id", courseId!)
        .order("created_at");
      if (error) throw error;
      return data as Resource[];
    },
    enabled: !!courseId,
  });

  const lessonMutation = useMutation({
    mutationFn: async (values: typeof lessonForm) => {
      let videoUrl: string | null = editingLesson?.video_url || null;

      if (videoFile) {
        setUploadingVideo(true);
        const ext = videoFile.name.split(".").pop();
        const path = `videos/${courseId}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("course-content").upload(path, videoFile);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("course-content").getPublicUrl(path);
        videoUrl = urlData.publicUrl;
        setUploadingVideo(false);
      }

      const payload = {
        course_id: courseId!,
        title: values.title,
        description: values.description,
        video_url: videoUrl,
        duration_minutes: values.duration_minutes,
        display_order: values.display_order,
        is_preview: values.is_preview,
      };

      if (editingLesson) {
        const { error } = await supabase.from("course_lessons").update(payload).eq("id", editingLesson.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("course_lessons").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-lessons", courseId] });
      toast.success(editingLesson ? "Lesson updated" : "Lesson created");
      setLessonOpen(false);
      setEditingLesson(null);
      setLessonForm(emptyLesson);
      setVideoFile(null);
    },
    onError: (e: Error) => { setUploadingVideo(false); toast.error(e.message); },
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("course_lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-lessons", courseId] });
      toast.success("Lesson deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const uploadResource = async () => {
    if (!resourceFile || !resourceTitle) return;
    setUploadingResource(true);
    try {
      const ext = resourceFile.name.split(".").pop();
      const path = `resources/${courseId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("course-content").upload(path, resourceFile);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("course-content").getPublicUrl(path);

      const { error } = await supabase.from("course_resources").insert({
        course_id: courseId!,
        lesson_id: selectedLessonForResource || null,
        title: resourceTitle,
        file_url: urlData.publicUrl,
        file_type: ext || "file",
      });
      if (error) throw error;

      qc.invalidateQueries({ queryKey: ["admin-resources", courseId] });
      toast.success("Resource uploaded");
      setResourceFile(null);
      setResourceTitle("");
      setSelectedLessonForResource(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploadingResource(false);
    }
  };

  const deleteResource = async (id: string) => {
    const { error } = await supabase.from("course_resources").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      qc.invalidateQueries({ queryKey: ["admin-resources", courseId] });
      toast.success("Resource deleted");
    }
  };

  const openEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      duration_minutes: lesson.duration_minutes,
      display_order: lesson.display_order,
      is_preview: lesson.is_preview,
    });
    setVideoFile(null);
    setLessonOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-5xl">
          <Link to="/admin/courses" className="text-muted-foreground text-sm flex items-center gap-1 mb-6 hover:text-foreground transition-colors">
            <ArrowLeft size={14} /> Back to Courses
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-serif text-foreground">{course?.title || "Course"} — Lessons</h1>
            <p className="text-muted-foreground text-sm font-light mt-1">Manage lessons, videos, and resources</p>
          </motion.div>

          {/* Lessons */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif text-foreground">Lessons</h2>
            <Button size="sm" onClick={() => { setEditingLesson(null); setLessonForm(emptyLesson); setVideoFile(null); setLessonOpen(true); }} className="gap-2">
              <Plus size={14} /> Add Lesson
            </Button>
          </div>

          {lessons.length === 0 ? (
            <Card className="border-dashed mb-8">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Video size={32} className="mx-auto mb-3 opacity-40" />
                <p>No lessons yet. Add your first lesson above.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 mb-8">
              {lessons.map((lesson, i) => (
                <Card key={lesson.id} className="hover:border-primary/30 transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-card-foreground text-sm truncate">{lesson.title}</p>
                        {lesson.is_preview && (
                          <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">Preview</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {lesson.duration_minutes > 0 ? `${lesson.duration_minutes} min` : "No duration set"}
                        {lesson.video_url ? " · Video uploaded" : " · No video"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEditLesson(lesson)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                        if (confirm("Delete this lesson?")) deleteLesson.mutate(lesson.id);
                      }}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Resources */}
          <h2 className="text-lg font-serif text-foreground mb-4">Course Resources</h2>
          <Card className="mb-4">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>Resource Title</Label>
                  <Input value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} placeholder="e.g. Worksheet 1" />
                </div>
                <div>
                  <Label>File</Label>
                  <Input type="file" onChange={(e) => setResourceFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <Label>Attach to Lesson (optional)</Label>
                  <select
                    className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                    value={selectedLessonForResource || ""}
                    onChange={(e) => setSelectedLessonForResource(e.target.value || null)}
                  >
                    <option value="">Course-level</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button size="sm" onClick={uploadResource} disabled={uploadingResource || !resourceFile || !resourceTitle} className="gap-2">
                <Upload size={14} /> {uploadingResource ? "Uploading…" : "Upload Resource"}
              </Button>
            </CardContent>
          </Card>

          {resources.length > 0 && (
            <div className="space-y-2">
              {resources.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <FileText size={16} className="text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.file_type} · {r.lesson_id ? `Lesson: ${lessons.find(l => l.id === r.lesson_id)?.title || "Unknown"}` : "Course-level"}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                      if (confirm("Delete resource?")) deleteResource(r.id);
                    }}>
                      <Trash2 size={14} />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Lesson Dialog */}
          <Dialog open={lessonOpen} onOpenChange={setLessonOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingLesson ? "Edit Lesson" : "New Lesson"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); lessonMutation.mutate(lessonForm); }} className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} rows={3} />
                </div>
                <div>
                  <Label>Video File</Label>
                  <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                  {editingLesson?.video_url && !videoFile && (
                    <p className="text-xs text-muted-foreground mt-1">Current video uploaded. Upload a new one to replace.</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input type="number" value={lessonForm.duration_minutes} onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label>Display Order</Label>
                    <Input type="number" value={lessonForm.display_order} onChange={(e) => setLessonForm({ ...lessonForm, display_order: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={lessonForm.is_preview} onCheckedChange={(v) => setLessonForm({ ...lessonForm, is_preview: v })} />
                  <Label>Free Preview (visible without purchase)</Label>
                </div>
                <Button type="submit" disabled={lessonMutation.isPending || uploadingVideo} className="w-full">
                  {uploadingVideo ? "Uploading video…" : lessonMutation.isPending ? "Saving…" : editingLesson ? "Update Lesson" : "Create Lesson"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CourseLessonManager;
