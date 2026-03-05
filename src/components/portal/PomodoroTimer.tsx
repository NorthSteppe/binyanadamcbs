import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Settings, X, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type TimerMode = "focus" | "short-break" | "long-break";

interface TimerSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
};

const MODE_CONFIG: Record<TimerMode, { label: string; colorClass: string; ringClass: string }> = {
  focus: { label: "Focus", colorClass: "text-primary", ringClass: "stroke-primary" },
  "short-break": { label: "Short Break", colorClass: "text-emerald-500", ringClass: "stroke-emerald-500" },
  "long-break": { label: "Long Break", colorClass: "text-blue-500", ringClass: "stroke-blue-500" },
};

const PomodoroTimer = () => {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem("pomodoro-settings");
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  const [mode, setMode] = useState<TimerMode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalSeconds = (() => {
    switch (mode) {
      case "focus": return settings.focusMinutes * 60;
      case "short-break": return settings.shortBreakMinutes * 60;
      case "long-break": return settings.longBreakMinutes * 60;
    }
  })();

  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  useEffect(() => {
    localStorage.setItem("pomodoro-settings", JSON.stringify(settings));
  }, [settings]);

  const playSound = useCallback(() => {
    if (!settings.soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = "sine";
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.stop(ctx.currentTime + 0.8);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1000;
        osc2.type = "sine";
        gain2.gain.value = 0.3;
        osc2.start();
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);
        osc2.stop(ctx.currentTime + 1.6);
      }, 300);
    } catch {}
  }, [settings.soundEnabled]);

  const switchMode = useCallback((newMode: TimerMode, autoStart = false) => {
    setMode(newMode);
    const dur = newMode === "focus" ? settings.focusMinutes : newMode === "short-break" ? settings.shortBreakMinutes : settings.longBreakMinutes;
    setSecondsLeft(dur * 60);
    setIsRunning(autoStart);
  }, [settings]);

  const handleTimerComplete = useCallback(() => {
    playSound();
    if (mode === "focus") {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      if (newCount % settings.longBreakInterval === 0) {
        switchMode("long-break", settings.autoStartBreaks);
      } else {
        switchMode("short-break", settings.autoStartBreaks);
      }
    } else {
      switchMode("focus", settings.autoStartFocus);
    }
  }, [mode, completedPomodoros, settings, playSound, switchMode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, handleTimerComplete]);

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const config = MODE_CONFIG[mode];

  // SVG circle params
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-muted rounded-full p-1">
        {(["focus", "short-break", "long-break"] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => { if (!isRunning) switchMode(m); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {MODE_CONFIG[m].label}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" width="288" height="288" viewBox="0 0 288 288">
          <circle cx="144" cy="144" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <motion.circle
            cx="144" cy="144" r={radius} fill="none"
            className={config.ringClass}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>
        <div className="flex flex-col items-center z-10">
          <span className="text-6xl font-mono font-bold tabular-nums text-foreground tracking-tight">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className={`text-sm font-medium mt-1 ${config.colorClass}`}>{config.label}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={reset}>
          <RotateCcw size={18} />
        </Button>
        <Button
          size="icon"
          className="rounded-full h-16 w-16 shadow-lg"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
        </Button>
        <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={() => setShowSettings(!showSettings)}>
          <Settings size={18} />
        </Button>
      </div>

      {/* Pomodoro count */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Completed:</span>
        <div className="flex gap-1.5">
          {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < (completedPomodoros % settings.longBreakInterval) ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-foreground ml-1">{completedPomodoros}</span>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-sm overflow-hidden"
          >
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Timer Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Focus Duration: {settings.focusMinutes} min</Label>
                  <Slider
                    value={[settings.focusMinutes]}
                    onValueChange={([v]) => { setSettings(s => ({ ...s, focusMinutes: v })); if (mode === "focus" && !isRunning) setSecondsLeft(v * 60); }}
                    min={5} max={60} step={5}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Short Break: {settings.shortBreakMinutes} min</Label>
                  <Slider
                    value={[settings.shortBreakMinutes]}
                    onValueChange={([v]) => { setSettings(s => ({ ...s, shortBreakMinutes: v })); if (mode === "short-break" && !isRunning) setSecondsLeft(v * 60); }}
                    min={1} max={15} step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Long Break: {settings.longBreakMinutes} min</Label>
                  <Slider
                    value={[settings.longBreakMinutes]}
                    onValueChange={([v]) => { setSettings(s => ({ ...s, longBreakMinutes: v })); if (mode === "long-break" && !isRunning) setSecondsLeft(v * 60); }}
                    min={5} max={30} step={5}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Long break every {settings.longBreakInterval} pomodoros</Label>
                  <Slider
                    value={[settings.longBreakInterval]}
                    onValueChange={([v]) => setSettings(s => ({ ...s, longBreakInterval: v }))}
                    min={2} max={6} step={1}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Auto-start breaks</Label>
                  <Switch checked={settings.autoStartBreaks} onCheckedChange={(v) => setSettings(s => ({ ...s, autoStartBreaks: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Auto-start focus</Label>
                  <Switch checked={settings.autoStartFocus} onCheckedChange={(v) => setSettings(s => ({ ...s, autoStartFocus: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Sound notification</Label>
                  <Switch checked={settings.soundEnabled} onCheckedChange={(v) => setSettings(s => ({ ...s, soundEnabled: v }))} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PomodoroTimer;
