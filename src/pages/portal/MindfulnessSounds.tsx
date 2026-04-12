import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, Timer, Flame, Wind, Waves, CloudRain, Trees } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useLanguage } from "@/i18n/LanguageContext";
import Footer from "@/components/Footer";

type SoundType = "fire" | "wind" | "water" | "rain" | "forest";

interface SoundConfig {
  id: SoundType;
  label: string;
  icon: typeof Flame;
  color: string;
  bgGradient: string;
  description: string;
}

const sounds: SoundConfig[] = [
  { id: "fire", label: "Crackling Fire", icon: Flame, color: "text-orange-500", bgGradient: "from-orange-950/40 to-red-950/20", description: "Warm crackling flames" },
  { id: "wind", label: "Gentle Wind", icon: Wind, color: "text-sky-400", bgGradient: "from-sky-950/40 to-blue-950/20", description: "Soft breeze through trees" },
  { id: "water", label: "Water Stream", icon: Waves, color: "text-cyan-400", bgGradient: "from-cyan-950/40 to-teal-950/20", description: "Flowing mountain stream" },
  { id: "rain", label: "Rainfall", icon: CloudRain, color: "text-indigo-400", bgGradient: "from-indigo-950/40 to-slate-950/20", description: "Gentle rain on leaves" },
  { id: "forest", label: "Forest Ambience", icon: Trees, color: "text-emerald-400", bgGradient: "from-emerald-950/40 to-green-950/20", description: "Birds and rustling leaves" },
];

const TIMER_OPTIONS = [1, 3, 5, 10];

// Web Audio API sound generators
function createFireSound(ctx: AudioContext, gainNode: GainNode) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
    if (i > 0) data[i] = data[i] * 0.3 + data[i - 1] * 0.7;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 400;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 80;

  // Crackle modulation
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 3;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 100;
  lfo.connect(lfoGain);
  lfoGain.connect(lp.frequency);
  lfo.start();

  source.connect(hp).connect(lp).connect(gainNode);
  source.start();
  return { source, lfo, stop: () => { source.stop(); lfo.stop(); } };
}

function createWindSound(ctx: AudioContext, gainNode: GainNode) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
    if (i > 0) data[i] = data[i] * 0.2 + data[i - 1] * 0.8;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 600;
  bp.Q.value = 0.5;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.15;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 300;
  lfo.connect(lfoGain);
  lfoGain.connect(bp.frequency);
  lfo.start();

  source.connect(bp).connect(gainNode);
  source.start();
  return { source, lfo, stop: () => { source.stop(); lfo.stop(); } };
}

function createWaterSound(ctx: AudioContext, gainNode: GainNode) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
    if (i > 0) data[i] = data[i] * 0.15 + data[i - 1] * 0.85;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2000;
  bp.Q.value = 0.3;

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 4000;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.5;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 800;
  lfo.connect(lfoGain);
  lfoGain.connect(bp.frequency);
  lfo.start();

  source.connect(bp).connect(lp).connect(gainNode);
  source.start();
  return { source, lfo, stop: () => { source.stop(); lfo.stop(); } };
}

function createRainSound(ctx: AudioContext, gainNode: GainNode) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 8000;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1000;

  source.connect(hp).connect(lp).connect(gainNode);
  source.start();
  return { source, stop: () => source.stop() };
}

function createForestSound(ctx: AudioContext, gainNode: GainNode) {
  // Base: gentle filtered noise
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
    if (i > 0) data[i] = data[i] * 0.1 + data[i - 1] * 0.9;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 3000;
  bp.Q.value = 0.2;

  const baseGain = ctx.createGain();
  baseGain.gain.value = 0.4;

  // Bird chirps using oscillators
  const birdOsc = ctx.createOscillator();
  birdOsc.type = "sine";
  birdOsc.frequency.value = 2400;
  const birdGain = ctx.createGain();
  birdGain.gain.value = 0;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 3;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.08;
  lfo.connect(lfoGain);
  lfoGain.connect(birdGain.gain);
  lfo.start();

  const birdMod = ctx.createOscillator();
  birdMod.frequency.value = 0.3;
  const birdModGain = ctx.createGain();
  birdModGain.gain.value = 600;
  birdMod.connect(birdModGain);
  birdModGain.connect(birdOsc.frequency);
  birdMod.start();

  source.connect(bp).connect(baseGain).connect(gainNode);
  birdOsc.connect(birdGain).connect(gainNode);
  source.start();
  birdOsc.start();

  return { source, stop: () => { source.stop(); birdOsc.stop(); lfo.stop(); birdMod.stop(); } };
}

const soundCreators: Record<SoundType, (ctx: AudioContext, gain: GainNode) => { stop: () => void }> = {
  fire: createFireSound,
  wind: createWindSound,
  water: createWaterSound,
  rain: createRainSound,
  forest: createForestSound,
};

