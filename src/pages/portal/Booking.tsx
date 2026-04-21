import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, CheckCircle2, CreditCard, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { generateMeetingLink, type MeetingPlatform } from "@/utils/meetingLinks";

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_cents: number;
  stripe_price_id: string | null;
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
  const portalT = (t as any).portalBooking || {};
  const [searchParams] = useSearchParams();

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [platform, setPlatform] = useState<MeetingPlatform>("in_person");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") setSuccess(true);
    if (searchParams.get("canceled") === "true") setCanceled(true);
  }, [searchParams]);

  useEffect(() => {
    supabase.from("service_options").select("*").eq("is_active", true).order("display_order")
      .then(({ data }) => { if (data) setServices(data as unknown as ServiceOption[]); });
  }, []);

  const handleBook = async () => {
    if (!user || !selectedService || !selectedDate || !selectedTime) return;
    setLoading(true);

    const isPaid = selectedService.price_cents > 0 && selectedService.stripe_price_id;

    if (isPaid) {
      // Redirect to Stripe Checkout
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          service_option_id: selectedService.id,
          date: selectedDate.toISOString(),
          time: selectedTime,
          description,
        },
      });

      setLoading(false);
      if (error || data?.error) {
        toast({ title: "Payment failed", description: data?.error || error?.message, variant: "destructive" });
      } else if (data?.url) {
        window.open(data.url, "_blank");
      }
    } else {
      // Free service — book directly
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
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setCanceled(false);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime("");
    setDescription("");
    // Clear URL params
    window.history.replaceState({}, "", "/portal/booking");
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="pt-28 pb-20">
          <div className="container text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto">
              <CheckCircle2 className="mx-auto text-primary mb-4" size={48} />
              <h1 className="text-3xl mb-3">{portalT.bookingConfirmed}</h1>
              <p className="text-muted-foreground mb-6">{portalT.bookingConfirmedText}</p>
              <Button onClick={resetForm} variant="outline" className="rounded-full">
                {portalT.bookAnother}
              </Button>
            </motion.div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (canceled) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="pt-28 pb-20">
          <div className="container text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto">
              <XCircle className="mx-auto text-destructive mb-4" size={48} />
              <h1 className="text-3xl mb-3">{portalT.paymentCancelled}</h1>
              <p className="text-muted-foreground mb-6">{portalT.paymentCancelledText}</p>
              <Button onClick={resetForm} variant="outline" className="rounded-full">
                {portalT.tryAgain}
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
              {portalT.bookASession}
            </h1>
            <p className="text-muted-foreground mb-8">{portalT.bookSubtitle}</p>
          </motion.div>

          {/* Step 1: Service selection */}
          <div className="mb-8">
            <Label className="text-base font-semibold mb-3 block">{portalT.step1}</Label>
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={cn(
                    "text-start p-5 rounded-xl border-2 transition-all",
                    selectedService?.id === svc.id
                      ? "border-primary bg-primary/5"
                      : "border-border/50 bg-card hover:border-primary/30"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-foreground">{svc.name}</p>
                    {svc.price_cents > 0 && (
                      <span className="text-sm font-bold text-primary">
                        £{(svc.price_cents / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{svc.description}</p>
                  <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
                    <Clock size={12} /> {svc.duration_minutes} {portalT.minutes}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {selectedService && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <Label className="text-base font-semibold mb-3 block">{portalT.step2}</Label>
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
              <div>
                <Label className="text-base font-semibold mb-3 block">{portalT.step3}</Label>
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
              <Label className="text-base font-semibold mb-3 block">{portalT.step4}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl mb-4"
                placeholder={portalT.notesPlaceholder}
              />
              <div className="bg-muted rounded-xl p-4 mb-4 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">{selectedService.name}</p>
                    <p className="text-muted-foreground">
                      {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} at {selectedTime} · {selectedService.duration_minutes} min
                    </p>
                  </div>
                  {selectedService.price_cents > 0 && (
                    <p className="text-lg font-bold text-primary">£{(selectedService.price_cents / 100).toFixed(2)}</p>
                  )}
                </div>
              </div>
              <Button onClick={handleBook} className="w-full rounded-full" size="lg" disabled={loading}>
                {selectedService.price_cents > 0 ? (
                  <>
                    <CreditCard size={18} className="me-2" />
                    {loading ? portalT.redirecting : (portalT.payAndBook || "").replace("{{price}}", (selectedService.price_cents / 100).toFixed(2))}
                  </>
                ) : (
                  <>
                    <CalendarIcon size={18} className="me-2" />
                    {loading ? portalT.booking : portalT.confirmBooking}
                  </>
                )}
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
