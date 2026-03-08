import { useState, useRef, useCallback, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import EditorToolbar from "@/components/designer/EditorToolbar";
import CanvasElement from "@/components/designer/CanvasElement";
import PropertiesPanel from "@/components/designer/PropertiesPanel";
import {
  usePageElements,
  useCreatePageElement,
  useUpdatePageElement,
  useDeletePageElement,
  PageElement,
  ElementStyles,
} from "@/hooks/usePageElements";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

const PAGES = [
  { key: "home", label: "Homepage" },
  { key: "about", label: "About" },
  { key: "therapy", label: "Therapy" },
  { key: "education", label: "Education" },
  { key: "families", label: "Families" },
  { key: "organisations", label: "Organisations" },
  { key: "supervision", label: "Supervision" },
  { key: "services", label: "Services" },
  { key: "contact", label: "Contact" },
];

const CANVAS_W = 1440;
const CANVAS_H = 900;

const WebDesigner = () => {
  const [pageKey, setPageKey] = useState("home");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.65);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImageElementId, setPendingImageElementId] = useState<string | null>(null);

  const { data: elements = [], isLoading } = usePageElements(pageKey);
  const createElement = useCreatePageElement();
  const updateElement = useUpdatePageElement();
  const deleteElement = useDeletePageElement();

  const selectedElement = elements.find((e) => e.id === selectedId) ?? null;

  // Deselect on canvas click
  const handleCanvasClick = () => setSelectedId(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectedId) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        // Don't delete if user is editing text
        if ((e.target as HTMLElement)?.isContentEditable) return;
        handleDelete();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, pageKey]);

  const addText = () => {
    createElement.mutate({
      page_key: pageKey,
      element_type: "text",
      content: "Double-click to edit",
      pos_x: 100 + Math.random() * 200,
      pos_y: 100 + Math.random() * 200,
      width: 300,
      height: 80,
      z_index: elements.length,
      styles: { fontFamily: "Inter", fontSize: 18, color: "#1a1a1a" } as any,
    });
  };

  const addImage = () => {
    createElement.mutate(
      {
        page_key: pageKey,
        element_type: "image",
        pos_x: 100 + Math.random() * 200,
        pos_y: 100 + Math.random() * 200,
        width: 350,
        height: 250,
        z_index: elements.length,
        styles: { objectFit: "cover", borderRadius: 8 } as any,
      },
      {
        onSuccess: (data) => {
          setSelectedId(data.id);
          setPendingImageElementId(data.id);
          fileInputRef.current?.click();
        },
      }
    );
  };

  const addShape = () => {
    createElement.mutate({
      page_key: pageKey,
      element_type: "shape",
      pos_x: 150 + Math.random() * 200,
      pos_y: 150 + Math.random() * 200,
      width: 200,
      height: 200,
      z_index: elements.length,
      styles: { backgroundColor: "#e2e8f0", borderRadius: 12 } as any,
    });
  };

  const handleDelete = () => {
    if (!selectedId) return;
    deleteElement.mutate({ id: selectedId, page_key: pageKey });
    setSelectedId(null);
  };

  const handleDuplicate = () => {
    if (!selectedElement) return;
    const { id, created_at, updated_at, ...rest } = selectedElement;
    createElement.mutate({
      ...rest,
      pos_x: rest.pos_x + 20,
      pos_y: rest.pos_y + 20,
      z_index: elements.length,
      styles: rest.styles as any,
    });
  };

  const handleToggleVisibility = () => {
    if (!selectedElement) return;
    updateElement.mutate({
      id: selectedElement.id,
      page_key: pageKey,
      is_visible: !selectedElement.is_visible,
    });
  };

  const handleBringForward = () => {
    if (!selectedElement) return;
    updateElement.mutate({
      id: selectedElement.id,
      page_key: pageKey,
      z_index: selectedElement.z_index + 1,
    });
  };

  const handleSendBackward = () => {
    if (!selectedElement) return;
    updateElement.mutate({
      id: selectedElement.id,
      page_key: pageKey,
      z_index: Math.max(0, selectedElement.z_index - 1),
    });
  };

  const handleUpdateStyles = (newStyles: Partial<ElementStyles>) => {
    if (!selectedElement) return;
    const merged = { ...(selectedElement.styles as ElementStyles), ...newStyles };
    updateElement.mutate({
      id: selectedElement.id,
      page_key: pageKey,
      styles: merged as any,
    });
  };

  const handleMove = useCallback(
    (id: string, x: number, y: number) => {
      updateElement.mutate({ id, page_key: pageKey, pos_x: x, pos_y: y });
    },
    [pageKey]
  );

  const handleResize = useCallback(
    (id: string, w: number, h: number) => {
      updateElement.mutate({ id, page_key: pageKey, width: w, height: h });
    },
    [pageKey]
  );

  const handleContentChange = useCallback(
    (id: string, content: string) => {
      updateElement.mutate({ id, page_key: pageKey, content });
    },
    [pageKey]
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = pendingImageElementId || selectedId;
    if (!file || !targetId) return;

    try {
      const ext = file.name.split(".").pop();
      const path = `designer/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("hero-images")
        .upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from("hero-images")
        .getPublicUrl(path);

      updateElement.mutate({
        id: targetId,
        page_key: pageKey,
        image_url: urlData.publicUrl,
        content: file.name,
      });
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPendingImageElementId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageReplace = (id: string) => {
    setPendingImageElementId(id);
    fileInputRef.current?.click();
  };

  const handleUpdate = (updates: Partial<PageElement>) => {
    if (!selectedElement) return;
    updateElement.mutate({ id: selectedElement.id, page_key: pageKey, ...updates } as any);
  };

  return (
    <div className="h-screen flex flex-col bg-muted/50">
      <Header />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      {/* Top bar with page selector */}
      <div className="bg-card border-b border-border px-4 py-2 flex items-center gap-4 pt-20">
        <Select value={pageKey} onValueChange={(v) => { setPageKey(v); setSelectedId(null); }}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGES.map((p) => (
              <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 ml-auto">
          <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))}>
            <ZoomOut size={16} />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
            <ZoomIn size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setZoom(0.65)}>
            <Maximize2 size={16} />
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <EditorToolbar
        selectedElement={selectedElement}
        onAddText={addText}
        onAddImage={addImage}
        onAddShape={addShape}
        onUpdateStyles={handleUpdateStyles}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onToggleVisibility={handleToggleVisibility}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
      />

      {/* Main area: canvas + properties */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-8">
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="relative bg-white shadow-xl border border-border/50"
            style={{
              width: CANVAS_W,
              height: CANVAS_H,
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              minWidth: CANVAS_W,
              minHeight: CANVAS_H,
            }}
          >
            {/* Grid dots */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Loading…
              </div>
            )}

            {elements.map((el) => (
              <CanvasElement
                key={el.id}
                element={el}
                isSelected={el.id === selectedId}
                scale={zoom}
                onSelect={() => setSelectedId(el.id)}
                onMove={(x, y) => handleMove(el.id, x, y)}
                onResize={(w, h) => handleResize(el.id, w, h)}
                onContentChange={(c) => handleContentChange(el.id, c)}
                onImageReplace={() => handleImageReplace(el.id)}
              />
            ))}

            {elements.length === 0 && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <p className="text-lg">Empty canvas</p>
                <p className="text-sm">Use the toolbar above to add text, images, or shapes</p>
              </div>
            )}
          </div>
        </div>

        {/* Properties panel */}
        <PropertiesPanel
          element={selectedElement}
          onUpdate={handleUpdate}
          onUpdateStyles={handleUpdateStyles}
        />
      </div>
    </div>
  );
};

export default WebDesigner;
