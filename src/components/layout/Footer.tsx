import { Link } from "@tanstack/react-router";
import { useBusiness } from "@/hooks/useBusiness";
import { MessageCircle, MapPin, Phone, Star } from "lucide-react";

export function Footer() {
  const { data: business } = useBusiness();
  const slogan = business?.slogan || "Aqui fazemos do seu jeito!";
  const street = business?.address?.street || "Av. Fictícia";
  const number = business?.address?.number || "333";
  const neighborhood = business?.address?.neighborhood || "Centro";
  const city = business?.address?.city || "Porto Fictício�";
  const state = business?.address?.state || "MS";
  const whatsapp = business?.whatsapp || "5500090000009";
  const phone = business?.phone || "(00) 90000-0009";

  return (
    <footer className="bg-accent text-white">
      {/* Main footer */}
      <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <img src="/img/logo1.png" alt="Brayan Beef" className="h-12 w-12 rounded-full object-cover mb-4" />
            <p className="text-sm text-white/70">{slogan}</p>
            <div className="mt-3 flex items-center gap-0.5">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} size={14} className={i <= 4 ? "fill-white text-white" : "text-white/40"} />
              ))}
              <span className="ml-2 text-xs text-white/60">4.8 (63)</span>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">Contato</h4>
            <div className="space-y-2 text-sm text-white/80">
              <a href={`https://wa.me/${whatsapp}`} className="flex items-center gap-2 hover:text-white">
                <MessageCircle size={14} /> {phone}
              </a>
              <p className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                {street}, {number} — {neighborhood}, {city}, {state}
              </p>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">Navegação</h4>
            <div className="flex flex-col gap-2 text-sm text-white/80">
              <Link to="/produtos" className="hover:text-white">Produtos</Link>
              <Link to="/sobre" className="hover:text-white">Sobre</Link>
              <Link to="/contato" className="hover:text-white">Contato</Link>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom bar */}
      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-5 py-4 md:flex-row md:px-8">
          <div className="flex items-center gap-2">
            <img src="/img/logo1.png" alt="" className="h-6 w-6 rounded-full object-cover" />
            <span className="font-display text-xs font-bold tracking-wider">BRAYAN BEEF</span>
          </div>
          <span className="text-[10px] text-white/50">© {new Date().getFullYear()} — {street}, {number} — {city}, {state}</span>
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} size={10} className={i <= 4 ? "fill-white text-white" : "text-white/40"} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
