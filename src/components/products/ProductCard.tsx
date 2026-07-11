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
    <div className="group relative bg-background border border-line">
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
            <span className="absolute left-4 top-4 bg-accent px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-accent-foreground">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-5">
        <Link to="/produtos/$slug" params={{ slug: product.slug }}>
          <h3 className="font-display text-base">{product.name}</h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          {product.meta?.map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider text-foreground/40"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg">
              R$ {discountedPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-foreground/40 line-through">
                R$ {product.price.toFixed(2)}
              </span>
            )}
            <span className="text-xs text-foreground/40">/{product.unit}</span>
          </div>

          <button
            onClick={() => onOrder(product)}
            className="flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/30 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <MessageCircle size={12} />
            Pedir
          </button>
        </div>
      </div>
    </div>
  );
}
