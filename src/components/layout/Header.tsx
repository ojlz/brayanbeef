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
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="fixed left-0 right-0 top-0 z-50"
    >
      <div className="mx-3 mt-3 md:mx-6 md:mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <nav className="flex max-w-[1400px] mx-auto items-center justify-between px-5 py-3 md:px-8 md:py-3.5">
          <Link to="/" className="flex items-center gap-2">
            <motion.img
              src="/img/logo1.png"
              alt="Brayan Beef"
              className="h-9 w-9 rounded-full object-cover"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            />
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="font-display text-sm font-bold tracking-wider text-white"
            >
              BRAYAN <span className="text-white/70">BEEF</span>
            </motion.span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="hidden items-center gap-5 md:flex"
          >
            <a href="/#sobre" className="text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-colors">Sobre</a>
            <a href="/#cortes" className="text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-colors">Cortes</a>
            <Link to="/produtos" className="text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-colors">Produtos</Link>
            <Link to="/contato" className="text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-colors">Contato</Link>
            <motion.a
              href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
              target="_blank" rel="noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-accent text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-accent/90 transition-colors rounded-full"
            >
              <MessageCircle size={16} /> Pedir
            </motion.a>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </nav>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-3 mt-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-5 py-4">
              {[
                { label: "Sobre", href: "/#sobre" },
                { label: "Cortes", href: "/#cortes" },
                { label: "Produtos", href: "/produtos" },
                { label: "Contato", href: "/contato" },
              ].map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-semibold text-white/70 hover:text-white py-2"
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.a
                href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
                target="_blank" rel="noreferrer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-center justify-center gap-2 bg-accent py-3 text-sm font-bold text-white rounded-full mt-1"
              >
                <MessageCircle size={16} /> Pedir pelo WhatsApp
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
