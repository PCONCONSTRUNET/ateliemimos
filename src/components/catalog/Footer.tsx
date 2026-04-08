import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4 text-center space-y-4">
        <img src={logo} alt="Ateliê Mimos da Preta" className="h-12 mx-auto opacity-70" />
        <p className="text-sm text-muted-foreground">
          Produtos artesanais feitos com amor e carinho 💕
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ateliê Mimos da Preta — Lisangela Moraes
        </p>
      </div>
    </footer>
  );
};
