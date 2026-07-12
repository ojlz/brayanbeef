import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageCircle } from "lucide-react";
import { useBusiness } from "@/hooks/useBusiness";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: business } = useBusiness();
  const whatsapp = business?.whatsapp || "5500090000009";

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-accent">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/img/logo1.png" alt="Brayan Beef" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-display text-sm font-bold tracking-wider text-white">
            BRAYAN <span className="text-white/80">BEEF</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <a href="/#sobre" className="text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors">Sobre</a>
          <a href="/#cortes" className="text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors">Cortes</a>
          <Link to="/produtos" className="text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors">Produtos</Link>
          <Link to="/contato" className="text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors">Contato</Link>
          <a
            href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-white text-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
          >
            <MessageCircle size={16} />
            Pedir
          </a>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white md:hidden" aria-label="Menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/20 bg-accent md:hidden"
          >
            <div className="flex flex-col gap-3 px-5 py-5">
              <a href="/#sobre" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-white/80 hover:text-white">Sobre</a>
              <a href="/#cortes" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-white/80 hover:text-white">Cortes</a>
              <Link to="/produtos" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-white/80 hover:text-white">Produtos</Link>
              <Link to="/contato" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-white/80 hover:text-white">Contato</Link>
              <a
                href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-white text-accent py-3 text-sm font-bold"
              >
                <MessageCircle size={16} /> Pedir pelo WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
