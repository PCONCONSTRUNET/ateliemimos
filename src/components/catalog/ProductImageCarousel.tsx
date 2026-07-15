import { useState, useRef, TouchEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { createPortal } from "react-dom";

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export const ProductImageCarousel = ({ images, alt, className = "" }: ProductImageCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  if (images.length === 0) {
    return (
      <div className={`w-full flex items-center justify-center bg-muted text-muted-foreground text-sm ${className}`}>
        Sem imagem
      </div>
    );
  }

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    isDragging.current = false;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    if (Math.abs(touchStartX.current - touchEndX.current) > 10) {
      isDragging.current = true;
    }
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

  const handleImageClick = () => {
    if (!isDragging.current) {
      setIsLightboxOpen(true);
    }
  };

  return (
    <>
      <div className={`relative overflow-hidden ${className}`}>
        <div
          className="flex transition-transform duration-300 ease-out h-full cursor-pointer"
          style={{ transform: `translateX(-${current * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleImageClick}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(current - 1);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-sm rounded-full p-1 shadow-md hover:bg-background/90 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
            )}
            {current < images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(current + 1);
                }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
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

      {isLightboxOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center pointer-events-auto">
          {/* Close button */}
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-[110] p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Carousel Container */}
          <div 
            className="w-full h-full relative flex items-center overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex w-full h-full transition-transform duration-300 ease-out items-center"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {images.map((src, i) => (
                <div key={i} className="w-full h-full flex-shrink-0 flex items-center justify-center p-2 md:p-8">
                  <img
                    src={src}
                    alt={`${alt} ${i + 1} expandida`}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows (desktop) */}
          {images.length > 1 && (
            <>
              {current > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrent(current - 1); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 text-white transition-colors z-[110]"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              {current < images.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrent(current + 1); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 text-white transition-colors z-[110]"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </>
          )}

          {/* Dots indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-[110]">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                  className={`rounded-full transition-all ${
                    i === current
                      ? "w-2.5 h-2.5 bg-white"
                      : "w-2 h-2 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};
