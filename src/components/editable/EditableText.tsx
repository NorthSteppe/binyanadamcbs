import { useState, useRef } from "react";
import { useEditMode } from "@/hooks/useEditMode";
import { Pencil, Check, Sliders } from "lucide-react";
import StylePopover, { TextStyle } from "./StylePopover";

interface EditableTextProps {
  contentKey: string;
  defaultValue: string;
  as?: string;
  className?: string;
  style?: React.CSSProperties;
}

const EditableText = ({
  contentKey,
  defaultValue,
  as = "span",
  className = "",
  style,
}: EditableTextProps) => {
  const { editMode, getOverride, getStyleOverride, saveOverride } = useEditMode();
  const [editing, setEditing] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const displayValue = getOverride(contentKey) ?? defaultValue;
  const customStyle = getStyleOverride(contentKey) as TextStyle;

  const styleObject: React.CSSProperties = {
    ...style,
    ...(customStyle.fontFamily ? { fontFamily: customStyle.fontFamily } : {}),
    ...(customStyle.fontSize ? { fontSize: `${customStyle.fontSize}px`, lineHeight: 1.1 } : {}),
    ...(customStyle.fontWeight ? { fontWeight: customStyle.fontWeight } : {}),
    ...(customStyle.color ? { color: customStyle.color } : {}),
    ...(customStyle.letterSpacing !== undefined ? { letterSpacing: `${customStyle.letterSpacing}px` } : {}),
    ...(customStyle.maxWidth ? { maxWidth: `${customStyle.maxWidth}px`, display: "inline-block" } : {}),
    ...(customStyle.textAlign ? { textAlign: customStyle.textAlign } : {}),
  };

  if (!editMode) {
    const Tag = as as any;
    return <Tag className={className} style={styleObject}>{displayValue}</Tag>;
  }

  const handleSave = () => {
    const newValue = ref.current?.textContent || "";
    if (newValue !== displayValue) {
      saveOverride({ key: contentKey, value: newValue });
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      if (ref.current) ref.current.textContent = displayValue;
      setEditing(false);
    }
  };

  const openStyle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = triggerRef.current?.getBoundingClientRect();
    setPopoverAnchor({ x: (rect?.right ?? e.clientX) + 8, y: (rect?.top ?? e.clientY) });
  };

  return (
    <span className="relative inline group/editable">
      <div
        ref={ref}
        className={`${className} ${editing ? "outline outline-2 outline-primary/50 outline-offset-2 rounded-sm" : "cursor-pointer ring-1 ring-primary/20 ring-offset-1 rounded-sm md:ring-0 md:hover:ring-1 md:hover:ring-primary/30"}`}
        style={styleObject}
        contentEditable={editing}
        suppressContentEditableWarning
        onClick={() => !editing && setEditing(true)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
      >
        {displayValue}
      </div>

      {!editing && (
        <span className="absolute -top-2 -right-2 flex gap-1 z-50">
          <button
            ref={triggerRef}
            onClick={openStyle}
            className="bg-card border border-border text-foreground rounded-full p-1.5 shadow-lg md:opacity-0 md:group-hover/editable:opacity-100 transition-opacity"
            title="Style"
          >
            <Sliders size={11} />
          </button>
          <button
            onClick={() => setEditing(true)}
            className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg md:opacity-0 md:group-hover/editable:opacity-100 transition-opacity"
            title="Edit text"
          >
            <Pencil size={11} />
          </button>
        </span>
      )}

      {editing && (
        <button
          onMouseDown={(e) => { e.preventDefault(); handleSave(); }}
          className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg z-50"
          title="Save"
        >
          <Check size={12} />
        </button>
      )}

      {popoverAnchor && (
        <StylePopover
          anchor={popoverAnchor}
          initial={customStyle}
          onChange={(s) => saveOverride({ key: contentKey, styleJson: s })}
          onReset={() => saveOverride({ key: contentKey, styleJson: {} })}
          onClose={() => setPopoverAnchor(null)}
        />
      )}
    </span>
  );
};

export default EditableText;
