import { useEditMode } from "@/hooks/useEditMode";
import { Pencil, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EditModeToggle = () => {
  const { canEdit, editMode, setEditMode, saving } = useEditMode();

  if (!canEdit) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 left-6 z-[100]"
      >
        {editMode ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditMode(false)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full shadow-xl hover:bg-primary/90 transition-colors text-sm font-medium"
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
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 bg-card text-card-foreground px-4 py-2.5 rounded-full shadow-xl hover:shadow-2xl transition-all text-sm font-medium border border-border hover:border-primary/40"
          >
            <Pencil size={16} className="text-primary" />
            Edit Mode
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default EditModeToggle;
