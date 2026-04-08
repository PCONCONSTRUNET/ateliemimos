import logo from "@/assets/logo.png";

interface FooterProps {
  categories: { id: string; nome: string }[];
  onSelectCategory: (id: string | null) => void;
}

export const Footer = ({ categories, onSelectCategory }: FooterProps) => {
  return (
    <footer className="bg-gradient-to-t from-primary/15 via-primary/5 to-background pt-10 pb-6">
      <div className="container mx-auto px-4 text-center space-y-4">
        {/* Logo */}
        <img src={logo} alt="Ateliê Mimos da Preta" className="h-14 mx-auto opacity-80" />

        {/* Tagline */}
        <p className="text-sm text-muted-foreground">
          Costura criativa, bordados e peças personalizadas.
        </p>

        {/* Category links */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="text-xs text-accent hover:text-primary transition-colors font-medium"
              >
                {cat.nome}
              </button>
            ))}
          </div>
        )}

        {/* Copyright */}
        <p className="text-[11px] text-muted-foreground pt-4">
          © {new Date().getFullYear()} Ateliê Mimos da Preta — Lisangela Moraes
        </p>
      </div>
    </footer>
  );
};
