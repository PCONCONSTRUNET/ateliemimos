import logo from "@/assets/logo.png";

interface FooterProps {
  categories?: { id: string; nome: string }[];
  onSelectCategory?: (id: string | null) => void;
}

export const Footer = ({ categories = [], onSelectCategory }: FooterProps) => {
  return (
    <footer className="w-full mt-4">
      <div className="bg-gradient-to-t from-primary/15 via-primary/5 to-card border-t border-border rounded-t-3xl p-8 pb-12 text-center space-y-4">
        {/* Divider line */}
        <div className="w-20 h-[3px] bg-primary/50 mx-auto mb-2 rounded-full" />

        <img src={logo} alt="Ateliê Mimos da Preta" className="h-14 mx-auto opacity-80" />

        <p className="text-sm text-muted-foreground">
          Especialista em bordados. 👜 Bolsas e sintéticos personalizados.
        </p>


        <div className="w-full h-px bg-border mt-4" />

        <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
          <p>© {new Date().getFullYear()} Ateliê Mimos da Preta — Lisangela Moraes</p>
          <p>
            Desenvolvido por <a href="https://www.instagram.com/pconconstrunet/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-primary transition-colors">P-CON CONSTRUNET</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
