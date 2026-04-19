import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  RotateCcw,
  Upload,
  Trash2,
  X,
} from "lucide-react";

export interface ImageStyle {
  width?: number; // %
  offsetX?: number; // px
  offsetY?: number; // px
  align?: "left" | "center" | "right";
  objectFit?: "cover" | "contain" | "fill";
  rotation?: number; // deg
  opacity?: number; // 0-1
}

interface Props {
  anchor: { x: number; y: number };
  initial: ImageStyle;
  onChange: (s: ImageStyle) => void;
  onUpload: () => void;
  onRemove: () => void;
  onReset: () => void;
  onClose: () => void;
}

const ImageStylePopover = ({ anchor, initial, onChange, onUpload, onRemove, onReset, onClose }: Props) => {
  const [style, setStyle] = useState<ImageStyle>(initial);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange(style);
  }, [style]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener("mousedown", onDocClick), 0);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [onClose]);

  const update = (patch: Partial<ImageStyle>) => setStyle((s) => ({ ...s, ...patch }));

  const popoverWidth = 320;
  const left = Math.min(anchor.x, window.innerWidth - popoverWidth - 16);
  const top = Math.min(anchor.y, window.innerHeight - 520);

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[110] bg-card border border-border rounded-2xl shadow-2xl p-4 w-[320px] max-h-[80vh] overflow-y-auto"
      style={{ left, top }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ImageIcon size={14} /> Image Style
        </p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" className="gap-1" onClick={onUpload}>
            <Upload size={12} /> Replace
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={onRemove}>
            <Trash2 size={12} /> Remove
          </Button>
        </div>

        <div>
          <Label className="text-xs flex justify-between">Width <span>{style.width ?? 100}%</span></Label>
          <Slider
            min={10}
            max={100}
            step={1}
            value={[style.width ?? 100]}
            onValueChange={([v]) => update({ width: v })}
          />
        </div>

        <div>
          <Label className="text-xs flex justify-between">Offset X <span>{style.offsetX ?? 0}px</span></Label>
          <Slider
            min={-300}
            max={300}
            step={1}
            value={[style.offsetX ?? 0]}
            onValueChange={([v]) => update({ offsetX: v })}
          />
        </div>

        <div>
          <Label className="text-xs flex justify-between">Offset Y <span>{style.offsetY ?? 0}px</span></Label>
          <Slider
            min={-300}
            max={300}
            step={1}
            value={[style.offsetY ?? 0]}
            onValueChange={([v]) => update({ offsetY: v })}
          />
        </div>

        <div>
          <Label className="text-xs flex justify-between">Rotation <span>{style.rotation ?? 0}°</span></Label>
          <Slider
            min={-180}
            max={180}
            step={1}
            value={[style.rotation ?? 0]}
            onValueChange={([v]) => update({ rotation: v })}
          />
        </div>

        <div>
          <Label className="text-xs flex justify-between">Opacity <span>{Math.round((style.opacity ?? 1) * 100)}%</span></Label>
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={[style.opacity ?? 1]}
            onValueChange={([v]) => update({ opacity: v })}
          />
        </div>

        <div>
          <Label className="text-xs">Object fit</Label>
          <div className="flex gap-1 mt-1">
            {(["cover", "contain", "fill"] as const).map((v) => (
              <button
                key={v}
                onClick={() => update({ objectFit: v })}
                className={`flex-1 h-8 rounded-md border text-[11px] capitalize transition-colors ${
                  (style.objectFit ?? "cover") === v
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input bg-background text-foreground hover:bg-accent"
                }`}
              >
                {v}
              </button>
            ))}
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
                onClick={() => update({ align: v as any })}
                className={`flex-1 h-9 rounded-md border flex items-center justify-center transition-colors ${
                  (style.align ?? "left") === v
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

export default ImageStylePopover;
