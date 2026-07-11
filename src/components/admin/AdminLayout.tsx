import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  CircleUser,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

// Structured for future growth — just add groups/items here.
const navGroups: NavGroup[] = [
  {
    label: "Geral",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Catálogo",
    items: [{ href: "/admin/produtos", label: "Produtos", icon: Package }],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-surface/80 backdrop-blur-xl transition-[transform,width] duration-300 ease-out md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "md:w-[78px]" : "w-64"}`}
      >
        {/* Logo + collapse toggle */}
        <div
          className={`flex h-16 items-center border-b border-line ${
            collapsed ? "justify-center px-2 md:px-0" : "justify-between px-5"
          }`}
        >
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`font-display text-sm tracking-tight ${
                collapsed ? "md:hidden" : ""
              }`}
            >
            BRAYAN <span className="text-accent">BEEF</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-foreground/60 md:hidden"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden text-foreground/50 transition-colors hover:text-foreground md:block"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p
                className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/30 transition-opacity ${
                  collapsed ? "md:opacity-0" : ""
                }`}
              >
                {group.label}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        collapsed ? "md:justify-center" : ""
                      } ${
                        active
                          ? "bg-accent/10 text-accent"
                          : "text-foreground/60 hover:bg-surface-2 hover:text-foreground"
                      }`}
                    >
                      {/* Active indicator bar */}
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent" />
                      )}
                      <item.icon size={18} className="shrink-0" />
                      <span className={collapsed ? "md:hidden" : ""}>
                        {item.label}
                      </span>

                      {/* Tooltip when collapsed (desktop/tablet) */}
                      {collapsed && (
                        <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-foreground opacity-0 shadow-xl transition-opacity group-hover:opacity-100 md:block">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-line p-3">
          <div
            className={`mb-2 flex items-center gap-3 px-2 ${
              collapsed ? "md:justify-center" : ""
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <CircleUser size={20} />
            </div>
            <div className={`min-w-0 ${collapsed ? "md:hidden" : ""}`}>
              <p className="truncate text-sm font-medium text-foreground">
                Administrador
              </p>
              <p className="truncate text-[11px] text-foreground/40">
                Brayan Beef
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title={collapsed ? "Sair" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/60 transition-colors hover:bg-surface-2 hover:text-accent ${
              collapsed ? "md:justify-center" : ""
            }`}
          >
            <LogOut size={18} className="shrink-0" />
            <span className={collapsed ? "md:hidden" : ""}>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-16 items-center gap-4 border-b border-line px-6 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-foreground/60"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>
          <Link to="/admin/dashboard" className="font-display text-sm">
            BRAYAN <span className="text-accent">BEEF</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 md:px-10 lg:px-16 py-8 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
