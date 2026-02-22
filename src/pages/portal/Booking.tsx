import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Booking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const portalT = (t as any).portal || {};

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const sessionDate = new Date(`${date}T${time}`);
    const { error } = await supabase.from("sessions").insert({
      client_id: user.id,
      title,
      description: description || null,
      session_date: sessionDate.toISOString(),
      duration_minutes: parseInt(duration),
    });

    setLoading(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
      toast({ title: portalT.bookingSuccess || "Session booked!" });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="pt-28 pb-20">
          <div className="container text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto">
              <CheckCircle2 className="mx-auto text-primary mb-4" size={48} />
              <h1 className="text-3xl mb-3">{portalT.bookingConfirmed || "Session Booked"}</h1>
              <p className="text-muted-foreground mb-6">{portalT.bookingConfirmedText || "We'll confirm your appointment shortly."}</p>
              <Button onClick={() => setSuccess(false)} variant="outline" className="rounded-full">
                {portalT.bookAnother || "Book Another"}
              </Button>
            </motion.div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl mb-2 flex items-center gap-3">
              <Calendar className="text-primary" size={28} />
              {portalT.bookSession || "Book a Session"}
            </h1>
            <p className="text-muted-foreground mb-8">{portalT.bookSubtitle || "Select a time that works for you."}</p>
          </motion.div>

          <form onSubmit={handleBook} className="bg-card rounded-2xl border border-border/50 p-8 space-y-5">
            <div className="space-y-2">
              <Label>{portalT.sessionType || "Session Type"}</Label>
              <Select value={title} onValueChange={setTitle}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder={portalT.selectType || "Select type"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Initial Consultation">Initial Consultation</SelectItem>
                  <SelectItem value="Follow-Up Session">Follow-Up Session</SelectItem>
                  <SelectItem value="Parent Coaching">Parent Coaching</SelectItem>
                  <SelectItem value="Supervision Session">Supervision Session</SelectItem>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{portalT.date || "Date"}</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="rounded-xl" min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="space-y-2">
                <Label>{portalT.time || "Time"}</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{portalT.duration || "Duration"}</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{portalT.notes || "Notes (optional)"}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl" placeholder={portalT.notesPlaceholder || "Anything you'd like to discuss..."} />
            </div>

            <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading || !title || !date || !time}>
              <Clock size={18} className="me-2" />
              {loading ? portalT.booking || "Booking..." : portalT.confirmBooking || "Confirm Booking"}
            </Button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Booking;
