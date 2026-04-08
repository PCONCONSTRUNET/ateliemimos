import { categoryImages } from "@/lib/sample-images";

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
      {categories.map((cat, index) => {
        const imageUrl = cat.imagem || categoryImages[cat.nome] || null;

        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-in-scale"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={cat.nome}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/25" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-sm font-semibold text-card font-serif tracking-wide">
                {cat.nome}
              </h3>
            </div>
          </button>
        );
      })}
    </div>
  );
};
