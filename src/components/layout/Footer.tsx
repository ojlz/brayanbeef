import { Link } from "@tanstack/react-router";
import { useBusiness } from "@/hooks/useBusiness";

export function Footer() {
  const { data: business } = useBusiness();

  const slogan = business?.slogan || "Aqui fazemos do seu jeito!";
  const street = business?.address?.street || "Av. Fictícia";
  const number = business?.address?.number || "333";
  const city = business?.address?.city || "Porto Fictício�";
  const state = business?.address?.state || "MS";
  const whatsapp = business?.whatsapp || "5500090000009";

  return (
    <footer className="border-t border-line bg-background px-6 py-16 md:px-10">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <Link to="/" className="font-display text-2xl">
            BRAYAN <span className="text-accent">BEEF</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-foreground/50">
            {slogan} — {street}, {number} — {city}, {state}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-4 text-xs uppercase tracking-[0.2em] text-foreground/50">
          <Link to="/produtos" className="hover:text-foreground">
            Produtos
          </Link>
          <Link to="/sobre" className="hover:text-foreground">
            Sobre
          </Link>
          <Link to="/contato" className="hover:text-foreground">
            Contato
          </Link>
          <a href={`https://wa.me/${whatsapp}`} className="hover:text-foreground">
            WhatsApp
          </a>
          <span>{city} — {state}</span>
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-[1600px] items-center justify-between text-[10px] uppercase tracking-[0.3em] text-foreground/30">
        <span>© {new Date().getFullYear()} Brayan Beef</span>
        <span>Feito com fogo</span>
      </div>
    </footer>
  );
}
