import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Type, ImageIcon, Square, Trash2, Eye, EyeOff, Copy,
  ChevronUp, ChevronDown,
} from "lucide-react";
import { PageElement, ElementStyles } from "@/hooks/usePageElements";

const FONT_FAMILIES = [
  "Inter", "Georgia", "serif", "monospace", "Playfair Display", "Arial", "Helvetica",
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96];

interface EditorToolbarProps {
  selectedElement: PageElement | null;
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: () => void;
  onUpdateStyles: (styles: Partial<ElementStyles>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

const EditorToolbar = ({
  selectedElement,
  onAddText,
  onAddImage,
  onAddShape,
  onUpdateStyles,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onBringForward,
  onSendBackward,
}: EditorToolbarProps) => {
  const styles = (selectedElement?.styles ?? {}) as ElementStyles;
  const isText = selectedElement?.element_type === "text";

  const toggleStyle = (key: keyof ElementStyles, on: string, off: string) => {
    onUpdateStyles({ [key]: styles[key] === on ? off : on });
  };

  return (
    <div className="bg-card border-b border-border px-4 py-2 flex items-center gap-2 flex-wrap">
      {/* Add elements */}
      <div className="flex items-center gap-1 border-r border-border pr-3 mr-1">
        <Button variant="ghost" size="sm" onClick={onAddText} title="Add Text">
          <Type size={16} />
        </Button>
        <Button variant="ghost" size="sm" onClick={onAddImage} title="Add Image">
          <ImageIcon size={16} />
        </Button>
        <Button variant="ghost" size="sm" onClick={onAddShape} title="Add Shape">
          <Square size={16} />
        </Button>
      </div>

      {/* Text formatting (only when text element selected) */}
      {selectedElement && isText && (
        <>
          <div className="flex items-center gap-1 border-r border-border pr-3 mr-1">
            <Select
              value={styles.fontFamily || "Inter"}
              onValueChange={(v) => onUpdateStyles({ fontFamily: v })}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((f) => (
                  <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(styles.fontSize || 16)}
              onValueChange={(v) => onUpdateStyles({ fontSize: Number(v) })}
            >
              <SelectTrigger className="w-[65px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-0.5 border-r border-border pr-3 mr-1">
            <Button
              variant={styles.fontWeight === "bold" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => toggleStyle("fontWeight", "bold", "normal")}
            >
              <Bold size={14} />
            </Button>
            <Button
              variant={styles.fontStyle === "italic" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => toggleStyle("fontStyle", "italic", "normal")}
            >
              <Italic size={14} />
            </Button>
            <Button
              variant={styles.textDecoration === "underline" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => toggleStyle("textDecoration", "underline", "none")}
            >
              <Underline size={14} />
            </Button>
          </div>

          <div className="flex items-center gap-0.5 border-r border-border pr-3 mr-1">
            <Button
              variant={styles.textAlign === "left" || !styles.textAlign ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onUpdateStyles({ textAlign: "left" })}
            >
              <AlignLeft size={14} />
            </Button>
            <Button
              variant={styles.textAlign === "center" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onUpdateStyles({ textAlign: "center" })}
            >
              <AlignCenter size={14} />
            </Button>
            <Button
              variant={styles.textAlign === "right" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onUpdateStyles({ textAlign: "right" })}
            >
              <AlignRight size={14} />
            </Button>
          </div>

          <div className="flex items-center gap-1 border-r border-border pr-3 mr-1">
            <label className="text-xs text-muted-foreground">Color</label>
            <input
              type="color"
              value={styles.color || "#000000"}
              onChange={(e) => onUpdateStyles({ color: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer border-0"
            />
          </div>
        </>
      )}

      {/* Background color for any element */}
      {selectedElement && (
        <div className="flex items-center gap-1 border-r border-border pr-3 mr-1">
          <label className="text-xs text-muted-foreground">BG</label>
          <input
            type="color"
            value={styles.backgroundColor || "#ffffff"}
            onChange={(e) => onUpdateStyles({ backgroundColor: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer border-0"
          />
        </div>
      )}

      {/* Element actions */}
      {selectedElement && (
        <div className="flex items-center gap-0.5 ml-auto">
          <Button variant="ghost" size="sm" onClick={onBringForward} title="Bring Forward">
            <ChevronUp size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onSendBackward} title="Send Backward">
            <ChevronDown size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDuplicate} title="Duplicate">
            <Copy size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggleVisibility} title="Toggle Visibility">
            {selectedElement.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive" title="Delete">
            <Trash2 size={14} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditorToolbar;
