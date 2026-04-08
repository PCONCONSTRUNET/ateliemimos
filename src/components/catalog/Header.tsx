import { Search, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: { id: string; nome: string }[];
  onSelectCategory: (id: string | null) => void;
}

export const Header = ({ searchQuery, onSearchChange, categories, onSelectCategory }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Hamburger */}
          <button onClick={() => setMenuOpen(true)} className="p-1 text-foreground">
            <Menu className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 rounded-full bg-muted/50 border-border text-sm"
            />
          </div>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="Ateliê Mimos da Preta" className="h-10 w-10 object-contain" />
          </Link>
        </div>
      </header>

      {/* Side Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-card h-full shadow-xl animate-fade-in flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <img src={logo} alt="Logo" className="h-12 object-contain" />
              <button onClick={() => setMenuOpen(false)} className="p-1 text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              <button
                onClick={() => { onSelectCategory(null); setMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Todos os Produtos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { onSelectCategory(cat.id); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                >
                  {cat.nome}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Ateliê Mimos da Preta © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
