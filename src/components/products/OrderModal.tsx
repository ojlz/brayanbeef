"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Minus, Plus } from "lucide-react";
import type { Product } from "@/types/product";
import { useBusiness } from "@/hooks/useBusiness";
import { trackEvent } from "@/lib/analytics";

interface OrderModalProps {
  product: Product | null;
  onClose: () => void;
}

export function OrderModal({ product, onClose }: OrderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const { data: business } = useBusiness();
  const whatsapp = business?.whatsapp || "5500090000009";

  if (!product) return null;

  const formatWhatsAppMessage = () => {
    const lines = [
      `*Pedido Brayan Beef*`,
      "",
      `*Produto:* ${product.name}`,
      `*Quantidade:* ${quantity} porção${quantity > 1 ? "es" : ""}`,
    ];

    if (weight.trim()) {
      lines.push(`*Peso:* ${weight.trim()}`);
    }

    if (notes.trim()) {
      lines.push(`*Observações:* ${notes.trim()}`);
    }

    lines.push("");
    lines.push("_Envie este pedido pelo site Brayan Beef_");

    return encodeURIComponent(lines.join("\n"));
  };

  const whatsappUrl = `https://wa.me/${whatsapp}?text=${formatWhatsAppMessage()}`;

  const canSend = quantity > 0;

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/70"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 z-[60] mx-auto my-auto flex max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-background shadow-2xl sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-lg bg-surface">
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-display text-base">{product.name}</h3>
                  <p className="text-xs text-foreground/50">
                    R$ {product.price.toFixed(2)} / {product.unit}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              {/* Aviso */}
              <div className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
                <p className="text-xs leading-relaxed text-foreground/70">
                  Informe todos os detalhes do seu pedido para agilizar o
                  atendimento: <strong className="text-foreground">quantidade</strong>,{" "}
                  <strong className="text-foreground">peso por porção</strong> e{" "}
                  <strong className="text-foreground">observações</strong> (ex: embalagem a
                  vácuo, corte em bifes, etc).
                </p>
              </div>

              {/* Quantidade */}
              <div>
                <label className="text-xs text-foreground/50 mb-2 block">
                  Quantidade de porções *
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-lg font-bold text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground hover:brightness-110 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Peso */}
              <div>
                <label className="text-xs text-foreground/50 mb-1.5 block">
                  Peso por porção *
                </label>
                <input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="ex: 800g, 1kg, 1.5kg..."
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="text-xs text-foreground/50 mb-1.5 block">
                  Observações{" "}
                  <span className="text-foreground/30">(opcional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ex: embalagem a vácuo, corte em bifes, sem gordura..."
                  rows={3}
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent transition-colors resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-line px-6 py-4">
              <a
                href={canSend ? whatsappUrl : "#"}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  if (!canSend) {
                    e.preventDefault();
                    return;
                  }
                  trackEvent("product_whatsapp", product.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all ${
                  canSend
                    ? "bg-accent text-accent-foreground hover:opacity-90 active:scale-[0.98]"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                <MessageCircle size={18} />
                Enviar pedido via WhatsApp
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
