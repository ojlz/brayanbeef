import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useBusiness } from "@/hooks/useBusiness";
import { trackEvent } from "@/lib/analytics";
import { MessageCircle, Star, MapPin, Phone, Clock, ChevronRight, Check, Truck, ShieldCheck, Flame, Users } from "lucide-react";
import type { Product } from "@/types/product";

import heroImg from "/img/hero-brayan.jpg";
import sobreImg from "/img/sobre.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brayan Beef — Carnes Premium em Porto Fictício�, MS" },
      { name: "description", content: "Brayan Beef — Carnes Angus premium em Porto Fictício�, MS. Picanha, costela, ancho e fraldinha de alta qualidade. Aqui fazemos do seu jeito!" },
      { property: "og:title", content: "Brayan Beef — Carnes Premium em Porto Fictício�, MS" },
      { property: "og:image", content: "https://brayanbeef.vercel.app/img/picanha.jpg" },
    ],
  }),
  component: Index,
});

/* ===== UTILITIES ===== */
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >{children}</motion.div>
  );
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1500, 1);
      setVal(Math.floor(p * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString("pt-BR")}{suffix}</span>;
}

function Stars({ count = 5, size = 16, className = "" }: { count?: number; size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} className={i < count ? "fill-accent text-accent" : "text-foreground/20"} />
      ))}
    </div>
  );
}

