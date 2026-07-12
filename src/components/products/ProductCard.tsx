"use client";

import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onOrder: (product: Product) => void;
}

export function ProductCard({ product, onOrder }: ProductCardProps) {
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/img/placeholder.jpg";

  const hasDiscount =
    product.promotion &&
    typeof product.promotion === "object" &&
    "discount" in product.promotion;
  const discountPercent = hasDiscount
    ? (product.promotion as { discount: number }).discount
    : 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - discountPercent / 100)
    : product.price;

  return (
    <div className="group relative bg-white border border-line overflow-hidden">
      {/* Image */}
      <Link to="/produtos/$slug" params={{ slug: product.slug }}>
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {hasDiscount && (
            <span className="absolute left-3 top-3 bg-accent px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
              -{discountPercent}%
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link to="/produtos/$slug" params={{ slug: product.slug }}>
          <h3 className="font-display text-base font-semibold text-foreground">{product.name}</h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-2">
          {product.meta?.map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider text-foreground/40"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="font-display text-xl font-bold text-accent">
              R$ {discountedPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="ml-2 text-xs text-foreground/40 line-through">
                R$ {product.price.toFixed(2)}
              </span>
            )}
            <span className="text-xs text-foreground/40">/{product.unit}</span>
          </div>

          <button
            onClick={() => onOrder(product)}
            className="flex items-center gap-1.5 bg-accent px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-accent/90 transition-colors"
          >
            <MessageCircle size={12} />
            Pedir
          </button>
        </div>
      </div>
    </div>
  );
}
