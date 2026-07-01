import logo from "@/assets/mimos-sem-fundo.png";
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

interface FooterProps {
  categories?: { id: string; nome: string }[];
  onSelectCategory?: (id: string | null) => void;
}

export const Footer = ({ categories = [], onSelectCategory }: FooterProps) => {
  const WHATSAPP_NUMBER = "5548996222795";
  
  const handleWhatsApp = () => {
    const message = encodeURIComponent("Olá! Gostaria de falar com o atendimento.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <footer className="w-full mt-8">
      <div className="bg-gradient-to-b from-card to-muted/20 border-t border-border rounded-t-3xl pt-10 pb-6 px-6 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <img src={logo} alt="Ateliê Mimos da Preta" className="h-16 mb-4 drop-shadow-md" />
            <p className="text-sm font-bold text-foreground">Feito à mão com muito amor e carinho 🤍</p>
            <p className="text-xs text-foreground font-medium mt-1 max-w-[250px]">
              Especialista em bordados, bolsas e sintéticos personalizados.
            </p>
          </div>

          {/* Links e Contatos */}
          <div className="flex flex-col sm:flex-row gap-10 sm:gap-16 justify-center md:justify-end text-sm">
            
            {/* Institucional */}
            <div className="flex flex-col gap-3 text-center sm:text-left">
              <h3 className="font-bold text-foreground mb-1 uppercase tracking-wider text-xs">Institucional</h3>
              <Link to="/termos" className="text-foreground font-medium hover:text-primary transition-colors">Termos de Uso</Link>
              <Link to="/privacidade" className="text-foreground font-medium hover:text-primary transition-colors">Política de Privacidade</Link>
            </div>

            {/* Contato */}
            <div className="flex flex-col gap-3 text-center sm:text-left">
              <h3 className="font-bold text-foreground mb-1 uppercase tracking-wider text-xs">Atendimento</h3>
              <button onClick={handleWhatsApp} className="flex items-center gap-2 text-foreground font-medium hover:text-[#25D366] transition-colors justify-center sm:justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
              <a href="https://www.instagram.com/atelie.mimosdapreta/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground font-medium hover:text-[#E1306C] transition-colors justify-center sm:justify-start">
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
            </div>
          </div>

        </div>

        <div className="w-full h-px bg-border/50 my-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-foreground text-center sm:text-left">
          <div>
            <p>© {new Date().getFullYear()} Ateliê Mimos da Preta. Todos os direitos reservados.</p>
            <p className="mt-0.5">CNPJ: 13.494.872/0001-03</p>
          </div>
          <p>
            Desenvolvido por <a href="https://www.instagram.com/pconconstrunet/" target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:text-primary transition-colors">P-CON CONSTRUNET</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
