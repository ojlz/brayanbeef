export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
}

export type CategoryInput = Omit<Category, "id">;
