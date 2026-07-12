import { Link } from "@tanstack/react-router";
import { useBusiness } from "@/hooks/useBusiness";

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
      <div className="mx-auto max-w-[1600px] px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link to="/" className="font-display text-3xl tracking-tight">
              BRAYAN <span className="text-white/80">BEEF</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/70">
              {slogan}
            </p>
            {/* 5 stars signature */}
            <div className="mt-4 flex items-center gap-1 text-white">
              <span className="text-lg">★</span>
              <span className="text-lg">★</span>
              <span className="text-lg text-white/40">★</span>
              <span className="text-lg">★</span>
              <span className="text-lg">★</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Contato
            </h4>
            <div className="space-y-3 text-sm text-white/80">
              <a
                href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <span className="text-white/50">📱</span>
                {phone}
              </a>
              <p className="flex items-start gap-2">
                <span className="text-white/50">📍</span>
                <span>{street}, {number} — {neighborhood}<br />{city}, {state}</span>
              </p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Navegação
            </h4>
            <div className="flex flex-col gap-3 text-sm text-white/80">
              <Link to="/produtos" className="hover:text-white transition-colors">
                Produtos
              </Link>
              <Link to="/sobre" className="hover:text-white transition-colors">
                Sobre
              </Link>
              <Link to="/contato" className="hover:text-white transition-colors">
                Contato
              </Link>
              <a
                href={`https://wa.me/${whatsapp}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20um%20pedido!`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
            © {new Date().getFullYear()} Brayan Beef
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
            {street}, {number} — {city}, {state}
          </span>
        </div>
      </div>
    </footer>
  );
}
