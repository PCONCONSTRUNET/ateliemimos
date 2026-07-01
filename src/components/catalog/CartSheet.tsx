import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/mimos-sem-fundo.png";

const WHATSAPP_NUMBER = "5548996222795";

export function CartSheet() {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    isCartOpen, 
    setIsCartOpen,
    subtotal,
    discount,
    total,
    coupon,
    applyCoupon,
    removeCoupon
  } = useCart();
  
  const [couponCode, setCouponCode] = useState("");

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      applyCoupon(couponCode);
      setCouponCode("");
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const handleCheckout = () => {
    let message = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
    
    items.forEach(({ product, quantity }) => {
      message += `*${quantity}x ${product.nome}* - ${formatPrice(product.preco * quantity)}\n`;
    });
    
    message += `\nSubtotal: ${formatPrice(subtotal)}`;
    
    if (coupon) {
      message += `\nDesconto (${coupon.code}): - ${formatPrice(discount)}`;
    }
    
    message += `\n*Total:* ${formatPrice(total)}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-background/95 backdrop-blur-xl border-l-0 sm:border-l p-0">
        <SheetHeader className="text-left border-b p-6 pb-4">
          <SheetTitle className="flex items-center gap-2 text-2xl font-serif text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" strokeLinejoin="round" strokeLinecap="round" viewBox="0 0 24 24" strokeWidth={2} fill="none" stroke="currentColor" className="w-6 h-6">
              <circle r={1} cy={21} cx={9} />
              <circle r={1} cy={21} cx={20} />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Meu Carrinho
          </SheetTitle>
          <SheetDescription className="text-foreground/80 font-medium text-sm mt-1">
            Revise seus itens e finalize o pedido via WhatsApp.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 px-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-foreground space-y-4">
              <div className="w-32 h-32 mb-2 flex items-center justify-center">
                <img src={logo} alt="Ateliê Mimos da Preta" className="w-full h-full object-contain opacity-90 drop-shadow-sm" />
              </div>
              <p className="font-bold text-lg">Seu carrinho está vazio.</p>
              <p className="text-sm text-muted-foreground text-center">Navegue pelos produtos e adicione os que você mais gostou!</p>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
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
                    <div className="flex items-center bg-muted rounded-md overflow-hidden border border-border">
                      <button 
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1.5 hover:bg-background transition-colors text-foreground"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-medium">{quantity}</span>
                      <button 
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1.5 hover:bg-background transition-colors text-foreground"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(product.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-3 mt-auto bg-background/80 backdrop-blur-md">
            <div className="relative flex items-center">
              <Input 
                placeholder="CUPOM DE DESCONTO" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                className="bg-card uppercase pr-24 rounded-full h-10 border-primary/20 focus-visible:ring-primary/30 text-[16px]"
              />
              <Button 
                size="sm"
                onClick={handleApplyCoupon}
                className="absolute right-1 h-8 rounded-full px-4 text-xs font-bold transition-all"
              >
                Aplicar
              </Button>
            </div>

            {coupon && (
              <div className="flex items-center justify-between px-3 py-2 bg-primary/10 text-primary text-sm rounded-lg border border-primary/20">
                <span>Cupom <b>{coupon.code}</b> ({coupon.discount_percent}%)</span>
                <button onClick={removeCoupon} className="hover:underline text-xs">Remover</button>
              </div>
            )}

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>Desconto</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-1.5 border-t border-border mt-1.5">
                <span className="text-foreground">Total</span>
                <span className="text-[#3cb371] text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            <button 
              className="contactButton w-full justify-center mt-2" 
              onClick={handleCheckout}
            >
              Finalizar Pedido
              <div className="iconButton">
                <svg height={24} width={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" fill="currentColor" />
                </svg>
              </div>
            </button>
            <style>{`
              .contactButton {
                background: #3cb371;
                color: white;
                font-family: inherit;
                padding: 0.5em;
                padding-left: 1.2em;
                font-size: 16px;
                font-weight: 600;
                border-radius: 1em;
                border: none;
                letter-spacing: 0.05em;
                display: flex;
                align-items: center;
                box-shadow: inset 0 0 1.8em -0.7em #2e8b57;
                overflow: hidden;
                position: relative;
                height: 3em;
                padding-right: 3.5em;
                cursor: pointer;
              }

              .iconButton {
                margin-left: 1.2em;
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 2.4em;
                width: 2.4em;
                border-radius: 1.2em;
                box-shadow: 0.15em 0.15em 0.8em 0.3em #32cd32;
                right: 0.4em;
                transition: all 0.3s;
              }

              .contactButton:hover {
                transform: translate(-0.05em, -0.05em);
                box-shadow: 0.2em 0.2em #228b22;
              }

              .contactButton:active {
                transform: translate(0.05em, 0.05em);
                box-shadow: 0.1em 0.1em #228b22;
              }
            `}</style>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
