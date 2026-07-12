import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  MousePointerClick,
  MessageCircle,
  Eye,
  Package,
  TrendingUp,
  Sparkles,
  Flame,
} from "lucide-react";
import type { Product } from "@/types/product";
import type { Analytics } from "@/lib/analytics";

export const Route = createFileRoute("/admin/_admin/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Admin Brayan Beef" }],
  }),
  component: DashboardPage,
});

function AnimatedNumber({
  value,
  prefix = "",
}: {
  value: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return;
    const isCurrency = value.startsWith("R$");
    gsap.fromTo(
      ref.current,
      { textContent: 0 },
      {
        duration: 1.8,
        textContent: num,
        ease: "power3.out",
        snap: { textContent: isCurrency ? 0.01 : 1 },
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = isCurrency
              ? `R$ ${parseFloat(ref.current.textContent || "0").toLocaleString(
                  "pt-BR",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}`
              : Math.round(parseFloat(ref.current.textContent || "0")).toString();
          }
        },
      }
    );
  }, [value]);
  return <span ref={ref}>{value}</span>;
}

function DashboardPage() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const response = await fetch("/api/github/read?path=products");
      return response.json();
    },
  });

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const response = await fetch("/api/github/read?path=analytics");
      if (!response.ok) return null;
      return response.json();
    },
  });

  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const a = {
    whatsappClicks: analytics?.whatsappClicks ?? 0,
    productClicks: analytics?.productClicks ?? {},
    productViews: analytics?.productViews ?? {},
    pageViews: analytics?.pageViews ?? 0,
  };

  const productWhatsappClicks = Object.values(a.productClicks).reduce(
    (s, n) => s + n,
    0
  );
  const productViews = Object.values(a.productViews).reduce(
    (s, n) => s + n,
    0
  );
  const conversion =
    productViews > 0
      ? ((productWhatsappClicks / productViews) * 100).toFixed(1)
      : "0.0";

  const stats = [
    {
      label: "Cliques no WhatsApp",
      value: a.whatsappClicks.toString(),
      sub: "todos os CTAs",
      icon: MessageCircle,
      ring: "bg-accent/20 text-accent",
      hint: "contatos iniciados",
    },
    {
      label: "Cliques por produto",
      value: productWhatsappClicks.toString(),
      sub: "enviar no WhatsApp",
      icon: MousePointerClick,
      ring: "bg-accent/20 text-accent",
      hint: "pedidos pelo catálogo",
    },
    {
      label: "Visualizações de produto",
      value: productViews.toString(),
      sub: "páginas de produto",
      icon: Eye,
      ring: "bg-accent/20 text-accent",
      hint: "interesse no catálogo",
    },
    {
      label: "Visitas ao site",
      value: a.pageViews.toString(),
      sub: "page views",
      icon: TrendingUp,
      ring: "bg-accent/20 text-accent",
      hint: "tráfego geral",
    },
    {
      label: "Taxa de conversão",
      value: `${conversion}%`,
      sub: "produto → WhatsApp",
      icon: Flame,
      ring: "bg-accent/20 text-accent",
      hint: "cliques / views",
    },
    {
      label: "Produtos cadastrados",
      value: products.length.toString(),
      sub: "no catálogo",
      icon: Package,
      ring: "bg-accent/20 text-accent",
      hint: "ativo no site",
    },
  ];

  // Rank products by WhatsApp clicks (fallback to views)
  const rankedProducts = [...products]
    .map((p) => ({
      product: p,
      clicks: a.productClicks[p.id] || 0,
      views: a.productViews[p.id] || 0,
    }))
    .sort((x, y) => y.clicks - x.clicks || y.views - x.views)
    .slice(0, 6);

  const maxClicks = Math.max(1, ...rankedProducts.map((r) => r.clicks));

  // GSAP master timeline
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (bgRef.current) {
        const orbs = bgRef.current.querySelectorAll(".orb");
        orbs.forEach((orb, i) => {
          gsap.to(orb, {
            x: gsap.utils.random(-40, 40),
            y: gsap.utils.random(-40, 40),
            duration: gsap.utils.random(4, 7),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.4,
          });
        });
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (titleRef.current) {
        tl.fromTo(
          titleRef.current.querySelectorAll("[data-anim]"),
          { opacity: 0, y: 28, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            stagger: 0.12,
          }
        );
      }

      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll(".stat-card");
        tl.fromTo(
          cards,
          { opacity: 0, y: 48, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.09 },
          "-=0.4"
        );
      }

      if (listRef.current) {
        tl.fromTo(
          listRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.25"
        );
        const rows = listRef.current.querySelectorAll("li");
        if (rows.length > 0) {
          tl.fromTo(
            rows,
            { opacity: 0, x: -18 },
            { opacity: 1, x: 0, duration: 0.45, stagger: 0.06 },
            "-=0.1"
          );
        }
      }
    });

    return () => ctx.revert();
  }, []);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* Animated background orbs */}
      <div
        ref={bgRef}
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="orb absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl animate-float-glow" />
        <div className="orb absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-red-600/10 blur-3xl animate-float-glow" />
        <div className="orb absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-emerald-600/10 blur-3xl animate-float-glow" />
        <div className="orb absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl animate-float-glow" />
      </div>

      {/* Content container with 24px section gaps */}
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div ref={titleRef} className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span
                data-anim
                className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent"
              >
                <Sparkles size={12} />
                Painel
              </span>
              <h1
                data-anim
                className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
              >
                Analytics do <span className="text-accent">site</span>
              </h1>
              <p
                data-anim
                className="mt-2 capitalize text-sm text-foreground/45 tracking-wide"
              >
                {today} · cliques e interesse dos visitantes
              </p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div
          ref={cardsRef}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`stat-card group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111] p-6 transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-2xl hover:shadow-accent/10`}
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.ring} transition-transform duration-500 group-hover:scale-110`}
                  >
                    <stat.icon size={20} />
                  </div>
                </div>

                <p className="mt-5 font-display text-3xl font-black tracking-tight text-white">
                  <AnimatedNumber value={stat.value} />
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">
                    {stat.label}
                  </span>
                  <span className="text-[11px] text-white/30">
                    {stat.sub}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-white/30">
                  {stat.hint}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Top products by WhatsApp clicks */}
        <div ref={listRef}>
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Produtos mais pedidos
            </h2>
            <p className="mt-1 text-sm text-foreground/40">
              Ranking por cliques em “enviar no WhatsApp”
            </p>
          </div>

          {rankedProducts.length === 0 ? (
            <div className="glass rounded-3xl p-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
                <MousePointerClick size={28} className="text-foreground/25" />
              </div>
              <p className="mt-5 text-sm text-foreground/40">
                Nenhum clique registrado ainda.
              </p>
            </div>
          ) : (
            <div className="glass overflow-hidden rounded-3xl p-6">
              <ul className="space-y-1">
                {rankedProducts.map((row, i) => {
                  const pct = (row.clicks / maxClicks) * 100;
                  return (
                    <li
                      key={row.product.id}
                      className="flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-white/[0.03]"
                    >
                      <span className="w-5 text-center font-display text-sm font-bold text-foreground/30">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-medium text-foreground/85">
                            {row.product.name}
                          </span>
                          <span className="shrink-0 text-sm font-mono text-foreground/50">
                            {row.clicks}{" "}
                            <span className="text-[11px] text-foreground/30">
                              cliques
                            </span>
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-accent to-red-400 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
