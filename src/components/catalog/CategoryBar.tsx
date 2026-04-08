interface Category {
  id: string;
  nome: string;
  imagem: string | null;
}

interface CategoryBarProps {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export const CategoryBar = ({ categories, selected, onSelect }: CategoryBarProps) => {
  if (categories.length === 0) return null;

  return (
    <div className="py-6">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onSelect(null)}
          className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
            !selected
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card text-foreground border border-border hover:bg-muted"
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id === selected ? null : cat.id)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selected === cat.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-foreground border border-border hover:bg-muted"
            }`}
          >
            {cat.nome}
          </button>
        ))}
      </div>
    </div>
  );
};
