import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useBusiness } from "@/hooks/useBusiness";
import { trackEvent } from "@/lib/analytics";
import { MessageCircle, Star, MapPin, Phone, Clock, ChevronRight, Check, ShieldCheck, Flame, Truck, Users } from "lucide-react";
import { Header } from "@/components/layout/Header";
import type { Product } from "@/types/product";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brayan Beef — Carnes Premium em Porto Fictício�, MS" },
      { name: "description", content: "Brayan Beef — Carnes Angus premium em Porto Fictício�, MS. Aqui fazemos do seu jeito!" },
      { property: "og:title", content: "Brayan Beef — Carnes Premium" },
      { property: "og:image", content: "https://brayanbeef.vercel.app/img/hero-brayan.jpg" },
    ],
  }),
  component: Index,
});

/* ===== UTILS ===== */
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function ScaleIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      setVal(Math.floor(Math.min((ts - start) / 1500, 1) * to));
      if ((ts - start) / 1500 < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString("pt-BR")}{suffix}</span>;
}

function Stars({ count = 5, size = 18, className = "" }: { count?: number; size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} className={i < count ? "fill-white text-white" : "text-white/30"} />
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

  useEffect(() => { if (business) trackEvent("pageview"); }, [business]);

  const featured = products.filter((p) => p.featured).slice(0, 6);

  const productImages: Record<string, string> = {
    picanha: "/img/picanha.jpg", costela: "/img/costela.jpg", ancho: "/img/ancho.png",
    fraldinha: "/img/fraldinha.jpg", frango: "/img/frango.jpg", linguica: "/img/linguica.jpg",
    "costela-suina": "/img/costela-suina.jpg", file: "/img/file.jpg", alcatra: "/img/alcatra.jpg",
    acem: "/img/acem.jpg", "coxao-duro": "/img/coxao-duro.jpg",
  };
  const getProdImg = (slug: string) => productImages[slug] || "/img/picanha.jpg";

  return (
    <main className="bg-black text-white">
      <Header variant="glass" />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen overflow-hidden bg-black">
        {/* Red blob shape */}
        <div className="absolute -right-20 -top-20 h-[80vh] w-[50vw] bg-accent rounded-full opacity-90 blur-[2px]" />
        <div className="absolute -right-10 top-10 h-[70vh] w-[40vw] bg-accent rounded-full" />

        {/* Hero image */}
        <div className="absolute inset-0">
          <img src="/img/hero-brayan.jpg" alt="Churrasco Brayan Beef"
            className="h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-screen items-end px-5 pb-16 pt-40 md:px-8 md:pb-24">
          <div className="mx-auto max-w-[1400px] w-full">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Stars count={5} size={24} className="mb-4" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }}
              className="font-display text-[18vw] leading-[0.8] font-black md:text-[10vw]">
              BRAYAN<br />BEEF
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-4 max-w-md text-lg text-white/70">{slogan}</motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
                target="_blank" rel="noreferrer" className="btn-primary">
                <MessageCircle size={20} /> Faça seu pedido
              </a>
              <a href="#produtos" className="btn-outline">
                Ver cardápio <ChevronRight size={18} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== POR QUE ESCOLHER ===== */}
      <section className="relative py-20 md:py-32 bg-black overflow-hidden">
        <div className="absolute left-0 top-1/2 h-[300px] w-[300px] -translate-y-1/2 bg-accent/10 rounded-full blur-[100px]" />
        <div className="mx-auto max-w-[1400px] px-5 md:px-8 relative z-10">
          <FadeIn>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-accent" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Por que escolher</span>
            </div>
            <h2 className="font-display text-4xl font-black leading-[1.05] md:text-6xl">
              A qualidade que você<br /><span className="text-accent">merece!</span>
            </h2>
          </FadeIn>
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-5">
            {[
              { icon: ShieldCheck, text: "Carnes selecionadas" },
              { icon: Users, text: "Atendimento personalizado" },
              { icon: Flame, text: "Espetinhos prontos" },
              { icon: Truck, text: "Produtos frescos diariamente" },
              { icon: Check, text: "Qualidade garantida" },
            ].map((item, i) => (
              <FadeIn key={item.text} delay={i * 0.08}>
                <div className="card-product flex flex-col items-center gap-3 p-4 md:p-6 text-center">
                  <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-accent/20">
                    <item.icon size={22} className="text-accent md:hidden" />
                    <item.icon size={28} className="text-accent hidden md:block" />
                  </div>
                  <p className="text-xs md:text-sm font-bold leading-tight">{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CORTES — FOTOS GRANDES ===== */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Red curve top */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-accent" style={{ borderRadius: "0 0 50% 50% / 0 0 100% 100%" }} />
        <div className="mx-auto max-w-[1400px] px-5 pt-12 md:px-8">
          <FadeIn>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-white/30" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">Nossos cortes</span>
            </div>
            <h2 className="font-display text-4xl font-black leading-[1.05] md:text-6xl">Seleção premium</h2>
          </FadeIn>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {[
              { name: "Picanha", img: "/img/picanha.jpg", tag: "Angus" },
              { name: "Contrafilé", img: "/img/costela.jpg", tag: "Reserva" },
              { name: "Ancho", img: "/img/ancho.png", tag: "Signature" },
              { name: "Fraldinha", img: "/img/fraldinha.jpg", tag: "Clássica" },
            ].map((cut, i) => (
              <ScaleIn key={cut.name} delay={i * 0.1}>
                <div className="card-product group">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={cut.img} alt={cut.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-black">{cut.name}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-accent">{cut.tag}</span>
                  </div>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRODUTOS ===== */}
      {featured.length > 0 && (
        <section id="produtos" className="relative py-20 md:py-32 bg-black overflow-hidden">
          <div className="absolute right-0 top-0 h-[400px] w-[400px] bg-accent/10 rounded-full blur-[120px]" />
          <div className="mx-auto max-w-[1400px] px-5 md:px-8 relative z-10">
            <FadeIn>
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px w-12 bg-accent" />
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Destaques</span>
                  </div>
                  <h2 className="font-display text-4xl font-black leading-[1.05] md:text-6xl">Mais pedidos</h2>
                </div>
                <Link to="/produtos" className="hidden items-center gap-1 text-sm font-bold text-accent hover:underline md:flex">
                  Ver todos <ChevronRight size={16} />
                </Link>
              </div>
            </FadeIn>
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {featured.map((product, i) => {
                const img = getProdImg(product.slug);
                const hasDiscount = product.promotion && typeof product.promotion === "object" && "discount" in product.promotion;
                const discount = hasDiscount ? (product.promotion as { discount: number }).discount : 0;
                const price = hasDiscount ? product.price * (1 - discount / 100) : product.price;
                return (
                  <FadeIn key={product.id} delay={i * 0.1}>
                    <div className="card-product group">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={img} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                        {hasDiscount && (
                          <span className="absolute left-3 top-3 bg-accent px-3 py-1 text-[10px] font-black text-white rounded-full">-{discount}%</span>
                        )}
                      </div>
                      <div className="p-3 md:p-5">
                        <h3 className="font-display text-base md:text-xl font-black">{product.name}</h3>
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <span className="font-display text-lg md:text-2xl font-black text-accent">R$ {price.toFixed(2)}</span>
                            {hasDiscount && <span className="ml-1 text-xs text-white/40 line-through">R$ {product.price.toFixed(2)}</span>}
                          </div>
                          <a href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20gostaria%20de%20pedir%20${encodeURIComponent(product.name)}`}
                            target="_blank" rel="noreferrer" className="btn-primary !h-10 !px-4 !text-[11px] w-full sm:w-auto">
                            <MessageCircle size={14} /> Pedir
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

      {/* ===== GALERIA ===== */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-accent" style={{ borderRadius: "0 0 50% 50% / 0 0 100% 100%" }} />
        <div className="mx-auto max-w-[1400px] px-5 pt-10 md:px-8">
          <FadeIn>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-white/30" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">Galeria</span>
            </div>
            <h2 className="font-display text-4xl font-black leading-[1.05] md:text-6xl">
              A cultura do <span className="text-accent">churrasco</span>
            </h2>
          </FadeIn>
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {["/img/costela.jpg", "/img/Espetoreal.jpg", "/img/Cortes separados.jpg", "/img/sobre.jpg", "/img/Cortes2.jpg", "/img/hero-brayan.jpg"].map((img, i) => (
              <ScaleIn key={i} delay={i * 0.08}>
                <div className="group overflow-hidden rounded-2xl">
                  <img src={img} alt={`Brayan Beef ${i + 1}`} className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA — BATEU A FOME? ===== */}
      <section className="relative py-24 md:py-40 overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img src="/img/Espetinho e Churrasqueira.png" alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
        </div>
        {/* Red blob */}
        <div className="absolute -left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 bg-accent rounded-full opacity-20 blur-[80px]" />

        <div className="relative z-10 mx-auto max-w-[1400px] px-5 text-center md:px-8">
          <FadeIn>
            <Stars count={5} size={32} className="justify-center mb-6" />
            <h2 className="font-display text-6xl font-black leading-[0.95] md:text-[8vw]">
              BATEU A<br />FOME?
            </h2>
            <p className="mt-6 text-xl text-white/70">Cortes selecionados do jeito que você gosta, vem pra cá!</p>
            <p className="mt-2 text-sm text-white/40 uppercase tracking-widest">Estamos te esperando!</p>
            <a href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
              target="_blank" rel="noreferrer" className="mt-10 btn-primary !h-16 !px-12 !text-base">
              <MessageCircle size={24} /> Faça seu pedido agora
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ===== SOBRE ===== */}
      <section className="relative py-20 md:py-32 bg-black overflow-hidden">
        <div className="absolute right-0 top-1/4 h-[300px] w-[300px] bg-accent/10 rounded-full blur-[100px]" />
        <div className="mx-auto max-w-[1400px] px-5 md:px-8 relative z-10">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-12 bg-accent" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Quem somos</span>
              </div>
              <h2 className="font-display text-4xl font-black leading-[1.05] md:text-5xl">
                O segredo do sabor<br /><span className="text-accent">é o preparo simples!</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60">
                Selecionamos cada corte com rigor e procedência. Do frigorífico à sua mesa, entregamos qualidade que conquista.
              </p>
              <div className="mt-8 flex items-center gap-8">
                <div className="text-center">
                  <p className="font-display text-3xl font-black text-accent">4.8</p>
                  <Stars count={4} size={12} className="mt-1 justify-center" />
                  <p className="mt-1 text-[10px] text-white/40">63 avaliações</p>
                </div>
                <div className="h-12 w-px bg-white/20" />
                <div>
                  <p className="font-display text-3xl font-black text-accent"><Counter to={5000} suffix="+" /></p>
                  <p className="mt-1 text-[10px] text-white/40">Clientes satisfeitos</p>
                </div>
              </div>
            </FadeIn>
            <ScaleIn delay={0.15}>
              <div className="relative">
                <img src="/img/sobre.jpg" alt="Brayan Beef" className="w-full rounded-2xl shadow-card" />
                <div className="absolute -bottom-4 -right-4 bg-accent px-6 py-3 rounded-2xl text-sm font-black text-white shadow-card">
                  ★★★★★ Desde 2023
                </div>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* ===== HORÁRIO + MAPA ===== */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-accent" style={{ borderRadius: "0 0 50% 50% / 0 0 100% 100%" }} />
        <div className="mx-auto max-w-[1400px] px-5 pt-10 md:px-8">
          <div className="grid gap-10 md:grid-cols-2">
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-12 bg-white/30" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">Horário & Localização</span>
              </div>
              <h2 className="font-display text-4xl font-black leading-[1.05] md:text-5xl">
                Venha nos <span className="text-accent">conhecer!</span>
              </h2>
              <div className="mt-8 bg-[#111] p-6 rounded-2xl shadow-card">
                <h3 className="font-display text-lg font-black mb-4">Horário de funcionamento</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Seg a Sáb</span>
                    <span className="bg-accent text-white px-4 py-1.5 text-xs font-black rounded-full">7H ÀS 20H</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Domingo</span>
                    <span className="bg-accent text-white px-4 py-1.5 text-xs font-black rounded-full">8H ÀS 13H</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 text-accent shrink-0" /><div><p className="font-bold">{street}, {number}</p><p className="text-sm text-white/50">{neighborhood} — {city}, {state}</p></div></div>
                <div className="flex items-start gap-3"><Phone size={18} className="mt-0.5 text-accent shrink-0" /><p className="font-bold">{phone}</p></div>
              </div>
            </FadeIn>
            <ScaleIn delay={0.15}>
              <div className="h-full min-h-[400px] rounded-2xl overflow-hidden shadow-card bg-[#1a1a1a] flex items-center justify-center">
                <a
                  href="https://www.google.com/maps/search/Brayan+Beef+Porto Fictício�"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-4 text-center p-8 hover:text-accent transition-colors"
                >
                  <MapPin size={48} className="text-accent" />
                  <p className="font-display text-xl font-black">{street}, {number}</p>
                  <p className="text-sm text-white/50">{neighborhood} — {city}, {state}</p>
                  <span className="btn-primary !h-12 !text-xs mt-2">
                    <MapPin size={16} /> Abrir no Google Maps
                  </span>
                </a>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#111] text-white">
        <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <img src="/img/logo1.png" alt="Brayan Beef" className="h-14 w-14 rounded-full object-cover mb-4" />
              <p className="text-sm text-white/60">{slogan}</p>
              <Stars count={5} size={14} className="mt-3" />
            </div>
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">Contato</h4>
              <div className="space-y-2 text-sm text-white/70">
                <a href={`https://wa.me/${whatsapp}`} className="flex items-center gap-2 hover:text-white"><MessageCircle size={14} /> {phone}</a>
                <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" />{street}, {number} — {neighborhood}, {city}, {state}</p>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">Navegação</h4>
              <div className="flex flex-col gap-2 text-sm text-white/70">
                <Link to="/produtos" className="hover:text-white">Produtos</Link>
                <Link to="/sobre" className="hover:text-white">Sobre</Link>
                <Link to="/contato" className="hover:text-white">Contato</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-5 py-4 md:flex-row md:px-8">
            <div className="flex items-center gap-2"><img src="/img/logo1.png" alt="" className="h-6 w-6 rounded-full object-cover" /><span className="font-display text-xs font-black tracking-wider">BRAYAN BEEF</span></div>
            <span className="text-[10px] text-white/40">© {new Date().getFullYear()} — {street}, {number} — {city}, {state}</span>
            <Stars count={5} size={10} />
          </div>
        </div>
      </footer>
    </main>
  );
}
