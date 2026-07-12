import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useBusiness } from "@/hooks/useBusiness";
import { trackEvent } from "@/lib/analytics";

import heroPicanha from "@/assets/hero-picanha.jpg";
import selection from "@/assets/selection.jpg";
import cutPicanha from "@/assets/cut-picanha.jpg";
import cutCostela from "@/assets/cut-costela.jpg";
import cutAncho from "@/assets/cut-ancho.jpg";
import cutFraldinha from "@/assets/cut-fraldinha.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import finalHero from "@/assets/final-hero.jpg";

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

/* --- Smooth scroll (Lenis-style) via native + rAF --- */
function useLenisScroll() {
  useEffect(() => {
    // Skip smooth scroll on touch devices — native inertial scroll is faster
    // and the immersive sections are already shortened for mobile.
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (isTouch) return;

    let raf = 0;
    let cancelled = false;
    (async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;
      const lenis = new Lenis({
        duration: 0.9,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        lenis.destroy();
      };
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);
}

/* --- Reusable reveal --- */
function Reveal({
  children,
  delay = 0,
  y = 40,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* --- Line mask reveal (curtain sliding up) --- */
function MaskReveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: "105%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* --- Split words for hero title --- */
function SplitWords({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 1.2,
              delay: 0.4 + i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* --- Counter that increments on scroll --- */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const start = performance.now();
            const dur = 1800;
            const step = (t: number) => {
              const p = Math.min(1, (t - start) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(Math.round(to * eased));
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {val.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

function Index() {
  useLenisScroll();
  const { data: business } = useBusiness();
  const slogan = business?.slogan || "Aqui fazemos do seu jeito!";
  const street = business?.address?.street || "Av. Fictícia";
  const number = business?.address?.number || "333";
  const city = business?.address?.city || "Porto Fictício�";
  const state = business?.address?.state || "MS";
  const whatsapp = business?.whatsapp || "5500090000009";

  useEffect(() => {
    if (business) trackEvent("page_view");
  }, [business]);

  /* HERO scroll effects */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroP } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Disable framer-motion's accelerated (scroll-timeline) WAAPI path.
  // It throws "Offsets must be null or in the range [0,1]" on some Chromium
  // versions when combined with chained useTransform ranges. Falling back
  // to the JS scroll listener keeps everything working.
  delete (heroP as unknown as { accelerate?: unknown }).accelerate;
  const heroScale = useTransform(heroP, [0, 1], [1, 1.15]);
  const heroDim = useTransform(heroP, [0, 1], [0.35, 0.92]);
  const heroLogoScale = useTransform(heroP, [0, 1], [1, 0.7]);
  const heroLogoY = useTransform(heroP, [0, 1], [0, -80]);
  const heroLogoOpacity = useTransform(heroP, [0, 0.6], [1, 0]);

  /* Section 2 — image grows, text pins */
  const s2Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: s2P } = useScroll({
    target: s2Ref,
    offset: ["start end", "end start"],
  });
  delete (s2P as unknown as { accelerate?: unknown }).accelerate;
  const s2Scale = useTransform(s2P, [0, 1], [1.05, 1.35]);

  /* Section 4 — immersive dissolve */
  const s4Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: s4P } = useScroll({
    target: s4Ref,
    offset: ["start start", "end end"],
  });
  delete (s4P as unknown as { accelerate?: unknown }).accelerate;

  return (
    <main className="relative bg-white text-foreground">
      {/* NAV */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5 bg-white/95 backdrop-blur-md border-b border-line md:px-10 md:py-6">
        <div className="font-display text-sm tracking-widest text-foreground">
          BRAYAN <span className="text-accent">BEEF</span>
        </div>
        <div className="hidden gap-8 text-xs uppercase tracking-[0.2em] text-foreground/60 md:flex">
          <a href="#selecao" className="hover:text-accent transition-colors">
            Seleção
          </a>
          <a href="#cortes" className="hover:text-accent transition-colors">
            Cortes
          </a>
          <a href="#galeria" className="hover:text-accent transition-colors">
            Galeria
          </a>
          <Link to="/produtos" className="hover:text-accent transition-colors">
            Produtos
          </Link>
          <Link to="/sobre" className="hover:text-accent transition-colors">
            Sobre
          </Link>
          <Link to="/contato" className="hover:text-accent transition-colors">
            Contato
          </Link>
        </div>
        <a
          href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
          target="_blank"
          rel="noreferrer"
          className="bg-accent text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-accent/90 transition-colors"
        >
          Pedir Agora
        </a>
      </nav>

      {/* ============ HERO ============ */}
      <section ref={heroRef} className="relative h-[100vh] md:h-[110vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div
            style={{ scale: heroScale }}
            className="absolute inset-0"
          >
            <img
              src={heroPicanha}
              alt="Corte de picanha em close cinematográfico"
              className="h-full w-full object-cover"
              width={1920}
              height={1200}
            />
          </motion.div>

          {/* red overlay driven by scroll */}
          <motion.div
            style={{ opacity: heroDim }}
            className="absolute inset-0 bg-accent/80"
          />

          {/* Content */}
          <motion.div
            style={{ scale: heroLogoScale, y: heroLogoY, opacity: heroLogoOpacity }}
            className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
          >
            <div className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-white/70">
              <span className="h-px w-8 bg-white/40" />
              Porto Fictício� — MS
              <span className="h-px w-8 bg-white/40" />
            </div>
            <h1 className="font-display text-[18vw] leading-[0.85] text-white md:text-[10vw]">
              <SplitWords text="BRAYAN BEEF" />
            </h1>
            {/* 5 stars signature */}
            <div className="mt-6 flex items-center gap-2 text-white">
              <span className="text-2xl">★</span>
              <span className="text-2xl">★</span>
              <span className="text-3xl text-white/40">★</span>
              <span className="text-2xl">★</span>
              <span className="text-2xl">★</span>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 max-w-md text-balance text-sm leading-relaxed text-white/80 md:text-base"
            >
              Aqui fazemos
              <br />
              do seu jeito!
            </motion.p>
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
              target="_blank"
              rel="noreferrer"
              className="mt-8 bg-white text-accent px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-white/90 transition-colors"
            >
              Faça seu pedido
            </motion.a>
          </motion.div>

          {/* scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
            className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-white/60"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-lg"
            >
              ↓
            </motion.div>
            Role para descobrir
          </motion.div>
        </div>
      </section>

      {/* ============ SECTION 2 — Selecionamos ============ */}
      <section
        id="selecao"
        ref={s2Ref}
        className="relative h-[130vh] md:h-[200vh] bg-background"
      >
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          <motion.div
            style={{ scale: s2Scale }}
            className="absolute inset-0 will-change-transform"
          >
            <img
              src={selection}
              alt="Seleção artesanal de cortes"
              className="h-full w-full object-cover"
              loading="lazy"
              width={1920}
              height={1200}
            />
            <div className="absolute inset-0 bg-background/50" />
          </motion.div>

          <div className="relative z-10 max-w-4xl px-6 text-center">
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              whileInView={{ opacity: 1, letterSpacing: "0.4em" }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 text-[10px] uppercase text-foreground/50"
            >
              — 01 / Filosofia
            </motion.p>
            <h2 className="font-display text-[7vw] leading-[0.95] md:text-[5vw]">
              <MaskReveal>Não vendemos</MaskReveal>
              <MaskReveal delay={0.15}>
                <span className="text-foreground/40">apenas</span> carne.
              </MaskReveal>
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-10 max-w-lg text-balance text-base leading-relaxed text-foreground/70"
            >
              Selecionamos cada corte como se fosse para o nosso próprio
              churrasco. Rigor, procedência e maturação — do frigorífico à sua
              mesa.
            </motion.p>
          </div>

        </div>
      </section>

      {/* ============ SECTION — Immersive dissolve (Cortes) ============ */}
      <section
        id="cortes"
        ref={s4Ref}
        className="relative h-[260vh] md:h-[500vh] border-t border-line bg-background"
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          {[
            { name: "Picanha", img: cutPicanha, meta: ["Angus", "Maturada", "Premium"], effect: "scale" as const },
            { name: "Costela", img: cutCostela, meta: ["Bovina", "12h de fogo", "Reserva"], effect: "blur" as const },
            { name: "Ancho", img: cutAncho, meta: ["Marmoreio alto", "Argentino", "Signature"], effect: "clip" as const },
            { name: "Fraldinha", img: cutFraldinha, meta: ["Suculenta", "Rápida", "Clássica"], effect: "rotate" as const },
          ].map((cut, i, arr) => {
            const start = i / arr.length;
            const end = (i + 1) / arr.length;
            return (
              <ImmersiveSlide
                key={cut.name}
                progress={s4P}
                start={start}
                end={end}
                image={cut.img}
                name={cut.name}
                meta={cut.meta}
                effect={cut.effect}
                index={i}
                total={arr.length}
              />
            );
          })}

          {/* progress ticks */}
          <div className="pointer-events-none absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 md:flex">
            {[0, 1, 2, 3].map((i) => (
              <SlideTick key={i} progress={s4P} index={i} total={4} />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-10 z-20 flex justify-center">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-foreground/60">
              <span className="h-px w-6 bg-foreground/40" />
              Continue rolando
              <span className="h-px w-6 bg-foreground/40" />
            </div>
          </div>
        </div>
      </section>


      {/* ============ SECTION 5 — Stats ============ */}
      <section className="relative border-t border-line bg-background py-32 md:py-40">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <Reveal>
            <p className="mb-16 text-[10px] uppercase tracking-[0.4em] text-foreground/50 md:mb-24">
              — 03 / Em números
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
            {[
              { label: "Desde", value: 2023, suffix: "" },
              { label: "Clientes satisfeitos", value: 5000, suffix: "+" },
              { label: "Carnes frescas", value: 100, suffix: "%" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="relative pt-8"
              >
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{ duration: 1.4, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-0 block h-px w-full origin-left bg-line"
                />
                <p className="mb-6 text-[10px] uppercase tracking-[0.3em] text-foreground/50">
                  / 0{i + 1}
                </p>
                <div className="flex items-baseline gap-1">
                  <div className="w-full overflow-hidden font-display text-[18vw] leading-none tracking-tighter md:text-[7vw]">
                    <Counter to={stat.value} />
                  </div>
                  {stat.suffix && (
                    <span className="font-display text-[10vw] leading-none tracking-tighter text-accent md:text-[4vw]">{stat.suffix}</span>
                  )}
                </div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{ duration: 1, delay: 0.6 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6 text-sm uppercase tracking-[0.2em] text-foreground/70"
                >
                  {stat.label}
                </motion.p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-24 max-w-xl text-balance text-sm leading-relaxed text-foreground/50"
          >
            Reconhecidos publicamente pelo crescimento do negócio e pela
            qualidade do atendimento pela Câmara Municipal de Porto Fictício�. Uma
            marca construída em confiança e sabor.
          </motion.p>

        </div>
      </section>

      {/* ============ SECTION 6 — Gallery ============ */}
      <section id="galeria" className="relative border-t border-line bg-background py-24 md:py-32">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <div className="mb-16 flex items-end justify-between">
            <div>
              <motion.p
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: "auto", opacity: 1 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="mb-4 overflow-hidden whitespace-nowrap text-[10px] uppercase tracking-[0.4em] text-foreground/50"
              >
                — 04 / Fragmentos
              </motion.p>
              <h3 className="font-display text-5xl leading-[0.95] md:text-7xl">
                <MaskReveal>A cultura</MaskReveal>
                <MaskReveal delay={0.15}>
                  do <span className="text-accent">churrasco</span>.
                </MaskReveal>
              </h3>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-2 px-2 md:grid-cols-4 md:gap-3 md:px-3">
            {[gallery1, gallery2, gallery3, gallery4, gallery5, gallery2, gallery1, gallery4].map(
              (img, i) => {
                const altTexts = [
                  "Galeria Brayan Beef - churrasco artesanal",
                  "Galeria Brayan Beef - corte de carne premium",
                  "Galeria Brayan Beef - preparo artesanal",
                  "Galeria Brayan Beef - carne grelhada",
                  "Galeria Brayan Beef - presentação premium",
                  "Galeria Brayan Beef - corte de carne premium",
                  "Galeria Brayan Beef - churrasco artesanal",
                  "Galeria Brayan Beef - carne grelhada",
                ];
                // vary entrance per index
                const variants = [
                  { initial: { opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }, whileInView: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" } },
                  { initial: { opacity: 0, x: -40 }, whileInView: { opacity: 1, x: 0 } },
                  { initial: { opacity: 0, scale: 1.15 }, whileInView: { opacity: 1, scale: 1 } },
                  { initial: { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" }, whileInView: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" } },
                ];
                const v = variants[i % variants.length];
                return (
                  <motion.div
                    key={i}
                    initial={v.initial}
                    whileInView={v.whileInView}
                    viewport={{ once: true, margin: "-5% 0px" }}
                    transition={{
                      duration: 1.3,
                      delay: (i % 4) * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`group relative overflow-hidden ${
                      i === 1 || i === 6 ? "row-span-2 aspect-[3/5]" : "aspect-[4/5]"
                    }`}
                  >
                    <img
                      src={img}
                      alt={altTexts[i] || "Galeria Brayan Beef"}
                      loading="lazy"
                      className="h-full w-full object-cover transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-background/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  </motion.div>
                );
              }
            )}
          </div>
        </div>


        {/* marquee */}
        <div className="mt-24 overflow-hidden border-y border-line py-6">
          <div className="flex animate-marquee whitespace-nowrap font-display text-4xl uppercase text-foreground/40 md:text-6xl">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex shrink-0 items-center gap-16 pr-16">
                <span>{street}, {number}</span>
                <span className="text-foreground/20">·</span>
                <span>{slogan}</span>
                <span className="text-foreground/20">·</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <motion.img
            src={finalHero}
            alt="Picanha grelhada e fatiada"
            initial={{ scale: 1.15 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full object-cover"
            width={1920}
            height={1200}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.4em" }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 text-[10px] uppercase text-foreground/60"
          >
            — Sua próxima experiência
          </motion.p>
          <h2 className="font-display text-[10vw] leading-[0.9] md:text-[7vw]">
            <MaskReveal>Seu próximo churrasco</MaskReveal>
            <MaskReveal delay={0.2}>
              <span className="italic text-foreground/60">começa aqui.</span>
            </MaskReveal>
          </h2>
          <motion.a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("whatsapp")}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.2, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02 }}
            className="group mt-16 inline-flex items-center gap-6 border border-foreground/30 bg-background/40 px-10 py-6 text-sm uppercase tracking-[0.3em] backdrop-blur-sm transition-colors duration-500 hover:border-accent hover:bg-accent/10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            Comprar pelo WhatsApp
            <span className="transition-transform duration-500 group-hover:translate-x-2">
              →
            </span>
          </motion.a>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-line bg-background px-6 py-16 md:px-10">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-display text-2xl">
              BRAYAN <span className="text-accent">BEEF</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-foreground/50">
              {slogan} — {street}, {number} — {city}, {state}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-4 text-xs uppercase tracking-[0.2em] text-foreground/50">
            <a href={`https://wa.me/${whatsapp}`} className="hover:text-foreground">
              WhatsApp
            </a>
            <a href="#" className="hover:text-foreground">
              Instagram
            </a>
            <Link to="/produtos" className="hover:text-foreground">
              Produtos
            </Link>
            <Link to="/sobre" className="hover:text-foreground">
              Sobre
            </Link>
            <Link to="/contato" className="hover:text-foreground">
              Contato
            </Link>
            <span>{city} — {state}</span>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-[1600px] items-center justify-between text-[10px] uppercase tracking-[0.3em] text-foreground/30">
          <span>© {new Date().getFullYear()} Brayan Beef</span>
          <span>Feito com fogo</span>
        </div>
      </footer>
    </main>
  );
}

/* --- One slide inside the immersive dissolve section --- */
type SlideEffect = "scale" | "blur" | "clip" | "rotate";

function ImmersiveSlide({
  progress,
  start,
  end,
  image,
  name,
  meta,
  effect,
  index,
  total,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  end: number;
  image: string;
  name: string;
  meta: string[];
  effect: SlideEffect;
  index: number;
  total: number;
}) {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const fadeIn = 0.06;
  const s = clamp(start);
  const e = clamp(end);
  const sIn = clamp(start + fadeIn);
  const eOut = clamp(end - fadeIn);
  const sIn10 = clamp(start + 0.1);
  const eOut10 = clamp(end - 0.1);
  const sIn05 = clamp(start + 0.05);
  const eOut05 = clamp(end - 0.05);
  const sIn08 = clamp(start + 0.08);

  const opacity = useTransform(
    progress,
    [s, sIn, eOut, e],
    [0, 1, 1, 0]
  );

  // Effect-specific image transforms
  const scale = useTransform(
    progress,
    [s, e],
    effect === "scale" ? [1.25, 1] : effect === "rotate" ? [1.15, 1.05] : [1.1, 1]
  );
  const rotate = useTransform(
    progress,
    [s, e],
    effect === "rotate" ? [-3, 0] : [0, 0]
  );
  const blurPx = useTransform(
    progress,
    [s, sIn, eOut, e],
    effect === "blur" ? [24, 0, 0, 12] : [0, 0, 0, 0]
  );
  const filter = useTransform(blurPx, (v) => `blur(${v}px)`);
  const clipPath = useTransform(
    progress,
    [s, sIn10, eOut10, e],
    effect === "clip"
      ? [
          "inset(50% 0% 50% 0%)",
          "inset(0% 0% 0% 0%)",
          "inset(0% 0% 0% 0%)",
          "inset(0% 50% 0% 50%)",
        ]
      : [
          "inset(0% 0% 0% 0%)",
          "inset(0% 0% 0% 0%)",
          "inset(0% 0% 0% 0%)",
          "inset(0% 0% 0% 0%)",
        ]
  );

  // Text has its own reveal
  const textY = useTransform(progress, [s, sIn08], [40, 0]);
  const textOpacity = useTransform(
    progress,
    [s, sIn05, eOut05, e],
    [0, 1, 1, 0]
  );

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <motion.div style={{ clipPath }} className="absolute inset-0">
        <motion.img
          src={image}
          alt={name}
          style={{ scale, rotate, filter }}
          className="h-full w-full object-cover will-change-transform"
          loading="lazy"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background/80" />
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-foreground/60">
          0{index + 1} / 0{total} — Cortes
        </p>
        <h3 className="font-display text-[18vw] leading-none md:text-[13vw]">
          {name}
        </h3>
        <ul className="mt-10 flex flex-wrap justify-center gap-2">
          {meta.map((m) => (
            <li
              key={m}
              className="border border-foreground/25 bg-background/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-foreground/80 backdrop-blur-sm"
            >
              {m}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

/* --- Progress tick indicator for immersive section --- */
function SlideTick({
  progress,
  index,
  total,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  index: number;
  total: number;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const s0 = Math.max(0.0001, start - 0.05);
  const e1 = Math.min(0.9999, end + 0.05);
  const opacity = useTransform(
    progress,
    [Math.max(0, s0 - 0.0001), s0, e1, Math.min(1, e1 + 0.0001)],
    [0.25, 1, 1, 0.25]
  );
  const scaleY = useTransform(
    progress,
    [Math.max(0, s0 - 0.0001), s0, e1, Math.min(1, e1 + 0.0001)],
    [1, 2, 2, 1]
  );
  return (
    <motion.span
      style={{ opacity, scaleY }}
      className="block h-6 w-px origin-center bg-foreground"
    />
  );
}

