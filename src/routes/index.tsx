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
      { name: "description", content: "Brayan Beef — Carnes Angus premium em Porto Fictício�, MS. Picanha, costela, ancho e fraldinha de alta qualidade. Aqui fazemos do seu jeito!" },
      { property: "og:title", content: "Brayan Beef — Carnes Premium em Porto Fictício�, MS" },
      { property: "og:description", content: "Carnes Angus premium em Porto Fictício�, MS. Picanha, costela, ancho e fraldinha selecionados." },
      { property: "og:image", content: "https://brayanbeef.vercel.app/img/picanha.jpg" },
    ],
  }),
  component: Index,
});

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
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
    queryFn: async () => (await fetch("/api/github/read?path=products")).json(),
  });

  useEffect(() => { if (business) trackEvent("page_view"); }, [business]);

  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <main className="bg-white text-foreground">

      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] bg-accent flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img src={heroPicanha} alt="" className="h-full w-full object-cover opacity-30" />
        </div>
        <div className="relative z-10 mx-auto max-w-[1400px] w-full px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="flex items-center gap-1 mb-6">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} size={20} className={i <= 4 ? "fill-white text-white" : "text-white/40"} />
                  ))}
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="font-display text-[14vw] leading-[0.85] text-white font-bold md:text-[7vw]"
              >
                BRAYAN<br />BEEF
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-6 text-lg text-white/80 max-w-md"
              >
                {slogan}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <a
                  href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-white text-accent px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
                >
                  <MessageCircle size={18} /> Faça seu pedido
                </a>
                <a href="#cortes" className="flex items-center justify-center gap-2 border-2 border-white/40 text-white px-8 py-4 text-sm font-bold uppercase tracking-wider hover:border-white transition-colors">
                  Ver cortes <ChevronRight size={18} />
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden md:block"
            >
              <img src={cutPicanha} alt="Picanha premium" className="w-full object-cover shadow-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== INFO BAR ===== */}
      <section className="bg-white border-b border-line">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-6 px-5 py-5 text-sm text-foreground/70 md:gap-12 md:px-8">
          <div className="flex items-center gap-2"><MapPin size={16} className="text-accent" /><span>{street}, {number} — {city}</span></div>
          <div className="flex items-center gap-2"><Phone size={16} className="text-accent" /><span>{phone}</span></div>
          <div className="flex items-center gap-2"><Clock size={16} className="text-accent" /><span>Seg-Sáb 08h às 20h30</span></div>
        </div>
      </section>

      {/* ===== SOBRE ===== */}
      <section id="sobre" className="py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <FadeIn>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">Quem somos</p>
              <h2 className="font-display text-4xl font-bold leading-[1.05] md:text-5xl">
                O segredo do sabor<br />
                <span className="text-accent">é o preparo simples!</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-foreground/60">
                Selecionamos cada corte com rigor e procedência. Do frigorífico à sua mesa, entregamos qualidade que conquista.
              </p>
              <div className="mt-8 flex items-center gap-8">
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-accent">4.8</p>
                  <div className="mt-1 flex justify-center gap-0.5 text-accent">
                    {[1,2,3,4,5].map((i) => <Star key={i} size={12} className={i <= 4 ? "fill-current" : "fill-current opacity-40"} />)}
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
            <FadeIn delay={0.15}>
              <div className="relative">
                <img src={cutPicanha} alt="Corte premium" className="w-full object-cover" />
                <div className="absolute -bottom-3 -left-3 bg-accent px-5 py-2 text-xs font-bold text-white shadow-lg">
                  ★★★★★ Desde 2023
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== CORTES ===== */}
      <section id="cortes" className="bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8">
          <FadeIn>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">Nossos cortes</p>
            <h2 className="font-display text-4xl font-bold leading-[1.05] md:text-5xl">Seleção premium</h2>
          </FadeIn>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {[
              { name: "Picanha", img: cutPicanha, tag: "Angus" },
              { name: "Costela", img: cutCostela, tag: "Reserva" },
              { name: "Ancho", img: cutAncho, tag: "Signature" },
              { name: "Fraldinha", img: cutFraldinha, tag: "Clássica" },
            ].map((cut, i) => (
              <FadeIn key={cut.name} delay={i * 0.08}>
                <div className="group bg-white overflow-hidden">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={cut.img} alt={cut.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-display text-base font-bold">{cut.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-accent font-bold">{cut.tag}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRODUTOS ===== */}
      {featured.length > 0 && (
        <section id="produtos" className="py-16 md:py-24">
          <div className="mx-auto max-w-[1400px] px-5 md:px-8">
            <FadeIn>
              <div className="flex items-end justify-between">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">Destaques</p>
                  <h2 className="font-display text-4xl font-bold leading-[1.05] md:text-5xl">Mais pedidos</h2>
                </div>
                <Link to="/produtos" className="hidden items-center gap-1 text-sm font-bold text-accent hover:underline md:flex">Ver todos <ChevronRight size={16} /></Link>
              </div>
            </FadeIn>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              {featured.map((product, i) => {
                const img = product.images?.[0] || "/img/placeholder.jpg";
                const hasDiscount = product.promotion && typeof product.promotion === "object" && "discount" in product.promotion;
                const discount = hasDiscount ? (product.promotion as { discount: number }).discount : 0;
                const price = hasDiscount ? product.price * (1 - discount / 100) : product.price;
                return (
                  <FadeIn key={product.id} delay={i * 0.08}>
                    <div className="group bg-white overflow-hidden">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img src={img} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        {hasDiscount && <span className="absolute left-3 top-3 bg-accent px-3 py-1.5 text-[11px] font-bold text-white">-{discount}%</span>}
                      </div>
                      <div className="p-4">
                        <h3 className="font-display text-base font-bold">{product.name}</h3>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="font-display text-xl font-bold text-accent">R$ {price.toFixed(2)}</span>
                          {hasDiscount && <span className="text-xs text-foreground/40 line-through">R$ {product.price.toFixed(2)}</span>}
                        </div>
                        <a
                          href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20gostaria%20de%20pedir%20${encodeURIComponent(product.name)}`}
                          target="_blank" rel="noreferrer"
                          className="mt-3 flex w-full items-center justify-center gap-2 bg-accent py-2.5 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-accent/90 transition-colors"
                        >
                          <MessageCircle size={14} /> Pedir
                        </a>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
            <div className="mt-6 text-center md:hidden">
              <Link to="/produtos" className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline">Ver todos <ChevronRight size={16} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA VERMELHO ===== */}
      <section className="bg-accent py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 text-center md:px-8">
          <FadeIn>
            <div className="flex items-center justify-center gap-1 mb-5">
              {[1,2,3,4,5].map((i) => <Star key={i} size={22} className={i <= 4 ? "fill-white text-white" : "text-white/40"} />)}
            </div>
            <h2 className="font-display text-4xl font-bold leading-[1.05] text-white md:text-6xl">
              Seu próximo churrasco<br />começa aqui!
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-white/80">
              Faça seu pedido pelo WhatsApp e receba em casa. Qualidade e sabor que você merece!
            </p>
            <a
              href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
              target="_blank" rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-white text-accent px-10 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
            >
              <MessageCircle size={18} /> Pedir pelo WhatsApp
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ===== HORÁRIO ===== */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8">
          <div className="grid gap-10 md:grid-cols-2">
            <FadeIn>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">Localização</p>
              <h2 className="font-display text-4xl font-bold leading-[1.05] md:text-5xl">
                Venha nos<br /><span className="text-accent">conhecer!</span>
              </h2>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 text-accent shrink-0" />
                  <div><p className="font-semibold">{street}, {number}</p><p className="text-sm text-foreground/60">{neighborhood} — {city}, {state}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 text-accent shrink-0" />
                  <p className="font-semibold">{phone}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} className="mt-0.5 text-accent shrink-0" />
                  <div>
                    <p className="font-semibold">Horário de funcionamento</p>
                    <p className="text-sm text-foreground/60">Seg-Sáb: 08h às 20h30</p>
                    <p className="text-sm text-foreground/60">Domingo: 08h às 13h</p>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="h-full min-h-[350px] bg-surface overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3697.6!2d-54.19!3d-23.03!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDAxJzQ4LjAiUyA1NMKwMTEnMjQuMCJX!5e0!3m2!1spt-BR!2sbr!4v1"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Localização Brayan Beef"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-accent text-white">
        <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <img src="/img/logo1.png" alt="Brayan Beef" className="h-12 w-12 rounded-full object-cover mb-4" />
              <p className="text-sm text-white/70">{slogan}</p>
              <div className="mt-3 flex items-center gap-0.5">
                {[1,2,3,4,5].map((i) => <Star key={i} size={14} className={i <= 4 ? "fill-white text-white" : "text-white/40"} />)}
                <span className="ml-2 text-xs text-white/60">4.8 (63)</span>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">Contato</h4>
              <div className="space-y-2 text-sm text-white/80">
                <a href={`https://wa.me/${whatsapp}`} className="flex items-center gap-2 hover:text-white"><MessageCircle size={14} /> {phone}</a>
                <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" />{street}, {number} — {neighborhood}, {city}, {state}</p>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">Navegação</h4>
              <div className="flex flex-col gap-2 text-sm text-white/80">
                <Link to="/produtos" className="hover:text-white">Produtos</Link>
                <Link to="/sobre" className="hover:text-white">Sobre</Link>
                <Link to="/contato" className="hover:text-white">Contato</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-5 py-4 md:flex-row md:px-8">
            <div className="flex items-center gap-2">
              <img src="/img/logo1.png" alt="" className="h-6 w-6 rounded-full object-cover" />
              <span className="font-display text-xs font-bold tracking-wider">BRAYAN BEEF</span>
            </div>
            <span className="text-[10px] text-white/50">© {new Date().getFullYear()} — {street}, {number} — {city}, {state}</span>
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((i) => <Star key={i} size={10} className={i <= 4 ? "fill-white text-white" : "text-white/40"} />)}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
