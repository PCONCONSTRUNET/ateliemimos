import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import banner1 from "@/assets/banner1.png";
import banner2 from "@/assets/banner2.png";

export function BannerCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "center",
    dragFree: false,
    containScroll: "trimSnaps"
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const placeholders = [banner1, banner2];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mt-6 mb-2">
      <div className="overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {placeholders.map((url, i) => (
            <div key={i} className="relative shrink-0 w-full min-w-0 bg-transparent shadow-sm border border-border/50 rounded-2xl overflow-hidden">
              <img 
                src={url} 
                alt={`Banner promocional ${i + 1}`}
                className="w-full h-auto block select-none pointer-events-none"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {placeholders.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === selectedIndex ? 'bg-primary' : 'bg-primary/20'}`} />
        ))}
      </div>
    </div>
  );
}
