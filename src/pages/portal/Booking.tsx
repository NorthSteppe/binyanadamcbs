import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00"
];

const Booking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const portalT = (t as any).portal || {};

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.from("service_options").select("*").eq("is_active", true).order("display_order")
      .then(({ data }) => { if (data) setServices(data as ServiceOption[]); });
  }, []);

  const handleBook = async () => {
    if (!user || !selectedService || !selectedDate || !selectedTime) return;
    setLoading(true);

    const [h, m] = selectedTime.split(":");
    const sessionDate = new Date(selectedDate);
    sessionDate.setHours(parseInt(h), parseInt(m), 0, 0);

    const { error } = await supabase.from("sessions").insert({
      client_id: user.id,
      title: selectedService.name,
      description: description || null,
      session_date: sessionDate.toISOString(),
      duration_minutes: selectedService.duration_minutes,
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
              <Button onClick={() => { setSuccess(false); setSelectedService(null); setSelectedDate(undefined); setSelectedTime(""); setDescription(""); }} variant="outline" className="rounded-full">
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
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl mb-2 flex items-center gap-3">
              <CalendarIcon className="text-primary" size={28} />
              {portalT.bookSession || "Book a Session"}
            </h1>
            <p className="text-muted-foreground mb-8">{portalT.bookSubtitle || "Select a service, date, and time."}</p>
          </motion.div>

          {/* Step 1: Service selection */}
          <div className="mb-8">
            <Label className="text-base font-semibold mb-3 block">1. Choose a Service</Label>
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={cn(
                    "text-left p-5 rounded-xl border-2 transition-all",
                    selectedService?.id === svc.id
                      ? "border-primary bg-primary/5"
                      : "border-border/50 bg-card hover:border-primary/30"
                  )}
                >
                  <p className="font-semibold text-foreground">{svc.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{svc.description}</p>
                  <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
                    <Clock size={12} /> {svc.duration_minutes} minutes
                  </p>
                </button>
              ))}
            </div>
          </div>

          {selectedService && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Step 2: Date */}
              <div>
                <Label className="text-base font-semibold mb-3 block">2. Pick a Date</Label>
                <div className="bg-card rounded-xl border border-border/50 p-4 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                    className="pointer-events-auto"
                  />
                </div>
              </div>

              {/* Step 3: Time */}
              <div>
                <Label className="text-base font-semibold mb-3 block">3. Choose a Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={cn(
                        "py-2.5 px-3 rounded-lg text-sm font-medium border transition-all",
                        selectedTime === slot
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/50 bg-card text-foreground hover:border-primary/30"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedService && selectedDate && selectedTime && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border/50 p-6">
              <Label className="text-base font-semibold mb-3 block">4. Additional Notes (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl mb-4"
                placeholder="Anything you'd like to discuss..."
              />
              <div className="bg-muted rounded-xl p-4 mb-4 text-sm">
                <p className="font-semibold text-foreground">{selectedService.name}</p>
                <p className="text-muted-foreground">
                  {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} at {selectedTime} · {selectedService.duration_minutes} min
                </p>
              </div>
              <Button onClick={handleBook} className="w-full rounded-full" size="lg" disabled={loading}>
                <CalendarIcon size={18} className="me-2" />
                {loading ? "Booking..." : "Confirm Booking"}
              </Button>
            </motion.div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Booking;
