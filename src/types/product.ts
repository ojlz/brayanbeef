export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  unit: "kg" | "un";
  weight: string;
  category: string;
  images: string[];
  featured: boolean;
  promotion: {
    discount: number;
    label: string;
  } | null;
  available: boolean;
  meta: string[];
}

export type ProductInput = Omit<Product, "id">;
