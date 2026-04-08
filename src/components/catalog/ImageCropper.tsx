import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  aspect,
  onCropComplete,
  onCancel,
}: ImageCropperProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="font-serif text-lg">Recortar Imagem</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Ajuste a área de recorte e confirme.
          </DialogDescription>
        </DialogHeader>
        <div className="px-5 pb-2 flex justify-center">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Recortar"
              className="max-h-[50vh] w-auto"
              style={{ maxWidth: "100%" }}
            />
          </ReactCrop>
        </div>
        <div className="flex gap-3 p-5 pt-3">
          <Button variant="outline" onClick={onCancel} className="flex-1 rounded-full">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="flex-1 rounded-full">
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
