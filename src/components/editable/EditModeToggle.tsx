import { forwardRef } from "react";
import { useEditMode } from "@/hooks/useEditMode";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EditModeToggle = forwardRef<HTMLDivElement>((_, ref) => {
  const { canEdit, editMode, setEditMode, saving } = useEditMode();

  if (!canEdit || !editMode) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-[calc(100vw-2rem)]"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditMode(false)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 md:px-5 md:py-2.5 rounded-full shadow-xl hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <X size={16} />
            Exit Edit Mode
          </button>
          {saving && (
            <div className="flex items-center gap-1.5 bg-card text-card-foreground px-3 py-2 rounded-full shadow-lg text-xs border border-border">
              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Saving…
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

EditModeToggle.displayName = "EditModeToggle";

export default EditModeToggle;
