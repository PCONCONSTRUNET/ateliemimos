import { useState, useRef, TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export const ProductImageCarousel = ({ images, alt, className = "" }: ProductImageCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  if (images.length === 0) {
    return (
      <div className={`w-full flex items-center justify-center bg-muted text-muted-foreground text-sm ${className}`}>
        Sem imagem
      </div>
    );
  }

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold && current < images.length - 1) {
      setCurrent(current + 1);
    } else if (diff < -threshold && current > 0) {
      setCurrent(current - 1);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="flex transition-transform duration-300 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${alt} ${i + 1}`}
            className="w-full h-full object-cover flex-shrink-0"
            loading="lazy"
          />
        ))}
      </div>

      {/* Navigation arrows (desktop) */}
      {images.length > 1 && (
        <>
          {current > 0 && (
            <button
              onClick={() => setCurrent(current - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-sm rounded-full p-1 shadow-md hover:bg-background/90 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
          )}
          {current < images.length - 1 && (
            <button
              onClick={() => setCurrent(current + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-sm rounded-full p-1 shadow-md hover:bg-background/90 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          )}
        </>
      )}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? "w-5 h-1.5 bg-primary-foreground"
                  : "w-1.5 h-1.5 bg-primary-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
