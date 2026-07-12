import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useBusiness } from "@/hooks/useBusiness";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: business } = useBusiness();
  const whatsapp = business?.whatsapp || "5500090000009";

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-white/95 backdrop-blur-md border-b border-line">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-10 md:py-5">
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <img
            src="/img/logo1.png"
            alt="Brayan Beef"
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="font-display text-sm tracking-widest text-foreground">
            BRAYAN <span className="text-accent">BEEF</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden gap-8 text-xs uppercase tracking-[0.2em] text-foreground/60 md:flex">
          <a href="/#selecao" className="hover:text-accent transition-colors">
            Seleção
          </a>
          <a href="/#cortes" className="hover:text-accent transition-colors">
            Cortes
          </a>
          <a href="/#galeria" className="hover:text-accent transition-colors">
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

        <div className="flex items-center gap-4">
          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
            target="_blank"
            rel="noreferrer"
            className="hidden bg-accent text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-accent/90 transition-colors md:block"
          >
            Pedir Agora
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-foreground/90 md:hidden"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-line bg-white md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              <a
                href="/#selecao"
                onClick={() => setMobileOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-foreground/60 hover:text-accent"
              >
                Seleção
              </a>
              <a
                href="/#cortes"
                onClick={() => setMobileOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-foreground/60 hover:text-accent"
              >
                Cortes
              </a>
              <a
                href="/#galeria"
                onClick={() => setMobileOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-foreground/60 hover:text-accent"
              >
                Galeria
              </a>
              <Link
                to="/produtos"
                onClick={() => setMobileOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-foreground/60 hover:text-accent"
              >
                Produtos
              </Link>
              <Link
                to="/sobre"
                onClick={() => setMobileOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-foreground/60 hover:text-accent"
              >
                Sobre
              </Link>
              <Link
                to="/contato"
                onClick={() => setMobileOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-foreground/60 hover:text-accent"
              >
                Contato
              </Link>
              <a
                href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
                target="_blank"
                rel="noreferrer"
                className="bg-accent text-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-center hover:bg-accent/90"
              >
                Pedir Agora
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
