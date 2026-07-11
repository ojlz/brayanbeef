import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Brayan Beef | Carnes Premium em Porto Fictício�, MS" },
      {
        name: "description",
        content: "Conheça a história da Brayan Beef: carnes Angus selecionadas em Porto Fictício�, MS. Açougue artesanal com tradição e qualidade.",
      },
      { property: "og:title", content: "Sobre — Brayan Beef" },
      {
        property: "og:description",
        content: "Conheça a história da Brayan Beef: carnes Angus selecionadas em Porto Fictício�, MS.",
      },
      { property: "og:image", content: "https://brayanbeef.vercel.app/img/picanha.jpg" },
    ],
  }),
  component: SobrePage,
});

const values = [
  {
    number: "01",
    title: "Qualidade",
    description:
      "Selecionamos apenas carnes Angus e Hereford de frigoríficos certificados. Cada corte passa por rigoroso controle de qualidade.",
  },
  {
    number: "02",
    title: "Maturação",
    description:
      "Cada corte passa pelo processo de maturação ideal para garantir sabor e maciez incomparáveis.",
  },
  {
    number: "03",
    title: "Compromisso",
    description:
      "Do frigorífico à sua mesa, mantemos a cadeia do frio e a qualidade em cada etapa do processo.",
  },
];

function SobrePage() {
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
              — Nossa História
            </p>
            <h1 className="font-display text-5xl leading-[0.95] md:text-7xl">
              Feito com <span className="text-accent">paixão</span>
            </h1>
          </motion.div>

          {/* Story */}
          <div className="mt-24 grid gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-display text-3xl">A origem</h2>
              <p className="mt-6 text-sm leading-relaxed text-foreground/70">
                A Brayan Beef nasceu do amor pela carne de qualidade. Começamos
                em Porto Fictício�, no coração do Estado Fictício, com um sonho
                simples: oferecer os melhores cortes para quem entende de
                churrasco.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-foreground/70">
                Cada corte é selecionado com rigor, maturado na medida certa e
                entregue com a qualidade que nossos clientes merecem. Não somos
                apenas um açougue — somos uma experiência.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-foreground/70">
                Nosso compromisso é com a excelência, do atendimento à entrega.
                Acreditamos que uma boa carne tem o poder de transformar um
                simples almoço em um momento especial.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative overflow-hidden bg-surface"
            >
              <div className="aspect-[4/3]">
                <img
                  src="/img/sobre.jpg"
                  alt="Brayan Beef — A origem"
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>
          </div>

          {/* Values */}
          <div className="mt-32 grid gap-16 md:grid-cols-3">
            {values.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="relative pt-8"
              >
                <span className="absolute left-0 top-0 block h-px w-full bg-line" />
                <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-foreground/50">
                  / {item.number}
                </p>
                <h3 className="font-display text-2xl">{item.title}</h3>
                <p className="mt-4 text-sm text-foreground/60">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
