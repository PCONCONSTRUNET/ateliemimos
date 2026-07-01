import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";

interface Product {
  id: string;
  nome: string;
  preco: number;
  imagem: string | null;
  destaque: boolean;
  disponivel: boolean;
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.imagem ? (
          <img
            src={product.imagem}
            alt={product.nome}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Sem imagem
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!product.disponivel && (
            <Badge className="bg-foreground/80 text-background text-[10px] px-2 py-0.5 rounded-full">
              Esgotado
            </Badge>
          )}
          {product.destaque && product.disponivel && (
            <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
              ✨ Destaque
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(product);
            }}
            className="p-1.5 bg-background/80 hover:bg-background rounded-full backdrop-blur-sm shadow-sm transition-colors"
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} />
          </button>
        </div>
        {!product.disponivel && (
          <div className="absolute inset-0 bg-background/40" />
        )}
      </div>
      <div className="p-3 space-y-1">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">
          {product.nome}
        </h3>
        <p className={`font-semibold text-sm ${product.disponivel ? "text-primary" : "text-muted-foreground line-through"}`}>
          {formatPrice(product.preco)}
        </p>
      </div>
    </button>
  );
};
