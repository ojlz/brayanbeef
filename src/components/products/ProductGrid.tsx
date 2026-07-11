"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { OrderModal } from "./OrderModal";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOrder={setOrderProduct}
          />
        ))}
      </div>
      <OrderModal
        product={orderProduct}
        onClose={() => setOrderProduct(null)}
      />
    </>
  );
}
