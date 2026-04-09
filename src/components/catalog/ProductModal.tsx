import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProductImageCarousel } from "./ProductImageCarousel";

interface Product {
  id: string;
  nome: string;
  preco: number;
  descricao: string | null;
  imagem: string | null;
  categoria_id: string | null;
  destaque: boolean;
  disponivel: boolean;
  tags?: string[];
}

interface ProductVariation {
  id: string;
  nome: string;
  preco: number;
}

interface ProductModalProps {
  product: Product | null;
  categoryName: string;
  onClose: () => void;
  extraImages?: string[];
}

const WHATSAPP_NUMBER = "5548996222795";

export const ProductModal = ({ product, categoryName, onClose, extraImages = [] }: ProductModalProps) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [selectedVar, setSelectedVar] = useState<ProductVariation | null>(null);

  useEffect(() => {
    if (product) {
      fetchVariations();
      setSelectedVar(null);
    }
  }, [product]);

  const fetchVariations = async () => {
    if (!product) return;
    const { data } = await supabase
      .from("product_variations")
      .select("*")
      .eq("product_id", product.id)
      .order("preco", { ascending: true });
    if (data) setVariations(data);
  };

  if (!product) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const displayPrice = selectedVar ? selectedVar.preco : product.preco;

  const handleWhatsApp = () => {
    let msg = `Olá! Vi este produto no catálogo e gostaria de mais informações:\n\n`;
    msg += `*Produto:* ${product.nome}\n`;
    
    if (selectedVar) {
      msg += `*Opção:* ${selectedVar.nome}\n`;
      msg += `*Valor:* ${formatPrice(selectedVar.preco)}\n`;
    } else {
      msg += `*Valor:* ${formatPrice(product.preco)}\n`;
    }

    msg += `\nPoderia me informar sobre a disponibilidade deste item?`;
    const message = encodeURIComponent(msg);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  // Build image list: main image + extra images from product_images table
  const allImages: string[] = [];
  if (product.imagem) allImages.push(product.imagem);
  extraImages.forEach((url) => {
    if (!allImages.includes(url)) allImages.push(url);
  });

  return (
    <Dialog open={!!product} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] max-h-[85vh] overflow-y-auto p-0 bg-card rounded-2xl gap-0">
        {/* Image carousel */}
        {allImages.length > 0 && (
          <ProductImageCarousel
            images={allImages}
            alt={product.nome}
            className="w-full aspect-square"
          />
        )}

        <div className="p-5 space-y-3">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-semibold text-foreground text-left">
              {product.nome}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detalhes do produto {product.nome}
            </DialogDescription>
          </DialogHeader>

          <p className="text-xl font-bold text-primary">
            {formatPrice(displayPrice)}
            {variations.length > 0 && !selectedVar && (
              <span className="text-[10px] ml-2 text-muted-foreground font-normal">(preço inicial)</span>
            )}
          </p>

          {/* Variations Selection */}
          {variations.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Escolha uma opção:</label>
              <div className="flex flex-wrap gap-2">
                {variations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVar(v)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-medium border-2 transition-all",
                      selectedVar?.id === v.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/30 text-muted-foreground"
                    )}
                  >
                    {v.nome} - {formatPrice(v.preco)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] bg-primary/10 text-accent px-2.5 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {product.descricao && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.descricao}
            </p>
          )}

          {/* WhatsApp button */}
          <button
            onClick={handleWhatsApp}
            disabled={variations.length > 0 && !selectedVar}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-all shadow-md",
              variations.length > 0 && !selectedVar
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-[#25D366] hover:bg-[#1ebe57] text-white"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z\"/>
            </svg>
            {variations.length > 0 && !selectedVar ? "Selecione uma opção" : "Faça seu pedido"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
