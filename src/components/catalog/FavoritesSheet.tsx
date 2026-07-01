import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Heart, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export function FavoritesSheet() {
  const { favorites, isFavoritesOpen, setIsFavoritesOpen, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  return (
    <Sheet open={isFavoritesOpen} onOpenChange={setIsFavoritesOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-background/95 backdrop-blur-xl border-l-0 sm:border-l p-0">
        <SheetHeader className="text-left border-b p-6 pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl font-serif">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            Meus Favoritos
          </SheetTitle>
          <SheetDescription>
            Sua lista de produtos desejados.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 px-6 space-y-4">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3">
              <Heart className="w-12 h-12 opacity-20" />
              <p>Sua lista de desejos está vazia.</p>
            </div>
          ) : (
            favorites.map((product) => (
              <div key={product.id} className="flex gap-4 p-3 bg-card rounded-xl border border-border shadow-sm">
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0">
                  {product.imagem ? (
                    <img src={product.imagem} alt={product.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Sem Foto</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-sm line-clamp-2 leading-tight">{product.nome}</h3>
                    <p className="text-primary font-semibold mt-1">{formatPrice(product.preco)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <button 
                      onClick={() => {
                        addToCart(product);
                        toast.success("Produto adicionado ao carrinho!");
                      }}
                      className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-medium"
                    >
                      Adicionar ao Carrinho
                    </button>
                    <button 
                      onClick={() => toggleFavorite(product)}
                      className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
