import { Badge } from "@/components/ui/badge";

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

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-card rounded-lg overflow-hidden border border-border hover:shadow-md transition-all duration-300"
    >
      {/* Image */}
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

        {/* Tags */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.destaque && (
            <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
              ✨ Destaque
            </Badge>
          )}
          <Badge
            className={`text-[10px] px-2 py-0.5 ${
              product.disponivel
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {product.disponivel ? "Disponível" : "Sob encomenda"}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1">
          {product.nome}
        </h3>
        <p className="text-primary font-semibold text-sm">
          {formatPrice(product.preco)}
        </p>
      </div>
    </button>
  );
};
