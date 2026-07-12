import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useBusiness } from "@/hooks/useBusiness";
import { trackEvent } from "@/lib/analytics";
import { MessageCircle, Star, MapPin, Phone, Clock, ChevronRight } from "lucide-react";
import type { Product } from "@/types/product";

import heroPicanha from "@/assets/hero-picanha.jpg";
import cutPicanha from "@/assets/cut-picanha.jpg";
import cutCostela from "@/assets/cut-costela.jpg";
import cutAncho from "@/assets/cut-ancho.jpg";
import cutFraldinha from "@/assets/cut-fraldinha.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brayan Beef — Carnes Premium em Porto Fictício�, MS" },
      {
        name: "description",
        content: "Brayan Beef — Carnes Angus premium em Porto Fictício�, MS. Picanha, costela, ancho e fraldinha de alta qualidade. Açougue artesanal com entrega pelo WhatsApp.",
      },
      { property: "og:title", content: "Brayan Beef — Carnes Premium em Porto Fictício�, MS" },
      {
        property: "og:description",
        content: "Carnes Angus premium em Porto Fictício�, MS. Picanha, costela, ancho e fraldinha selecionados.",
      },
      { property: "og:image", content: "https://brayanbeef.vercel.app/img/picanha.jpg" },
    ],
  }),
  component: Index,
});

/* --- 5 stars signature --- */
function FiveStars({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Star size={18} className="fill-white text-white" />
      <Star size={18} className="fill-white text-white" />
      <Star size={22} className="text-white/40" strokeWidth={1.5} />
      <Star size={18} className="fill-white text-white" />
      <Star size={18} className="fill-white text-white" />
    </div>
  );
}

