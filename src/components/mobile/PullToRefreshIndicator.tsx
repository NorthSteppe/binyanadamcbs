import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  refreshing: boolean;
  threshold?: number;
}

const PullToRefreshIndicator = ({
  pullDistance,
  refreshing,
  threshold = 80,
}: PullToRefreshIndicatorProps) => {
  if (pullDistance === 0 && !refreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = pullDistance * 3;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[60] flex justify-center pointer-events-none"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      animate={{ y: refreshing ? 40 : pullDistance > 0 ? pullDistance : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div
        className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-xl border border-border/50 flex items-center justify-center shadow-lg mt-2"
        style={{ opacity: Math.max(progress, refreshing ? 1 : 0) }}
      >
        <RefreshCw
          size={18}
          className={`text-primary transition-transform ${refreshing ? "animate-spin" : ""}`}
          style={{ transform: refreshing ? undefined : `rotate(${rotation}deg)` }}
        />
      </div>
    </motion.div>
  );
};

export default PullToRefreshIndicator;
