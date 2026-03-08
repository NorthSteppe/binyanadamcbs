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
        className={`${className} ${editing ? "outline outline-2 outline-primary/50 outline-offset-2 rounded-sm" : "cursor-pointer hover:outline hover:outline-1 hover:outline-primary/30 hover:outline-offset-2"}`}
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
          className="absolute -top-2 -right-2 opacity-0 group-hover/editable:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full p-1 shadow-lg z-50"
          title="Edit"
        >
          <Pencil size={12} />
        </button>
      )}
      {editing && (
        <button
          onMouseDown={(e) => { e.preventDefault(); handleSave(); }}
          className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-lg z-50"
          title="Save"
        >
          <Check size={12} />
        </button>
      )}
    </span>
  );
};

export default EditableText;