/* --- Fade in on scroll --- */
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Index() {
  const { data: business } = useBusiness();
  const slogan = business?.slogan || "Aqui fazemos do seu jeito!";
  const street = business?.address?.street || "Av. Fictícia";
  const number = business?.address?.number || "333";
  const neighborhood = business?.address?.neighborhood || "Centro";
  const city = business?.address?.city || "Porto Fictício�";
  const state = business?.address?.state || "MS";
  const whatsapp = business?.whatsapp || "5500090000009";
  const phone = business?.phone || "(00) 90000-0009";

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/github/read?path=products");
      return res.json();
    },
  });

  useEffect(() => {
    if (business) trackEvent("page_view");
  }, [business]);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);

  return (
    <main className="relative bg-white text-foreground">

      {/* ============ HERO ============ */}
      <section className="relative h-[85vh] md:h-[90vh] overflow-hidden">
        <img
          src={heroPicanha}
          alt="Churrasco Brayan Beef"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-accent/80 via-accent/60 to-accent/90" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FiveStars className="justify-center mb-6" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-[14vw] leading-[0.85] text-white md:text-[8vw] font-bold"
          >
            BRAYAN
            <br />
            <span className="text-white/90">BEEF</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 max-w-md text-balance text-lg text-white/80"
          >
            {slogan}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <a
              href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-white text-accent px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-white/90 transition-colors"
            >
              <MessageCircle size={18} />
              Faça seu pedido
            </a>
            <a
              href="#produtos"
              className="flex items-center gap-2 border-2 border-white/40 text-white px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] hover:border-white hover:bg-white/10 transition-colors"
            >
              Ver cardápio
              <ChevronRight size={18} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ============ INFO BAR ============ */}
      <section className="bg-accent text-white py-6">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-8 px-6 text-sm md:gap-16">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{street}, {number} — {city}, {state}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} />
            <span>{phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Seg-Sáb 08h às 20h30</span>
          </div>
        </div>
      </section>

      {/* ============ SOBRE ============ */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <FadeIn>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Quem somos
              </p>
              <h2 className="font-display text-4xl font-bold leading-[1.1] md:text-5xl">
                O segredo do sabor
                <br />
                <span className="text-accent">é o preparo simples!</span>
              </h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-foreground/60">
                Selecionamos cada corte com rigor e procedência. Do frigorífico à sua mesa,
                entregamos qualidade que conquista. Aqui fazemos do seu jeito!
              </p>
              <div className="mt-8 flex items-center gap-6">
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-accent">4.8</p>
                  <div className="mt-1 flex justify-center gap-0.5 text-accent">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} size={12} className={i <= 4 ? "fill-current" : "fill-current opacity-40"} />
                    ))}
                  </div>
                  <p className="mt-1 text-[10px] text-foreground/40">63 avaliações</p>
                </div>
                <div className="h-12 w-px bg-line" />
                <div>
                  <p className="font-display text-3xl font-bold text-accent">5mil+</p>
                  <p className="mt-1 text-[10px] text-foreground/40">Clientes satisfeitos</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="relative">
                <img
                  src={cutPicanha}
                  alt="Picanha premium Brayan Beef"
                  className="w-full object-cover"
                />
                <div className="absolute -bottom-4 -left-4 bg-accent px-6 py-3 text-sm font-bold text-white shadow-xl">
                  ★★★☆★ Desde 2023
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ============ CORTES ============ */}
      <section id="cortes" className="bg-surface py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <FadeIn>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Nossos cortes
            </p>
            <h2 className="font-display text-4xl font-bold leading-[1.1] md:text-5xl">
              Seleção premium
            </h2>
          </FadeIn>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {[
              { name: "Picanha", img: cutPicanha, tag: "Angus" },
              { name: "Costela", img: cutCostela, tag: "Reserva" },
              { name: "Ancho", img: cutAncho, tag: "Signature" },
              { name: "Fraldinha", img: cutFraldinha, tag: "Clássica" },
            ].map((cut, i) => (
              <FadeIn key={cut.name} delay={i * 0.1}>
                <div className="group relative overflow-hidden bg-white">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={cut.img}
                      alt={`Corte de ${cut.name} Brayan Beef`}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-bold">{cut.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-accent font-semibold">
                      {cut.tag}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRODUTOS EM DESTAQUE ============ */}
      {featuredProducts.length > 0 && (
        <section id="produtos" className="py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <FadeIn>
              <div className="flex items-end justify-between">
                <div>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                    Destaques
                  </p>
                  <h2 className="font-display text-4xl font-bold leading-[1.1] md:text-5xl">
                    Mais pedidos
                  </h2>
                </div>
                <Link
                  to="/produtos"
                  className="hidden items-center gap-1 text-sm font-semibold text-accent hover:underline md:flex"
                >
                  Ver todos <ChevronRight size={16} />
                </Link>
              </div>
            </FadeIn>

            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {featuredProducts.map((product, i) => {
                const imageUrl = product.images?.[0] || "/img/placeholder.jpg";
                const hasDiscount = product.promotion && typeof product.promotion === "object" && "discount" in product.promotion;
                const discount = hasDiscount ? (product.promotion as { discount: number }).discount : 0;
                const finalPrice = hasDiscount ? product.price * (1 - discount / 100) : product.price;

                return (
                  <FadeIn key={product.id} delay={i * 0.1}>
                    <div className="group relative bg-white overflow-hidden">
                      <Link to="/produtos/$slug" params={{ slug: product.slug }}>
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          {hasDiscount && (
                            <span className="absolute left-3 top-3 bg-accent px-3 py-1.5 text-[10px] font-bold text-white">
                              -{discount}%
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        <h3 className="font-display text-base font-bold">{product.name}</h3>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="font-display text-xl font-bold text-accent">
                            R$ {finalPrice.toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-foreground/40 line-through">
                              R$ {product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <a
                          href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20gostaria%20de%20pedir%20${encodeURIComponent(product.name)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 flex w-full items-center justify-center gap-2 bg-accent py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-accent/90 transition-colors"
                        >
                          <MessageCircle size={14} />
                          Pedir
                        </a>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link
                to="/produtos"
                className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
              >
                Ver todos os produtos <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============ CTA VERMELHO ============ */}
      <section className="bg-accent py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-6 text-center md:px-10">
          <FadeIn>
            <FiveStars className="justify-center mb-6" />
            <h2 className="font-display text-4xl font-bold leading-[1.1] text-white md:text-6xl">
              Seu próximo churrasco
              <br />
              começa aqui!
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg text-white/80">
              Faça seu pedido pelo WhatsApp e receba em casa.
              Qualidade e sabor que você merece!
            </p>
            <a
              href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-white text-accent px-10 py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-white/90 transition-colors"
            >
              <MessageCircle size={18} />
              Pedir pelo WhatsApp
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ============ HORÁRIOS ============ */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid gap-12 md:grid-cols-2">
            <FadeIn>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Localização
              </p>
              <h2 className="font-display text-4xl font-bold leading-[1.1] md:text-5xl">
                Venha nos
                <br />
                <span className="text-accent">conhecer!</span>
              </h2>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 text-accent" />
                  <div>
                    <p className="font-semibold">{street}, {number}</p>
                    <p className="text-sm text-foreground/60">{neighborhood} — {city}, {state}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 text-accent" />
                  <p className="font-semibold">{phone}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} className="mt-0.5 text-accent" />
                  <div>
                    <p className="font-semibold">Horário de funcionamento</p>
                    <p className="text-sm text-foreground/60">Seg-Sáb: 08h às 20h30</p>
                    <p className="text-sm text-foreground/60">Domingo: 08h às 13h</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="h-full min-h-[400px] bg-surface">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3697.6!2d-54.19!3d-23.03!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDAxJzQ4LjAiUyA1NMKwMTEnMjQuMCJX!5e0!3m2!1spt-BR!2sbr!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização Brayan Beef"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-accent text-white">
        <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-10">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="font-display text-3xl font-bold tracking-tight">
                BRAYAN <span className="text-white/80">BEEF</span>
              </div>
              <FiveStars className="mt-4" />
              <p className="mt-4 max-w-xs text-sm text-white/70">{slogan}</p>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                Contato
              </h4>
              <div className="space-y-3 text-sm text-white/80">
                <p className="flex items-center gap-2">
                  <Phone size={14} /> {phone}
                </p>
                <p className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5" />
                  {street}, {number} — {neighborhood}, {city}, {state}
                </p>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                Navegação
              </h4>
              <div className="flex flex-col gap-3 text-sm text-white/80">
                <Link to="/produtos" className="hover:text-white transition-colors">Produtos</Link>
                <Link to="/sobre" className="hover:text-white transition-colors">Sobre</Link>
                <Link to="/contato" className="hover:text-white transition-colors">Contato</Link>
                <a href={`https://wa.me/${whatsapp}`} className="hover:text-white transition-colors">WhatsApp</a>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-white/20 pt-6 text-center text-[10px] uppercase tracking-[0.3em] text-white/50">
            © {new Date().getFullYear()} Brayan Beef — {street}, {number} — {city}, {state}
          </div>
        </div>
      </footer>
    </main>
  );
}
