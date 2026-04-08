interface Category {
  id: string;
  nome: string;
  imagem: string | null;
}

interface CategoryGridProps {
  categories: Category[];
  onSelect: (id: string) => void;
}

export const CategoryGrid = ({ categories, onSelect }: CategoryGridProps) => {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300"
        >
          {cat.imagem ? (
            <img
              src={cat.imagem}
              alt={cat.nome}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/25" />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />

          {/* Label */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-semibold text-card font-serif tracking-wide">
              {cat.nome}
            </h3>
          </div>
        </button>
      ))}
    </div>
  );
};
