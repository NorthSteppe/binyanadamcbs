import { useState, useEffect, useCallback, useRef } from "react";
import { useHeroImages } from "@/hooks/useHeroImages";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  onQuoteChange?: (quote: { text: string; author: string }) => void;
}

const HeroCarousel = ({ onQuoteChange }: HeroCarouselProps) => {
  const { data: images } = useHeroImages(true);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(new Set([0]));
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const interval = images?.[current]?.interval_seconds ?? 5;

  const next = useCallback(() => {
    if (!images || images.length <= 1) return;
    const nextIdx = (current + 1) % images.length;
    setCurrent(nextIdx);
    // Preload the one after next
    const preloadIdx = (nextIdx + 1) % images.length;
    setLoaded((prev) => new Set(prev).add(preloadIdx));
  }, [images, current]);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    // Preload first two images
    setLoaded(new Set([0, 1 % images.length]));
  }, [images]);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, interval * 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [images, interval, next]);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const img = images[current];
    onQuoteChange?.({ text: img.quote_text, author: img.quote_author });
  }, [current, images, onQuoteChange]);

  if (!images || images.length === 0) {
    return (
      <div className="overflow-hidden bg-muted w-full h-full">
        <img
          alt="A professional guiding a child in a hands-on learning activity"
          className="w-full h-full object-cover"
          src="/lovable-uploads/93c59eae-410f-4380-a222-312d8d41af41.jpg"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden relative bg-muted w-full h-full">
      {images.map((img, i) => {
        const isActive = i === current;
        const shouldRender = loaded.has(i);
        if (!shouldRender) return null;

        return (
          <div
            key={img.id}
            className={cn(
              "absolute inset-0 will-change-[opacity] transition-opacity duration-[1200ms] ease-in-out",
              isActive ? "opacity-100 z-[1]" : "opacity-0 z-0"
            )}
          >
            <img
              src={img.image_url}
              alt={img.alt_text}
              className="w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              onLoad={() => setLoaded((prev) => new Set(prev).add(i))}
            />
          </div>
        );
      })}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-[2]">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setLoaded((prev) => new Set(prev).add(i));
                setCurrent(i);
              }}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                i === current
                  ? "bg-primary-foreground scale-110"
                  : "bg-primary-foreground/40 hover:bg-primary-foreground/60"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
