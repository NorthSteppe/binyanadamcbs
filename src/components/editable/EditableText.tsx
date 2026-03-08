import { useState, useRef } from "react";
import { useEditMode } from "@/hooks/useEditMode";
import { Pencil, Check } from "lucide-react";

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
  const { editMode, getOverride, saveOverride } = useEditMode();
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const displayValue = getOverride(contentKey) ?? defaultValue;

  if (!editMode) {
    const Tag = as as any;
    return <Tag className={className} style={style}>{displayValue}</Tag>;
  }

  const handleSave = () => {
    const newValue = ref.current?.textContent || "";
    if (newValue !== displayValue) {
      saveOverride(contentKey, newValue);
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

  return (
    <span className="relative inline group/editable">
      <div
        ref={ref}
        className={`${className} ${editing ? "outline outline-2 outline-primary/50 outline-offset-2 rounded-sm" : "cursor-pointer ring-1 ring-primary/20 ring-offset-1 rounded-sm md:ring-0 md:hover:ring-1 md:hover:ring-primary/30"}`}
        style={style}
        contentEditable={editing}
        suppressContentEditableWarning
        onClick={() => !editing && setEditing(true)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
      >
        {displayValue}
      </div>
      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg z-50 md:opacity-0 md:group-hover/editable:opacity-100 transition-opacity"
          title="Edit"
        >
          <Pencil size={12} />
        </button>
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
    </span>
  );
};

export default EditableText;
