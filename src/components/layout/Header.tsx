import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, MessageCircle } from "lucide-react";
import { useBusiness } from "@/hooks/useBusiness";

export function Header({ variant = "glass" }: { variant?: "glass" | "solid" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { data: business } = useBusiness();
  const whatsapp = business?.whatsapp || "5500090000009";
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 50);
    setHidden(latest > prev && latest > 200);
  });

  const isGlass = variant === "glass";

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        isGlass
          ? scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent"
          : "bg-accent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <motion.img
            src="/img/logo1.png"
            alt="Brayan Beef"
            className="h-9 w-9 rounded-full object-cover"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          />
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-display text-sm font-bold tracking-wider text-white"
          >
            BRAYAN <span className="text-white/80">BEEF</span>
          </motion.span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="hidden items-center gap-6 md:flex"
        >
          <a href="/#sobre" className="text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors">Sobre</a>
          <a href="/#cortes" className="text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors">Cortes</a>
          <Link to="/produtos" className="text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors">Produtos</Link>
          <Link to="/contato" className="text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors">Contato</Link>
          <motion.a
            href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-accent text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-accent/90 transition-colors rounded-full"
          >
            <MessageCircle size={16} />
            Pedir
          </motion.a>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white md:hidden"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 bg-black/90 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-3 px-5 py-5">
              {[
                { label: "Sobre", href: "/#sobre" },
                { label: "Cortes", href: "/#cortes" },
                { label: "Produtos", href: "/produtos", isLink: true },
                { label: "Contato", href: "/contato", isLink: true },
              ].map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-semibold text-white/80 hover:text-white"
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.a
                href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-center justify-center gap-2 bg-accent py-3 text-sm font-bold text-white rounded-full"
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
