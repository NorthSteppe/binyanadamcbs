import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const SwipeBackDetector = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const startX = useRef(0);
  const startY = useRef(0);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const swiping = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    // Only activate from the left 20px edge
    if (touch.clientX <= 20) {
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      swiping.current = true;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startX.current;
    const dy = Math.abs(touch.clientY - startY.current);
    // Cancel if vertical movement is dominant
    if (dy > dx) {
      swiping.current = false;
      setSwipeProgress(0);
      return;
    }
    if (dx > 0) {
      setSwipeProgress(Math.min(dx / 150, 1));
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (swiping.current && swipeProgress > 0.5) {
      if (navigator.vibrate) navigator.vibrate(20);
      navigate(-1);
    }
    swiping.current = false;
    setSwipeProgress(0);
  }, [swipeProgress, navigate]);

  if (!isMobile) return null;

  return (
    <>
      {/* Invisible touch capture zone on left edge */}
      <div
        className="fixed left-0 top-0 bottom-0 w-5 z-[70]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />
      {/* Visual feedback */}
      {swipeProgress > 0 && (
        <motion.div
          className="fixed left-0 top-0 bottom-0 z-[69] bg-primary/10 pointer-events-none"
          animate={{ width: swipeProgress * 60 }}
          transition={{ type: "tween", duration: 0.05 }}
          style={{ borderTopRightRadius: 20, borderBottomRightRadius: 20 }}
        />
      )}
    </>
  );
};

export default SwipeBackDetector;
