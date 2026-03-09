import { useCallback, useRef } from "react";

interface LongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

export function useLongPress({ onLongPress, onClick, delay = 500 }: LongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      isLongPress.current = false;
      const touch = "touches" in e ? e.touches[0] : e;
      startPos.current = { x: touch.clientX, y: touch.clientY };

      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        // Haptic feedback if available
        if (navigator.vibrate) navigator.vibrate(50);
        onLongPress();
      }, delay);
    },
    [onLongPress, delay]
  );

  const move = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const touch = "touches" in e ? e.touches[0] : e;
    const dx = Math.abs(touch.clientX - startPos.current.x);
    const dy = Math.abs(touch.clientY - startPos.current.y);
    if (dx > 10 || dy > 10) {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, []);

  const end = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isLongPress.current && onClick) onClick();
  }, [onClick]);

  return {
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: end,
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: end,
  };
}