const MindfulnessSounds = () => {
  const { t } = useLanguage();
  const portalT = (t as any).portalMindfulness || {};

  const sounds: SoundConfig[] = [
    { id: "fire", label: portalT.fireTitle || "Crackling Fire", icon: Flame, color: "text-orange-500", bgGradient: "from-orange-950/40 to-red-950/20", description: portalT.fireDesc || "Warm crackling flames" },
    { id: "wind", label: portalT.windTitle || "Gentle Wind", icon: Wind, color: "text-sky-400", bgGradient: "from-sky-950/40 to-blue-950/20", description: portalT.windDesc || "Soft breeze through trees" },
    { id: "water", label: portalT.waterTitle || "Water Stream", icon: Waves, color: "text-cyan-400", bgGradient: "from-cyan-950/40 to-teal-950/20", description: portalT.waterDesc || "Flowing mountain stream" },
    { id: "rain", label: portalT.rainTitle || "Rainfall", icon: CloudRain, color: "text-indigo-400", bgGradient: "from-indigo-950/40 to-slate-950/20", description: portalT.rainDesc || "Gentle rain on leaves" },
    { id: "forest", label: portalT.forestTitle || "Forest Ambience", icon: Trees, color: "text-emerald-400", bgGradient: "from-emerald-950/40 to-green-950/20", description: portalT.forestDesc || "Birds and rustling leaves" },
  ];

  const [activeSound, setActiveSound] = useState<SoundType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const soundRef = useRef<{ stop: () => void } | null>(null);
  const timerRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (soundRef.current) { try { soundRef.current.stop(); } catch {} soundRef.current = null; }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
    }
    audioCtxRef.current = null;
    gainRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  // Volume control
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 && isPlaying && timerRef.current) {
      stopSound();
    }
  }, [timeLeft]);

  const playSound = (type: SoundType) => {
    cleanup();

    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = volume / 100;
    gain.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainRef.current = gain;

    const sound = soundCreators[type](ctx, gain);
    soundRef.current = sound;
    setActiveSound(type);
    setIsPlaying(true);

    const totalSeconds = timerMinutes * 60;
    setTimeLeft(totalSeconds);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopSound = () => {
    cleanup();
    setIsPlaying(false);
    setActiveSound(null);
    setTimeLeft(0);
  };

  const togglePlay = (type: SoundType) => {
    if (activeSound === type && isPlaying) {
      stopSound();
    } else {
      playSound(type);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const activeSoundConfig = sounds.find((s) => s.id === activeSound);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{portalT.title || "Mindfulness Sounds"}</h1>
              <p className="text-muted-foreground">{portalT.subtitle || "Take a moment. Breathe. Listen."}</p>
            </div>
          </motion.div>

          {/* Timer selector */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Timer size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{portalT.duration || "Duration:"}</span>
            <div className="flex gap-1.5">
              {TIMER_OPTIONS.map((m) => (
                <Button
                  key={m}
                  variant={timerMinutes === m ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8 w-12"
                  onClick={() => setTimerMinutes(m)}
                  disabled={isPlaying}
                >
                  {m} {portalT.min || "min"}
                </Button>
              ))}
            </div>
          </div>

          {/* Active player */}
          <AnimatePresence>
            {isPlaying && activeSoundConfig && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`rounded-3xl bg-gradient-to-br ${activeSoundConfig.bgGradient} border border-border/30 p-8 mb-8 text-center`}
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-background/10 mb-4 ${activeSoundConfig.color}`}>
                  <activeSoundConfig.icon size={36} className="animate-pulse" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-1">{activeSoundConfig.label}</h2>
                <p className="text-4xl font-mono font-bold text-foreground/90 mb-4">{formatTime(timeLeft)}</p>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full w-14 h-14"
                    onClick={stopSound}
                  >
                    <Pause size={24} />
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
                  <Volume2 size={16} className="text-muted-foreground shrink-0" />
                  <Slider
                    value={[volume]}
                    onValueChange={(v) => setVolume(v[0])}
                    max={100}
                    step={1}
                    className="w-48"
                  />
                  <span className="text-xs text-muted-foreground w-8">{volume}%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sound cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sounds.map((sound, i) => {
              const isActive = activeSound === sound.id && isPlaying;
              return (
                <motion.div
                  key={sound.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <button
                    onClick={() => togglePlay(sound.id)}
                    className={`w-full rounded-2xl border p-6 text-start transition-all hover:shadow-md ${
                      isActive
                        ? "border-primary bg-primary/5 shadow-lg"
                        : "border-border/50 bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${
                      isActive ? "bg-primary/20" : "bg-muted"
                    }`}>
                      <sound.icon size={22} className={isActive ? sound.color : "text-muted-foreground"} />
                    </div>
                    <p className="font-semibold text-card-foreground mb-1">{sound.label}</p>
                    <p className="text-xs text-muted-foreground">{sound.description}</p>
                    {isActive && (
                      <Badge variant="secondary" className="mt-3 text-[10px] gap-1">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                        </span>
                        Playing
                      </Badge>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              These ambient sounds are generated in real-time using your browser. No internet connection is needed once loaded. 
              Find a comfortable position, close your eyes, and focus on your breath.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MindfulnessSounds;
