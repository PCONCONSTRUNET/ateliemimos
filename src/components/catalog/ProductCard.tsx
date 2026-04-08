import { Badge } from "@/components/ui/badge";
import { productImages } from "@/lib/sample-images";

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
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const imageUrl = product.imagem || productImages[product.nome] || null;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
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
          {product.destaque && (
            <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
              ✨ Destaque
            </Badge>
          )}
        </div>
      </div>
      <div className="p-3 space-y-1">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">
          {product.nome}
        </h3>
        <p className="text-primary font-semibold text-sm">
          {formatPrice(product.preco)}
        </p>
      </div>
    </button>
  );
};
