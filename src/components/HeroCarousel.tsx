import { useState, useEffect, useCallback } from "react";
import { useHeroImages } from "@/hooks/useHeroImages";
import { cn } from "@/lib/utils";

const HeroCarousel = () => {
  const { data: images } = useHeroImages(true);
  const [current, setCurrent] = useState(0);

  const interval = images?.[0]?.interval_seconds ?? 5;

  const next = useCallback(() => {
    if (!images || images.length <= 1) return;
    setCurrent((c) => (c + 1) % images.length);
  }, [images]);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(next, interval * 1000);
    return () => clearInterval(timer);
  }, [images, interval, next]);

  // Fallback when no images uploaded yet
  if (!images || images.length === 0) {
    return (
      <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-muted">
        <img
          alt="A professional guiding a child in a hands-on learning activity"
          className="w-full h-full object-cover"
          src="/lovable-uploads/93c59eae-410f-4380-a222-312d8d41af41.jpg"
        />
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] relative bg-muted">
      {images.map((img, i) => (
        <img
          key={img.id}
          src={img.image_url}
          alt={img.alt_text}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
            i === current ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
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
