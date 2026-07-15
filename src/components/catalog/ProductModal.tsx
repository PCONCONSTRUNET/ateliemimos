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
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";

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

export const ProductModal = ({ product, categoryName, onClose, extraImages = [] }: ProductModalProps) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [selectedVar, setSelectedVar] = useState<ProductVariation | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (product) {
      fetchVariations();
      setSelectedVar(null);
    }
  }, [product]);

  const fetchVariations = async () => {
    if (!product) return;
    const { data, error } = await supabase
      .from("product_variations")
      .select("*")
      .eq("product_id", product.id)
      .order("preco", { ascending: true });
    if (error) console.error("Erro ao buscar variações:", error);
    if (data) setVariations(data);
  };

  if (!product) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const displayPrice = selectedVar ? selectedVar.preco : product.preco;

  const handleAddToCart = () => {
    let productToAdd = { ...product };
    if (selectedVar) {
      productToAdd = {
        ...product,
        id: `${product.id}-${selectedVar.id}`,
        nome: `${product.nome} (${selectedVar.nome})`,
        preco: selectedVar.preco
      };
    }
    addToCart(productToAdd);
    onClose();
  };

  // Build image list: main image + extra images from product_images table
  const allImages: string[] = [];
  if (product.imagem) allImages.push(product.imagem);
  extraImages.forEach((url) => {
    if (!allImages.includes(url)) allImages.push(url);
  });

  const hasManyVariations = variations.length > 5;

  return (
    <Dialog open={!!product} onOpenChange={() => onClose()}>
      <DialogContent
        className={cn(
          "max-w-md w-[calc(100%-2rem)] max-h-[90dvh] flex flex-col overflow-hidden p-0 bg-card rounded-2xl gap-0",
          "top-[max(0.75rem,env(safe-area-inset-top,0.75rem))] translate-y-0",
          "sm:top-[50%] sm:translate-y-[-50%]"
        )}
      >
        {/* Image carousel — altura limitada para liberar espaço às opções */}
        {allImages.length > 0 && (
          <div className="shrink-0">
            <ProductImageCarousel
              images={allImages}
              alt={product.nome}
              className={cn(
                "w-full aspect-[4/3]",
                hasManyVariations && "max-h-[28dvh] aspect-auto min-h-[140px]"
              )}
            />
          </div>
        )}

        {/* Conteúdo rolável */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
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
                <div
                  className={cn(
                    "flex flex-col gap-2",
                    hasManyVariations &&
                      "max-h-[min(240px,32dvh)] overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]"
                  )}
                >
                  {variations.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVar(v)}
                      className={cn(
                        "w-full px-4 py-2.5 rounded-xl text-xs font-medium border-2 transition-all text-left",
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
          </div>
        </div>

        {/* Botão fixo no rodapé — sempre visível */}
        <div className="shrink-0 border-t border-border/40 bg-card p-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))]">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={variations.length > 0 && !selectedVar}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-all shadow-md",
              variations.length > 0 && !selectedVar
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            <ShoppingBag className="w-5 h-5" />
            {variations.length > 0 && !selectedVar ? "Selecione uma opção" : "Adicionar ao Carrinho"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
