import type { Category } from "@/types/category";

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
          selected === null
            ? "bg-accent text-foreground"
            : "border border-line text-foreground/60 hover:text-foreground"
        }`}
      >
        Todos
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.slug)}
          className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
            selected === category.slug
              ? "bg-accent text-foreground"
              : "border border-line text-foreground/60 hover:text-foreground"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
