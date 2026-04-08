import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface Product {
  id: string;
  nome: string;
  preco: number;
  descricao: string | null;
  imagem: string | null;
  categoria_id: string | null;
  destaque: boolean;
  disponivel: boolean;
}

interface ProductModalProps {
  product: Product | null;
  categoryName: string;
  onClose: () => void;
}

const WHATSAPP_NUMBER = "5500000000000"; // TODO: substituir pelo número real

export const ProductModal = ({ product, categoryName, onClose }: ProductModalProps) => {
  if (!product) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no produto: *${product.nome}* - ${formatPrice(product.preco)}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <Dialog open={!!product} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-card">
        {/* Image */}
        {product.imagem && (
          <div className="aspect-square w-full overflow-hidden bg-muted">
            <img
              src={product.imagem}
              alt={product.nome}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-foreground">
              {product.nome}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detalhes do produto {product.nome}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className={
                product.disponivel
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }
            >
              {product.disponivel ? "Disponível" : "Sob encomenda"}
            </Badge>
            {categoryName && (
              <Badge variant="outline" className="text-muted-foreground">
                {categoryName}
              </Badge>
            )}
            {product.destaque && (
              <Badge className="bg-primary text-primary-foreground">✨ Destaque</Badge>
            )}
          </div>

          <p className="text-2xl font-semibold text-primary font-serif">
            {formatPrice(product.preco)}
          </p>

          {product.descricao && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.descricao}
            </p>
          )}

          <Button
            onClick={handleWhatsApp}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-primary-foreground gap-2 h-12 text-base"
          >
            <MessageCircle className="h-5 w-5" />
            Comprar pelo WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
