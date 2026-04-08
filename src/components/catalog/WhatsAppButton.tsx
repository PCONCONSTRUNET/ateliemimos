import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5500000000000"; // TODO: substituir pelo número real

export const WhatsAppButton = () => {
  const handleClick = () => {
    const message = encodeURIComponent("Olá! Gostaria de saber mais sobre os produtos do ateliê.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
};
