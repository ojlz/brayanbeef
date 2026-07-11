import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CategoryFilter } from "@/components/products/CategoryFilter";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — Brayan Beef | Carnes Premium em Porto Fictício�, MS" },
      {
        name: "description",
        content:
          "Conheça nossa seleção de carnes premium em Porto Fictício�, MS. Picanha, costela, ancho, fraldinha Angus e mais.",
      },
      { property: "og:title", content: "Produtos — Brayan Beef" },
      {
        property: "og:description",
        content: "Carnes Angus premium em Porto Fictício�, MS. Picanha, costela, ancho e fraldinha selecionados.",
      },
      { property: "og:image", content: "https://brayanbeef.vercel.app/img/picanha.jpg" },
    ],
  }),
  component: ProdutosPage,
});

function ProdutosPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null
  );

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/github/read?path=products");
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/github/read?path=categories");
      return response.json();
    },
  });

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-foreground/50">
              — Nossos Produtos
            </p>
            <h1 className="font-display text-5xl leading-[0.95] md:text-7xl">
              Seleção <span className="text-accent">premium</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm text-foreground/60">
              Cada corte é selecionado com rigor e maturação ideal. Do
              frigorífico direto para a sua mesa.
            </p>
          </motion.div>

          {/* Filters */}
          <div className="mt-12">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          {/* Product grid */}
          <div className="mt-12">
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm text-foreground/50">
                  Nenhum produto encontrado nesta categoria.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
