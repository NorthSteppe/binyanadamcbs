import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePreferences } from "@/hooks/usePreferences";
import { useAuth } from "@/hooks/useAuth";
import NotificationSettings from "@/components/portal/NotificationSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings as SettingsIcon, Moon, Sun, Monitor, Bell, Globe, LayoutDashboard, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

const WIDGET_OPTIONS = [
  { id: "tasks", label: "My Tasks" },
  { id: "calendar", label: "Calendar" },
  { id: "messages", label: "Messages" },
  { id: "linear", label: "Practice Tasks (Linear)" },
  { id: "notifications", label: "Recent Notifications" },
];

const Settings = () => {
  const { prefs, updatePrefs } = usePreferences();
  const { isStaff } = useAuth();

  const toggleWidget = (id: string) => {
    const current = prefs.dashboardWidgets;
    updatePrefs({
      dashboardWidgets: current.includes(id) ? current.filter(w => w !== id) : [...current, id],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                <SettingsIcon size={22} />
              </div>
              <h1 className="text-3xl font-display tracking-tight text-foreground">Settings</h1>
            </div>
            <p className="text-muted-foreground mb-8 ml-14">Your preferences are saved automatically.</p>
          </motion.div>

          <div className="space-y-6">
            {/* Theme */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {prefs.theme === "dark" ? <Moon size={18} /> : prefs.theme === "light" ? <Sun size={18} /> : <Monitor size={18} />}
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label className="text-xs">Theme</Label>
                  <Select value={prefs.theme} onValueChange={(v) => updatePrefs({ theme: v as any })}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System Default</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Language */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe size={18} />
                  Language
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={prefs.language} onValueChange={(v) => updatePrefs({ language: v as any })}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="he">עברית (Hebrew)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Notification Channels */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell size={18} />
                  Notification Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">Choose how you want to receive notifications.</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">In-App Notifications</Label>
                    <Switch checked={prefs.notifyInApp} onCheckedChange={(v) => updatePrefs({ notifyInApp: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Email Notifications</Label>
                    <Switch checked={prefs.notifyEmail} onCheckedChange={(v) => updatePrefs({ notifyEmail: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Telegram Notifications</Label>
                    <Switch checked={prefs.notifyTelegram} onCheckedChange={(v) => updatePrefs({ notifyTelegram: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Browser Push Notifications</Label>
                    <Switch checked={prefs.notifyPush} onCheckedChange={(v) => updatePrefs({ notifyPush: v })} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Telegram Setup (only if enabled) */}
            {prefs.notifyTelegram && isStaff && <NotificationSettings />}

            {/* Mobile */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone size={18} />
                  Mobile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Bottom Navigation Bar</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Show a floating nav bar at the bottom of the screen.</p>
                  </div>
                  <Switch
                    checked={prefs.mobileBottomNav}
                    onCheckedChange={(v) => updatePrefs({ mobileBottomNav: v })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Widgets */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  Dashboard Layout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">Choose which widgets appear on your dashboard.</p>
                <div className="space-y-2">
                  {WIDGET_OPTIONS.map(w => (
                    <div key={w.id} className="flex items-center gap-3">
                      <Checkbox
                        id={`widget-${w.id}`}
                        checked={prefs.dashboardWidgets.includes(w.id)}
                        onCheckedChange={() => toggleWidget(w.id)}
                      />
                      <Label htmlFor={`widget-${w.id}`} className="text-sm cursor-pointer">{w.label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Settings;