/* ===== PAGE ===== */
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

  const featured = products.filter((p) => p.featured).slice(0, 6);

  // Product images map
  const productImages: Record<string, string> = {
    picanha: "/img/picanha.jpg",
    costela: "/img/costela.jpg",
    ancho: "/img/ancho.jpg",
    fraldinha: "/img/fraldinha.jpg",
    frango: "/img/frango.jpg",
    linguica: "/img/linguica.jpg",
    "costela-suina": "/img/costela-suina.jpg",
    file: "/img/file.jpg",
    alcatra: "/img/alcatra.jpg",
    acem: "/img/acem.jpg",
    "coxao-duro": "/img/coxao-duro.jpg",
  };

  const getProdImg = (slug: string) => productImages[slug] || "/img/placeholder.jpg";

  return (
    <main className="bg-white text-foreground">

      {/* ===== HERO — 70% imagem ===== */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Churrasco premium" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 w-full px-5 pb-16 pt-40 md:px-8 md:pb-24">
          <div className="mx-auto max-w-[1400px]">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Stars count={5} size={24} className="mb-4" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
              className="font-display text-[18vw] leading-[0.8] text-white font-bold md:text-[10vw]">
              BRAYAN<br />BEEF
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-4 text-xl text-white/80 max-w-md">
              {slogan}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
                target="_blank" rel="noreferrer"
                className="btn-expand flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 text-sm font-bold uppercase tracking-wider shadow-depth-lg">
                <MessageCircle size={18} /> Faça seu pedido
              </a>
              <a href="#produtos" className="btn-expand flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 text-sm font-bold uppercase tracking-wider hover:border-white">
                Ver cardápio <ChevronRight size={18} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== POR QUE ESCOLHER ===== */}
      <section className="py-16 md:py-24 texture-bg">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8">
          <FadeIn>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">Por que escolher</p>
            <h2 className="font-display text-4xl font-bold leading-[1.05] md:text-5xl">A qualidade que você <span className="text-accent">merece!</span></h2>
          </FadeIn>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5">
            {[
              { icon: ShieldCheck, text: "Carnes selecionadas" },
              { icon: Users, text: "Atendimento personalizado" },
              { icon: Flame, text: "Espetinhos prontos" },
              { icon: Truck, text: "Produtos frescos diariamente" },
              { icon: Check, text: "Qualidade garantida" },
            ].map((item, i) => (
              <FadeIn key={item.text} delay={i * 0.08}>
                <div className="card-lift flex flex-col items-center gap-3 bg-white p-6 text-center shadow-depth">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                    <item.icon size={24} className="text-accent" />
                  </div>
                  <p className="text-sm font-bold leading-tight">{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CORTES — FOTOS ENORMES ===== */}
      <section className="bg-accent texture-dark py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8">
          <FadeIn>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-white/50">Nossos cortes</p>
            <h2 className="font-display text-4xl font-bold leading-[1.05] text-white md:text-5xl">Seleção premium</h2>
          </FadeIn>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {[
              { name: "Picanha", img: "/img/picanha.jpg", tag: "Angus" },
              { name: "Contrafilé", img: "/img/costela.jpg", tag: "Reserva" },
              { name: "Ancho", img: "/img/ancho.jpg", tag: "Signature" },
              { name: "Fraldinha", img: "/img/fraldinha.jpg", tag: "Clássica" },
            ].map((cut, i) => (
              <FadeIn key={cut.name} delay={i * 0.1}>
                <div className="group card-lift overflow-hidden bg-white shadow-depth-lg">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={cut.img} alt={cut.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-bold">{cut.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-accent font-bold">{cut.tag}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRODUTOS — FOTOS GRANDES ===== */}
      {featured.length > 0 && (
        <section id="produtos" className="py-16 md:py-24 texture-bg">
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
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {featured.map((product, i) => {
                const img = getProdImg(product.slug);
                const hasDiscount = product.promotion && typeof product.promotion === "object" && "discount" in product.promotion;
                const discount = hasDiscount ? (product.promotion as { discount: number }).discount : 0;
                const price = hasDiscount ? product.price * (1 - discount / 100) : product.price;
                return (
                  <FadeIn key={product.id} delay={i * 0.1}>
                    <div className="group card-lift bg-white overflow-hidden shadow-depth-lg">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={img} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                        {hasDiscount && (
                          <span className="absolute left-4 top-4 bg-accent px-4 py-2 text-xs font-bold text-white shadow-lg animate-glow">-{discount}%</span>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-display text-xl font-bold">{product.name}</h3>
                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <span className="font-display text-2xl font-bold text-accent">R$ {price.toFixed(2)}</span>
                            {hasDiscount && <span className="ml-2 text-sm text-foreground/40 line-through">R$ {product.price.toFixed(2)}</span>}
                          </div>
                          <a href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20gostaria%20de%20pedir%20${encodeURIComponent(product.name)}`}
                            target="_blank" rel="noreferrer"
                            className="btn-expand flex items-center gap-2 bg-accent px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
                            <MessageCircle size={16} /> Pedir
                          </a>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== SOBRE — IMAGEM GRANDE ===== */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <FadeIn>
              <div className="relative">
                <img src={sobreImg} alt="Brayan Beef" className="w-full object-cover shadow-depth-lg" />
                <div className="absolute -bottom-4 -right-4 bg-accent px-6 py-3 text-sm font-bold text-white shadow-depth-lg">
                  ★★★★★ Desde 2023
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">Quem somos</p>
              <h2 className="font-display text-4xl font-bold leading-[1.05] md:text-5xl">
                O segredo do sabor<br /><span className="text-accent">é o preparo simples!</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-foreground/60">
                Selecionamos cada corte com rigor e procedência. Do frigorífico à sua mesa, entregamos qualidade que conquista. Aqui fazemos do seu jeito!
              </p>
              <div className="mt-8 flex items-center gap-8">
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-accent">4.8</p>
                  <Stars count={4} size={12} className="mt-1 justify-center" />
                  <p className="mt-1 text-[10px] text-foreground/40">63 avaliações</p>
                </div>
                <div className="h-12 w-px bg-line" />
                <div>
                  <p className="font-display text-3xl font-bold text-accent"><Counter to={5000} suffix="+" /></p>
                  <p className="mt-1 text-[10px] text-foreground/40">Clientes satisfeitos</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== EQUIPE ===== */}
      <section className="py-16 md:py-24 bg-surface texture-bg">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8">
          <FadeIn>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">Nossa equipe</p>
            <h2 className="font-display text-4xl font-bold leading-[1.05] md:text-5xl">Quem cuida do <span className="text-accent">seu pedido!</span></h2>
            <p className="mt-4 max-w-lg text-base text-foreground/60">Negócios locais vendem confiança antes de vender produto.</p>
          </FadeIn>
          <div className="mt-10 grid grid-cols-3 gap-3 md:gap-4">
            {[gallery1, gallery2, gallery3].map((img, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="group overflow-hidden shadow-depth-lg">
                  <img src={img} alt={`Brayan Beef equipe ${i + 1}`} className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA — BATEU A FOME? ===== */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-accent texture-dark" />
        <div className="absolute inset-0 opacity-20">
          <img src="/img/costela.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative z-10 mx-auto max-w-[1400px] px-5 text-center md:px-8">
          <FadeIn>
            <Stars count={5} size={28} className="justify-center mb-6" />
            <h2 className="font-display text-6xl font-bold leading-[1] text-white md:text-8xl">
              Bateu a<br />fome?
            </h2>
            <p className="mt-6 text-xl text-white/80">Espetinhos do jeito que você gosta, vem pra cá!</p>
            <p className="mt-2 text-sm text-white/50 uppercase tracking-wider">Estamos te esperando!</p>
            <a href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
              target="_blank" rel="noreferrer"
              className="mt-10 btn-expand inline-flex items-center gap-3 bg-white text-accent px-12 py-5 text-base font-bold uppercase tracking-wider shadow-depth-lg">
              <MessageCircle size={22} /> Faça seu pedido agora
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ===== HORÁRIO + LOCALIZAÇÃO ===== */}
      <section className="py-16 md:py-24 texture-bg">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8">
          <div className="grid gap-10 md:grid-cols-2">
            <FadeIn>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">Horário & Localização</p>
              <h2 className="font-display text-4xl font-bold leading-[1.05] md:text-5xl">Venha nos <span className="text-accent">conhecer!</span></h2>
              <div className="mt-8 bg-white p-6 shadow-depth-lg">
                <h3 className="font-display text-lg font-bold mb-4">Horário de funcionamento</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Seg a Sáb</span>
                    <span className="bg-accent text-white px-4 py-1.5 text-xs font-bold">7H ÀS 20H</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Domingo</span>
                    <span className="bg-accent text-white px-4 py-1.5 text-xs font-bold">8H ÀS 13H</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 text-accent shrink-0" /><div><p className="font-semibold">{street}, {number}</p><p className="text-sm text-foreground/60">{neighborhood} — {city}, {state}</p></div></div>
                <div className="flex items-start gap-3"><Phone size={18} className="mt-0.5 text-accent shrink-0" /><p className="font-semibold">{phone}</p></div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="h-full min-h-[400px] bg-surface shadow-depth-lg overflow-hidden">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3697.6!2d-54.19!3d-23.03!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDAxJzQ4LjAiUyA1NMKwMTEnMjQuMCJX!5e0!3m2!1spt-BR!2sbr!4v1"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Localização Brayan Beef" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-accent texture-dark text-white">
        <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <img src="/img/logo1.png" alt="Brayan Beef" className="h-12 w-12 rounded-full object-cover mb-4" />
              <p className="text-sm text-white/70">{slogan}</p>
              <Stars count={5} size={14} className="mt-3" />
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
            <div className="flex items-center gap-2"><img src="/img/logo1.png" alt="" className="h-6 w-6 rounded-full object-cover" /><span className="font-display text-xs font-bold tracking-wider">BRAYAN BEEF</span></div>
            <span className="text-[10px] text-white/50">© {new Date().getFullYear()} — {street}, {number} — {city}, {state}</span>
            <Stars count={5} size={10} />
          </div>
        </div>
      </footer>
    </main>
  );
}
