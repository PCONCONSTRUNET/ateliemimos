import { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize, Square, RectangleHorizontal, Frame, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCropperProps {
  open: boolean;
  imageSrc: string;
  aspect?: number;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

function getCroppedCanvas(
  image: HTMLImageElement,
  crop: PixelCrop
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return canvas;
}

export const ImageCropper = ({
  open,
  imageSrc,
  aspect: initialAspect,
  onCropComplete,
  onCancel,
}: ImageCropperProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [aspect, setAspect] = useState<number | undefined>(initialAspect);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  useEffect(() => {
    if (open) {
      setAspect(initialAspect);
      setCrop(undefined); // Reset crop to trigger auto-calculation on image load
      setCompletedCrop(null);
    }
  }, [open, initialAspect]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = aspect 
      ? centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height), width, height)
      : { unit: "%" as const, x: 0, y: 0, width: 100, height: 100 };
    setCrop(initialCrop);
  };

  const selectAll = () => {
    setAspect(undefined);
    setCrop({ unit: "%", x: 0, y: 0, width: 100, height: 100 });
  };

  const handleConfirm = useCallback(() => {
    if (!imgRef.current || !completedCrop) return;

    const canvas = getCroppedCanvas(imgRef.current, completedCrop);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
          onCropComplete(file);
        }
      },
      "image/jpeg",
      0.92
    );
  }, [completedCrop, onCropComplete]);

  const AspectButton = ({ value, label, icon: Icon }: { value: number | undefined, label: string, icon: any }) => (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "flex-1 gap-1.5 rounded-xl text-[10px] h-9 px-2",
        aspect === value ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground"
      )}
      onClick={() => {
        setAspect(value);
        if (imgRef.current) {
          const { width, height } = imgRef.current;
          const newCrop = value
            ? centerCrop(makeAspectCrop({ unit: "%", width: 90 }, value, width, height), width, height)
            : { unit: "%" as const, x: 5, y: 5, width: 90, height: 90 };
          setCrop(newCrop);
        }
      }}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[95vh] overflow-y-auto rounded-3xl p-0 gap-0 shadow-2xl border-none">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="font-serif text-xl">Ajustar Recorte</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Escolha o formato e arraste para posicionar.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-4">
          {/* Aspect Ratios Controls */}
          <div className="flex flex-wrap gap-2">
            <AspectButton value={undefined} label="Livre" icon={MousePointer2} />
            <AspectButton value={1} label="1:1" icon={Square} />
            <AspectButton value={16 / 9} label="16:9" icon={RectangleHorizontal} />
            <AspectButton value={4 / 3} label="4:3" icon={Frame} />
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 rounded-xl text-[10px] h-9 px-2 text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              onClick={selectAll}
            >
              <Maximize className="h-3.5 w-3.5" />
              Tudo
            </Button>
          </div>

          {/* Cropper Area */}
          <div className="flex justify-center bg-muted/30 rounded-2xl overflow-hidden border border-border/50">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-h-[50vh]"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Recortar"
                onLoad={onImageLoad}
                crossOrigin="anonymous"
                style={{ maxHeight: "50vh", maxWidth: "100%", width: "auto" }}
                className="block"
              />
            </ReactCrop>
          </div>
        </div>

        <div className="flex gap-4 p-6 mt-2">
          <Button variant="ghost" onClick={onCancel} className="flex-1 rounded-2xl h-12 font-semibold">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="flex-1 rounded-2xl h-12 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
            Confirmar Recorte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
