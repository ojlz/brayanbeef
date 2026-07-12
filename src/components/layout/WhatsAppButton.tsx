"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useBusiness } from "@/hooks/useBusiness";
import { useLocation } from "@tanstack/react-router";
import { trackEvent } from "@/lib/analytics";

export function WhatsAppButton() {
  const { data: business } = useBusiness();
  const whatsapp = business?.whatsapp || "5500090000009";
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <motion.a
      href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent("whatsapp", "floating-button")}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-accent px-5 py-3.5 text-white shadow-lg shadow-accent/40 transition-colors hover:bg-accent/90 sm:bottom-6 sm:right-6"
      aria-label="Pedir via WhatsApp"
    >
      <MessageCircle size={20} />
      <span className="text-sm font-bold hidden sm:inline">Pedir Agora</span>
    </motion.a>
  );
}
