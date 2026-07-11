import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle } from "lucide-react";
import type { Product } from "@/types/product";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OrderModal } from "@/components/products/OrderModal";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/produtos/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Brayan Beef` }],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const [showOrder, setShowOrder] = useState(false);

  useEffect(() => {
    if (product) trackEvent("product_view", product.id);
  }, [product]);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const response = await fetch(
        `/api/github/read?path=products/${slug}`
      );
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <div className="h-8 w-8 animate-spin border-2 border-accent border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center pt-32">
          <h1 className="font-display text-4xl">Produto não encontrado</h1>
          <Link
            to="/produtos"
            className="mt-6 text-sm text-foreground/60 hover:text-accent transition-colors"
          >
            ← Voltar para produtos
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const finalPrice = product.promotion
    ? product.price * (1 - product.promotion.discount / 100)
    : product.price;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          {/* Back link */}
          <Link
            to="/produtos"
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Voltar
          </Link>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-[4/5] overflow-hidden bg-surface">
                {product.images[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col"
            >
              {/* Meta tags */}
              <div className="mb-6 flex flex-wrap gap-2">
                {product.meta.map((tag) => (
                  <span
                    key={tag}
                    className="border border-line px-3 py-1 text-[10px] uppercase tracking-wider text-foreground/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Name and price */}
              <h1 className="font-display text-4xl md:text-5xl">
                {product.name}
              </h1>
              <p className="mt-4 text-sm text-foreground/60">
                {product.weight} / {product.unit}
              </p>

              <div className="mt-6">
                {product.promotion && (
                  <span className="text-sm text-foreground/40 line-through">
                    R$ {product.price.toFixed(2)}
                  </span>
                )}
                <p className="font-display text-3xl text-accent">
                  R$ {finalPrice.toFixed(2)}
                </p>
              </div>

              {/* Description */}
              <p className="mt-8 text-sm leading-relaxed text-foreground/70">
                {product.description}
              </p>

              {/* WhatsApp CTA */}
              <button
                onClick={() => setShowOrder(true)}
                className="mt-8 flex items-center justify-center gap-3 border border-accent bg-accent/10 py-4 text-sm uppercase tracking-wider text-accent hover:bg-accent hover:text-foreground transition-colors"
              >
                <MessageCircle size={18} />
                Pedir via WhatsApp
              </button>

              <p className="mt-4 text-xs text-foreground/40 text-center">
                Informe quantidade, peso e observações para agilizar o atendimento.
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      <OrderModal product={showOrder ? product : null} onClose={() => setShowOrder(false)} />
    </div>
  );
}
