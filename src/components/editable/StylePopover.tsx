import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Type,
  RotateCcw,
  X,
} from "lucide-react";

const FONT_FAMILIES = [
  { label: "Display (default)", value: "" },
  { label: "Sans Serif", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Serif", value: "ui-serif, Georgia, serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, monospace" },
];

export interface TextStyle {
  fontFamily?: string;
  fontSize?: number; // px
  fontWeight?: number;
  color?: string;
  letterSpacing?: number; // px
  maxWidth?: number; // px, 0 = none
  textAlign?: "left" | "center" | "right";
}

interface Props {
  anchor: { x: number; y: number };
  initial: TextStyle;
  onChange: (s: TextStyle) => void;
  onReset: () => void;
  onClose: () => void;
}

const StylePopover = ({ anchor, initial, onChange, onReset, onClose }: Props) => {
  const [style, setStyle] = useState<TextStyle>(initial);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange(style);
  }, [style]);

  // Click outside closes
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener("mousedown", onDocClick), 0);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [onClose]);

  const update = (patch: Partial<TextStyle>) => setStyle((s) => ({ ...s, ...patch }));

  const popoverWidth = 320;
  const left = Math.min(anchor.x, window.innerWidth - popoverWidth - 16);
  const top = Math.min(anchor.y, window.innerHeight - 460);

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[110] bg-card border border-border rounded-2xl shadow-2xl p-4 w-[320px] max-h-[80vh] overflow-y-auto"
      style={{ left, top }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Type size={14} /> Text Style
        </p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <Label className="text-xs">Font family</Label>
          <select
            value={style.fontFamily ?? ""}
            onChange={(e) => update({ fontFamily: e.target.value })}
            className="w-full mt-1 h-9 px-2 rounded-md border border-input bg-background text-foreground text-sm"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.label} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-xs flex justify-between">Font size <span>{style.fontSize ?? "auto"}px</span></Label>
          <Slider
            min={10}
            max={160}
            step={1}
            value={[style.fontSize ?? 32]}
            onValueChange={([v]) => update({ fontSize: v })}
          />
        </div>

        <div>
          <Label className="text-xs flex justify-between">Weight <span>{style.fontWeight ?? 400}</span></Label>
          <Slider
            min={100}
            max={900}
            step={100}
            value={[style.fontWeight ?? 400]}
            onValueChange={([v]) => update({ fontWeight: v })}
          />
        </div>

        <div>
          <Label className="text-xs flex justify-between">Letter spacing <span>{style.letterSpacing ?? 0}px</span></Label>
          <Slider
            min={-5}
            max={20}
            step={0.5}
            value={[style.letterSpacing ?? 0]}
            onValueChange={([v]) => update({ letterSpacing: v })}
          />
        </div>

        <div>
          <Label className="text-xs flex justify-between">Max width <span>{style.maxWidth ? `${style.maxWidth}px` : "none"}</span></Label>
          <Slider
            min={0}
            max={1400}
            step={10}
            value={[style.maxWidth ?? 0]}
            onValueChange={([v]) => update({ maxWidth: v })}
          />
        </div>

        <div>
          <Label className="text-xs">Color</Label>
          <div className="flex gap-2 mt-1 items-center">
            <input
              type="color"
              value={style.color || "#000000"}
              onChange={(e) => update({ color: e.target.value })}
              className="w-10 h-9 rounded border border-input cursor-pointer"
            />
            <Input
              value={style.color || ""}
              placeholder="inherit"
              onChange={(e) => update({ color: e.target.value })}
              className="h-9 text-sm flex-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs">Alignment</Label>
          <div className="flex gap-1 mt-1">
            {[
              { v: "left", icon: AlignLeft },
              { v: "center", icon: AlignCenter },
              { v: "right", icon: AlignRight },
            ].map(({ v, icon: Icon }) => (
              <button
                key={v}
                onClick={() => update({ textAlign: v as any })}
                className={`flex-1 h-9 rounded-md border flex items-center justify-center transition-colors ${
                  style.textAlign === v
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input bg-background text-foreground hover:bg-accent"
                }`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border">
          <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={onReset}>
            <RotateCcw size={12} /> Reset
          </Button>
          <Button size="sm" className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default StylePopover;
