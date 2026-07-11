import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useBusiness } from "@/hooks/useBusiness";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Brayan Beef | Açougue em Porto Fictício�, MS" },
      {
        name: "description",
        content:
          "Entre em contato com a Brayan Beef em Porto Fictício�, MS. WhatsApp, telefone e localização. Faça seu pedido!",
      },
      { property: "og:title", content: "Contato — Brayan Beef" },
      {
        property: "og:description",
        content: "Entre em contato com a Brayan Beef em Porto Fictício�, MS. WhatsApp, telefone e localização.",
      },
      { property: "og:image", content: "https://brayanbeef.vercel.app/img/picanha.jpg" },
    ],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  const { data: business } = useBusiness();

  const street = business?.address?.street || "Av. Fictícia";
  const number = business?.address?.number || "333";
  const neighborhood = business?.address?.neighborhood || "Centro";
  const city = business?.address?.city || "Porto Fictício�";
  const state = business?.address?.state || "MS";
  const zip = business?.address?.zip || "00000-000";
  const phone = business?.phone || "(00) 90000-0009";
  const whatsapp = business?.whatsapp || "5500090000009";
  const lat = business?.coordinates?.lat || -23.0308;
  const lng = business?.coordinates?.lng || -54.1941;

  const formatHours = (label: string, data: { open: string; close: string } | null) => {
    if (!data) return `${label}: Fechado`;
    return `${label}: ${data.open.slice(0, 5)} — ${data.close.slice(0, 5)}`;
  };

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
              — Fale Conosco
            </p>
            <h1 className="font-display text-5xl leading-[0.95] md:text-7xl">
              Contato
            </h1>
          </motion.div>

          <div className="mt-24 grid gap-16 lg:grid-cols-2">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-12"
            >
              {/* Contact details */}
              <div>
                <h2 className="font-display text-2xl">Informações</h2>
                <div className="mt-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin size={20} className="mt-0.5 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Endereço
                      </p>
                      <p className="mt-1 text-sm text-foreground/60">
                        {street}, {number}
                        <br />
                        {neighborhood} — {city}, {state}
                        <br />
                        CEP: {zip}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone size={20} className="mt-0.5 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Telefone
                      </p>
                      <p className="mt-1 text-sm text-foreground/60">
                        {phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock size={20} className="mt-0.5 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Horário
                      </p>
                      <div className="mt-1 space-y-0.5 text-sm text-foreground/60">
                        <p>{formatHours("Seg — Sex", business?.hours?.seg)}</p>
                        <p>{formatHours("Sábado", business?.hours?.sab)}</p>
                        <p>{formatHours("Domingo", business?.hours?.dom)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 border border-accent bg-accent/10 py-4 text-sm uppercase tracking-wider text-accent hover:bg-accent hover:text-foreground transition-colors"
              >
                <MessageCircle size={18} />
                Falar no WhatsApp
              </a>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="aspect-video overflow-hidden border border-line">
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.0!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${city}+${state}!5e0!3m2!1spt-BR!2sbr`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Localização ${business?.name || "Brayan Beef"}`}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
