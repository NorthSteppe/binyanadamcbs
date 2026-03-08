import { useRef, useState, useEffect, useCallback } from "react";
import { PageElement, ElementStyles } from "@/hooks/usePageElements";

interface CanvasElementProps {
  element: PageElement;
  isSelected: boolean;
  scale: number;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (w: number, h: number) => void;
  onContentChange: (content: string) => void;
  onImageReplace: () => void;
}

const CanvasElement = ({
  element,
  isSelected,
  scale,
  onSelect,
  onMove,
  onResize,
  onContentChange,
  onImageReplace,
}: CanvasElementProps) => {
  const elRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [editing, setEditing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ w: 0, h: 0, mx: 0, my: 0 });

  const styles = (element.styles || {}) as ElementStyles;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    if (editing) return;
    setDragging(true);
    dragOffset.current = {
      x: e.clientX / scale - element.pos_x,
      y: e.clientY / scale - element.pos_y,
    };
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setResizing(true);
    resizeStart.current = {
      w: element.width,
      h: element.height,
      mx: e.clientX,
      my: e.clientY,
    };
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      const x = e.clientX / scale - dragOffset.current.x;
      const y = e.clientY / scale - dragOffset.current.y;
      onMove(Math.round(x), Math.round(y));
    };
    const handleUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, scale, onMove]);

  useEffect(() => {
    if (!resizing) return;
    const handleMove = (e: MouseEvent) => {
      const dw = (e.clientX - resizeStart.current.mx) / scale;
      const dh = (e.clientY - resizeStart.current.my) / scale;
      onResize(
        Math.max(40, Math.round(resizeStart.current.w + dw)),
        Math.max(20, Math.round(resizeStart.current.h + dh))
      );
    };
    const handleUp = () => setResizing(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [resizing, scale, onResize]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.element_type === "text") {
      setEditing(true);
    } else if (element.element_type === "image") {
      onImageReplace();
    }
  };

  const handleBlur = () => {
    setEditing(false);
  };

  const elementStyle: React.CSSProperties = {
    position: "absolute",
    left: element.pos_x,
    top: element.pos_y,
    width: element.width,
    height: element.height,
    zIndex: element.z_index,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    opacity: element.is_visible ? (styles.opacity ?? 1) : 0.3,
    cursor: dragging ? "grabbing" : "grab",
  };

  const contentStyle: React.CSSProperties = {
    fontFamily: styles.fontFamily || "Inter",
    fontSize: styles.fontSize || 16,
    fontWeight: (styles.fontWeight as any) || "normal",
    fontStyle: styles.fontStyle || "normal",
    textDecoration: styles.textDecoration || "none",
    textAlign: (styles.textAlign as any) || "left",
    color: styles.color || "#000000",
    backgroundColor: styles.backgroundColor || "transparent",
    borderRadius: styles.borderRadius || 0,
    borderWidth: styles.borderWidth || 0,
    borderColor: styles.borderColor || "transparent",
    borderStyle: styles.borderWidth ? "solid" : "none",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  };

  return (
    <div
      ref={elRef}
      style={elementStyle}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className={`group ${isSelected ? "ring-2 ring-primary ring-offset-1" : "hover:ring-1 hover:ring-primary/40"}`}
    >
      {element.element_type === "text" && (
        <div
          style={contentStyle}
          contentEditable={editing}
          suppressContentEditableWarning
          onBlur={(e) => {
            onContentChange(e.currentTarget.textContent || "");
            handleBlur();
          }}
          className={`p-2 outline-none whitespace-pre-wrap break-words ${editing ? "ring-1 ring-primary/60 cursor-text" : ""}`}
          dangerouslySetInnerHTML={{ __html: element.content }}
        />
      )}

      {element.element_type === "image" && (
        <div style={contentStyle} className="flex items-center justify-center">
          {element.image_url ? (
            <img
              src={element.image_url}
              alt={element.content || "Element"}
              style={{ objectFit: (styles.objectFit as any) || "cover" }}
              className="w-full h-full"
              draggable={false}
            />
          ) : (
            <div className="text-muted-foreground text-sm flex flex-col items-center gap-1">
              <span>Double-click to add image</span>
            </div>
          )}
        </div>
      )}

      {element.element_type === "shape" && (
        <div style={contentStyle} />
      )}

      {/* Resize handle */}
      {isSelected && (
        <div
          className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-primary rounded-sm cursor-se-resize z-50"
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
};

export default CanvasElement;
