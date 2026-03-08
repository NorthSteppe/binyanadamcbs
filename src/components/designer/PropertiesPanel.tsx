import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PageElement, ElementStyles } from "@/hooks/usePageElements";

interface PropertiesPanelProps {
  element: PageElement | null;
  onUpdate: (updates: Partial<PageElement>) => void;
  onUpdateStyles: (styles: Partial<ElementStyles>) => void;
}

const PropertiesPanel = ({ element, onUpdate, onUpdateStyles }: PropertiesPanelProps) => {
  if (!element) {
    return (
      <div className="w-56 bg-card border-l border-border p-4 text-center text-sm text-muted-foreground">
        Select an element to edit its properties
      </div>
    );
  }

  const styles = (element.styles || {}) as ElementStyles;

  return (
    <div className="w-56 bg-card border-l border-border p-4 space-y-4 overflow-y-auto text-sm">
      <h3 className="font-medium text-foreground text-xs uppercase tracking-wider">Properties</h3>

      {/* Position */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Position</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-muted-foreground">X</span>
            <Input
              type="number"
              value={Math.round(element.pos_x)}
              onChange={(e) => onUpdate({ pos_x: Number(e.target.value) })}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Y</span>
            <Input
              type="number"
              value={Math.round(element.pos_y)}
              onChange={(e) => onUpdate({ pos_y: Number(e.target.value) })}
              className="h-7 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Size */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Size</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-muted-foreground">W</span>
            <Input
              type="number"
              value={Math.round(element.width)}
              onChange={(e) => onUpdate({ width: Number(e.target.value) })}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">H</span>
            <Input
              type="number"
              value={Math.round(element.height)}
              onChange={(e) => onUpdate({ height: Number(e.target.value) })}
              className="h-7 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Rotation</Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[element.rotation]}
            min={0}
            max={360}
            step={1}
            onValueChange={([v]) => onUpdate({ rotation: v })}
            className="flex-1"
          />
          <span className="text-xs w-8 text-right">{element.rotation}°</span>
        </div>
      </div>

      {/* Opacity */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Opacity</Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[Math.round((styles.opacity ?? 1) * 100)]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => onUpdateStyles({ opacity: v / 100 })}
            className="flex-1"
          />
          <span className="text-xs w-8 text-right">{Math.round((styles.opacity ?? 1) * 100)}%</span>
        </div>
      </div>

      {/* Border Radius */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Corner Radius</Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[styles.borderRadius ?? 0]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => onUpdateStyles({ borderRadius: v })}
            className="flex-1"
          />
          <span className="text-xs w-8 text-right">{styles.borderRadius ?? 0}</span>
        </div>
      </div>

      {/* Border */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Border</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={20}
            value={styles.borderWidth ?? 0}
            onChange={(e) => onUpdateStyles({ borderWidth: Number(e.target.value) })}
            className="h-7 text-xs w-14"
          />
          <input
            type="color"
            value={styles.borderColor || "#000000"}
            onChange={(e) => onUpdateStyles({ borderColor: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer border-0"
          />
        </div>
      </div>

      {/* Z-Index */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Layer Order</Label>
        <Input
          type="number"
          value={element.z_index}
          onChange={(e) => onUpdate({ z_index: Number(e.target.value) })}
          className="h-7 text-xs"
        />
      </div>
    </div>
  );
};

export default PropertiesPanel;
