"use client";

import { MessageCircle } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onOrder: (product: Product) => void;
}

export function ProductCard({ product, onOrder }: ProductCardProps) {
  const imageUrl = product.images?.[0] || "/img/placeholder.jpg";
  const hasDiscount = product.promotion && typeof product.promotion === "object" && "discount" in product.promotion;
  const discount = hasDiscount ? (product.promotion as { discount: number }).discount : 0;
  const finalPrice = hasDiscount ? product.price * (1 - discount / 100) : product.price;

  return (
    <div className="group bg-white overflow-hidden">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {hasDiscount && (
          <span className="absolute left-3 top-3 bg-accent px-3 py-1.5 text-[11px] font-bold text-white">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-bold text-foreground">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          {product.meta?.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] uppercase tracking-wider text-foreground/40 font-medium">{tag}</span>
          ))}
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="font-display text-xl font-bold text-accent">R$ {finalPrice.toFixed(2)}</span>
            {hasDiscount && <span className="ml-2 text-xs text-foreground/40 line-through">R$ {product.price.toFixed(2)}</span>}
            <span className="text-xs text-foreground/40">/{product.unit}</span>
          </div>
          <button
            onClick={() => onOrder(product)}
            className="flex items-center gap-1.5 bg-accent px-3 py-2 text-[11px] font-bold text-white hover:bg-accent/90 transition-colors"
          >
            <MessageCircle size={14} /> Pedir
          </button>
        </div>
      </div>
    </div>
  );
}
