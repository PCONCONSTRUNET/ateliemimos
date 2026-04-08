import logo from "@/assets/logo.png";

interface FooterProps {
  categories?: { id: string; nome: string }[];
  onSelectCategory?: (id: string | null) => void;
}

export const Footer = ({ categories = [], onSelectCategory }: FooterProps) => {
  return (
    <footer className="w-full">
      <div className="bg-gradient-to-t from-primary/15 via-primary/5 to-card border-t border-border p-8 text-center space-y-4">
        {/* Divider line */}
        <div className="w-16 h-[2px] bg-primary/30 mx-auto mb-2" />

        <img src={logo} alt="Ateliê Mimos da Preta" className="h-14 mx-auto opacity-80" />

        <p className="text-sm text-muted-foreground">
          Especialista em bordados. 👜 Bolsas e sintéticos personalizados.
        </p>

        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory?.(cat.id)}
                className="text-xs text-accent hover:text-primary transition-colors font-medium"
              >
                {cat.nome}
              </button>
            ))}
          </div>
        )}

        <div className="w-full h-px bg-border mt-4" />

        <p className="text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} Ateliê Mimos da Preta — Lisangela Moraes
        </p>
      </div>
    </footer>
  );
};
