import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export interface LongPressMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

interface MobileLongPressMenuProps {
  open: boolean;
  onClose: () => void;
  items: LongPressMenuItem[];
  title?: string;
}

const MobileLongPressMenu = ({ open, onClose, items, title }: MobileLongPressMenuProps) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Bottom sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[81] bg-card border-t border-border/50 rounded-t-2xl overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {title && (
              <div className="px-5 py-2 text-xs font-light tracking-wider uppercase text-muted-foreground">
                {title}
              </div>
            )}

            <div className="px-2 pb-2">
              {items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    item.onClick();
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-light rounded-xl transition-colors
                    ${item.destructive
                      ? "text-destructive hover:bg-destructive/10"
                      : "text-foreground hover:bg-muted/50"
                    }`}
                >
                  {item.icon && <span className="opacity-70">{item.icon}</span>}
                  {item.label}
                </button>
              ))}
            </div>

            <div className="px-2 pb-2">
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl bg-muted/50 text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileLongPressMenu;
