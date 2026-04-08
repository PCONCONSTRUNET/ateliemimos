import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const WHATSAPP_NUMBER = "5500000000000";

export const HeroBanner = () => {
  const handleWhatsApp = () => {
    const message = encodeURIComponent("Olá! Gostaria de saber mais sobre os produtos do ateliê.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background">
      <div className="px-6 py-10 text-center space-y-4">
        {/* Category tag */}
        <span className="inline-block bg-primary/20 text-accent text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          Personalizados
        </span>

        {/* Logo */}
        <img src={logo} alt="Ateliê Mimos da Preta" className="h-28 mx-auto object-contain" />

        {/* Description */}
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Peças artesanais, bordados e costuras exclusivas feitas com carinho para você.
        </p>

        {/* WhatsApp CTA */}
        <Button
          onClick={handleWhatsApp}
          className="rounded-full px-6 h-11 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
        >
          <MessageCircle className="h-5 w-5" />
          Fale conosco
        </Button>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 pt-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="w-2 h-2 rounded-full bg-primary/40" />
          <span className="w-2 h-2 rounded-full bg-primary/40" />
          <span className="w-2 h-2 rounded-full bg-border" />
        </div>
      </div>
    </section>
  );
};
