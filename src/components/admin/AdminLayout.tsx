import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutDashboard, Package, Settings, LogOut, Menu, X, ChevronsLeft, ChevronsRight, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navGroups = [
  { label: "Geral", items: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  { label: "Catálogo", items: [{ href: "/admin/produtos", label: "Produtos", icon: Package }] },
  { label: "Sistema", items: [{ href: "/admin/configuracoes", label: "Configurações", icon: Settings }] },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const isActive = (href: string, exact?: boolean) => exact ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-black text-white">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#111] transition-[width] duration-300 md:static md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "md:w-[72px]" : "w-64"}`}>
        {/* Header */}
        <div className={`flex h-16 items-center border-b border-white/10 ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}>
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <img src="/img/logo1.png" alt="" className="h-8 w-8 rounded-full object-cover" />
            {!collapsed && <span className="font-display text-sm font-black">BRAYAN <span className="text-accent">BEEF</span></span>}
          </Link>
          <button onClick={() => setMobileOpen(false)} className="text-white/50 md:hidden"><X size={20} /></button>
          <button onClick={() => setCollapsed((c) => !c)} className="hidden text-white/40 hover:text-white transition-colors md:block">
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ${collapsed ? "md:opacity-0" : ""}`}>{group.label}</p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link key={item.href} to={item.href} title={collapsed ? item.label : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${collapsed ? "md:justify-center" : ""} ${active ? "bg-accent text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
                      {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-white" />}
                      <item.icon size={18} className="shrink-0" />
                      <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
                      {collapsed && <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg border border-white/10 bg-[#111] px-3 py-1.5 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 md:block">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-3">
          <div className={`mb-2 flex items-center gap-3 px-2 ${collapsed ? "md:justify-center" : ""}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent"><Star size={18} /></div>
            <div className={`min-w-0 ${collapsed ? "md:hidden" : ""}`}>
              <p className="truncate text-sm font-bold">Administrador</p>
              <p className="truncate text-[11px] text-white/40">Brayan Beef</p>
            </div>
          </div>
          <button onClick={() => logout()} title={collapsed ? "Sair" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-accent ${collapsed ? "md:justify-center" : ""}`}>
            <LogOut size={18} className="shrink-0" />
            <span className={collapsed ? "md:hidden" : ""}>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-white/10 bg-[#111] px-6 md:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-white/60"><Menu size={24} /></button>
          <Link to="/admin/dashboard" className="font-display text-sm font-black">BRAYAN <span className="text-accent">BEEF</span></Link>
        </header>
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 md:px-8 lg:px-12 py-8 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
