# Brayan Beef Production Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing landing page into a complete production-ready website with public pages, admin dashboard, GitHub-based CMS, and WhatsApp ordering.

**Architecture:** GitHub repository stores JSON data files. Admin dashboard edits via GitHub REST API (commits). Public pages read from GitHub API with caching. Custom JWT authentication for admin. WhatsApp redirects for ordering.

**Tech Stack:** TanStack Start, TanStack Router, TanStack Query, Tailwind CSS v4, Framer Motion, Zod, React Hook Form, GitHub REST API

## Global Constraints

- Preserve existing landing page design (colors, fonts, animations, spacing)
- Background: `oklch(0.08 0 0)`, Foreground: `oklch(0.94 0 0)`, Accent: `oklch(0.36 0.14 27)`
- Fonts: Geist (display), Inter (sans)
- Mobile-first for admin, responsive for public pages
- No external auth providers (custom JWT only)
- No database (GitHub JSON files only)
- Vercel deployment (serverless functions)

---

## File Structure

```
src/
├── types/
│   ├── product.ts             # (new)
│   ├── category.ts            # (new)
│   ├── settings.ts            # (new)
│   └── order.ts               # (new)
├── lib/
│   ├── github.ts              # (new) GitHub API utilities
│   ├── auth.ts                # (new) JWT auth utilities
│   └── utils.ts               # (existing)
├── hooks/
│   ├── useCart.ts              # (new)
│   └── useAuth.ts              # (new)
├── components/
│   ├── ui/                    # (existing)
│   ├── layout/
│   │   ├── Header.tsx         # (new)
│   │   └── Footer.tsx         # (new)
│   ├── cart/
│   │   ├── CartProvider.tsx   # (new)
│   │   ├── CartDrawer.tsx     # (new)
│   │   └── CartItem.tsx       # (new)
│   ├── products/
│   │   ├── ProductCard.tsx    # (new)
│   │   ├── ProductGrid.tsx    # (new)
│   │   └── CategoryFilter.tsx # (new)
│   └── admin/
│       ├── AdminLayout.tsx    # (new)
│       └── DataTable.tsx      # (new)
├── routes/
│   ├── __root.tsx             # (modify)
│   ├── index.tsx              # (existing)
│   ├── produtos.tsx           # (new)
│   ├── produtos.$slug.tsx     # (new)
│   ├── sobre.tsx              # (new)
│   ├── contato.tsx            # (new)
│   ├── admin/
│   │   ├── _admin.tsx         # (new)
│   │   ├── admin.login.tsx    # (new)
│   │   ├── admin.index.tsx    # (new)
│   │   ├── admin.produtos.tsx # (new)
│   │   └── admin.configuracoes.tsx # (new)
│   └── api/
│       ├── api.auth.login.ts  # (new)
│       ├── api.auth.logout.ts # (new)
│       ├── api.auth.me.ts     # (new)
│       ├── api.github.read.ts # (new)
│       └── api.github.write.ts # (new)
```

---

## Task 1: Type Definitions

**Covers:** [S3]

**Files:**
- Create: `src/types/product.ts`
- Create: `src/types/category.ts`
- Create: `src/types/settings.ts`
- Create: `src/types/order.ts`

**Interfaces:**
- Consumes: (none)
- Produces: Product, Category, Settings, Order types

- [ ] **Step 1: Create product types**

```typescript
// src/types/product.ts
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  unit: "kg" | "un";
  weight: string;
  category: string;
  images: string[];
  featured: boolean;
  promotion: { discount: number; label: string } | null;
  available: boolean;
  meta: string[];
}
export type ProductInput = Omit<Product, "id">;
```

- [ ] **Step 2: Create category types**

```typescript
// src/types/category.ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
}
export type CategoryInput = Omit<Category, "id">;
```

- [ ] **Step 3: Create settings types**

```typescript
// src/types/settings.ts
export interface BusinessSettings {
  name: string;
  phone: string;
  whatsapp: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
  coordinates: { lat: number; lng: number };
  hours: Record<string, { open: string; close: string } | null>;
  social: { instagram: string; facebook: string };
}
export interface SEOSettings {
  title: string;
  description: string;
  ogImage: string;
}
```

- [ ] **Step 4: Create order types**

```typescript
// src/types/order.ts
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}
export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  customer: { name: string; phone: string };
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  createdAt: string;
  notes: string;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript types for products, categories, settings, orders"
```

---

## Task 2: GitHub API Utilities

**Covers:** [S2]

**Files:**
- Create: `src/lib/github.ts`

**Interfaces:**
- Consumes: types from Task 1
- Produces: readJSON, writeJSON, listFiles functions

- [ ] **Step 1: Create GitHub API utility**

```typescript
// src/lib/github.ts
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

interface GitHubContent {
  sha: string;
  content: string;
}

export async function readJSON<T>(path: string): Promise<T> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (!response.ok) throw new Error(`Failed to read ${path}`);
  const data: GitHubContent = await response.json();
  return JSON.parse(atob(data.content.replace(/\n/g, "")));
}

export async function writeJSON<T>(path: string, data: T, message: string): Promise<void> {
  const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
  const getResponse = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" },
  });
  let sha: string | undefined;
  if (getResponse.ok) {
    const contentData: GitHubContent = await getResponse.json();
    sha = contentData.sha;
  }
  const body: Record<string, unknown> = { message, content: btoa(JSON.stringify(data, null, 2)), branch: GITHUB_BRANCH };
  if (sha) body.sha = sha;
  const putResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!putResponse.ok) throw new Error(`Failed to write ${path}`);
}

export async function listFiles(directory: string): Promise<string[]> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${directory}?ref=${GITHUB_BRANCH}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" },
  });
  if (!response.ok) throw new Error(`Failed to list ${directory}`);
  const data = await response.json();
  return Array.isArray(data) ? data.filter((i: { type: string }) => i.type === "file").map((i: { name: string }) => i.name.replace(".json", "")) : [];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/github.ts
git commit -m "feat: add GitHub API utilities for reading/writing JSON data"
```

---

## Task 3: Authentication System

**Covers:** [S2]

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/hooks/useAuth.ts`

**Interfaces:**
- Consumes: (none)
- Produces: login, getSession, useAuth hook

- [ ] **Step 1: Create auth utility**

```typescript
// src/lib/auth.ts
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function login(username: string, password: string): Promise<string | null> {
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) return null;
  return new SignJWT({ username }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try { const { payload } = await jwtVerify(token, JWT_SECRET); return payload; } catch { return null; }
}

export function setSessionCookie(token: string) {
  return `auth-token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`;
}

export function clearSessionCookie() {
  return "auth-token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}
```

- [ ] **Step 2: Create useAuth hook**

```typescript
// src/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth"],
    queryFn: async () => { const r = await fetch("/api/auth/me"); return r.ok ? r.json() : null; },
    staleTime: 5 * 60 * 1000,
  });
  const loginMutation = useMutation({
    mutationFn: async (creds: { username: string; password: string }) => {
      const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(creds) });
      if (!r.ok) throw new Error("Login failed");
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth"] }),
  });
  const logoutMutation = useMutation({
    mutationFn: async () => { await fetch("/api/auth/logout", { method: "POST" }); },
    onSuccess: () => queryClient.setQueryData(["auth"], null),
  });
  return { user, isAuthenticated: !!user, isLoading, login: loginMutation.mutate, logout: logoutMutation.mutate, isLoggingIn: loginMutation.isPending, loginError: loginMutation.error };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts src/hooks/useAuth.ts
git commit -m "feat: add JWT authentication system with useAuth hook"
```

---

## Task 4: API Routes

**Covers:** [S2]

**Files:**
- Create: `src/routes/api/api.auth.login.ts`
- Create: `src/routes/api/api.auth.logout.ts`
- Create: `src/routes/api/api.auth.me.ts`
- Create: `src/routes/api/api.github.read.ts`
- Create: `src/routes/api/api.github.write.ts`

**Interfaces:**
- Consumes: auth utilities, GitHub utilities
- Produces: API endpoints

- [ ] **Step 1: Create login endpoint**

```typescript
// src/routes/api/api.auth.login.ts
import { createFileRoute } from "@tanstack/react-router";
import { login, setSessionCookie } from "@/lib/auth";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { username, password } = await request.json();
        const token = await login(username, password);
        if (!token) return new Response(JSON.stringify({ error: "Invalid" }), { status: 401 });
        return new Response(JSON.stringify({ success: true }), { headers: { "Set-Cookie": setSessionCookie(token) } });
      },
    },
  },
});
```

- [ ] **Step 2: Create logout endpoint**

```typescript
// src/routes/api/api.auth.logout.ts
import { createFileRoute } from "@tanstack/react-router";
import { clearSessionCookie } from "@/lib/auth";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async () => new Response(JSON.stringify({ success: true }), { headers: { "Set-Cookie": clearSessionCookie() } }),
    },
  },
});
```

- [ ] **Step 3: Create me endpoint**

```typescript
// src/routes/api/api.auth.me.ts
import { createFileRoute } from "@tanstack/react-router";
import { verifyToken } from "@/lib/auth";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cookie = request.headers.get("cookie")?.match(/auth-token=([^;]+)/)?.[1];
        if (!cookie) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
        const payload = await verifyToken(cookie);
        if (!payload) return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
        return new Response(JSON.stringify({ username: payload.username }));
      },
    },
  },
});
```

- [ ] **Step 4: Create GitHub read endpoint**

```typescript
// src/routes/api/api.github.read.ts
import { createFileRoute } from "@tanstack/react-router";
import { readJSON, listFiles } from "@/lib/github";

export const Route = createFileRoute("/api/github/read")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const path = url.searchParams.get("path");
        if (!path) return new Response(JSON.stringify({ error: "Missing path" }), { status: 400 });
        try {
          if (path.includes("/")) {
            const data = await readJSON(`data/${path}.json`);
            return new Response(JSON.stringify(data));
          }
          const files = await listFiles(`data/${path}`);
          const items = await Promise.all(files.map((f) => readJSON(`data/${path}/${f}.json`)));
          return new Response(JSON.stringify(items));
        } catch { return new Response(JSON.stringify({ error: "Not found" }), { status: 404 }); }
      },
    },
  },
});
```

- [ ] **Step 5: Create GitHub write endpoint**

```typescript
// src/routes/api/api.github.write.ts
import { createFileRoute } from "@tanstack/react-router";
import { writeJSON } from "@/lib/github";
import { verifyToken } from "@/lib/auth";

export const Route = createFileRoute("/api/github/write")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cookie = request.headers.get("cookie")?.match(/auth-token=([^;]+)/)?.[1];
        if (!cookie || !(await verifyToken(cookie))) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        const { path, data, message } = await request.json();
        await writeJSON(`data/${path}`, data, message || `Update ${path}`);
        return new Response(JSON.stringify({ success: true }));
      },
    },
  },
});
```

- [ ] **Step 6: Commit**

```bash
git add src/routes/api/
git commit -m "feat: add authentication and GitHub API routes"
```

---

## Task 5: Admin Route Protection

**Covers:** [S2]

**Files:**
- Modify: `src/routes/__root.tsx`

**Interfaces:**
- Consumes: verifyToken from Task 3
- Produces: Protected admin routes

- [ ] **Step 1: Add beforeLoad to root route**

Add to `__root.tsx` in the Route definition:

```typescript
import { verifyToken } from "@/lib/auth";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ location }) => {
    if (location.pathname.startsWith("/admin") && location.pathname !== "/admin/login") {
      const cookie = typeof document !== "undefined" ? document.cookie.match(/auth-token=([^;]+)/)?.[1] : null;
      if (!cookie || !(await verifyToken(cookie))) {
        throw redirect({ to: "/admin/login" });
      }
    }
  },
  // ... rest of existing config
});
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/__root.tsx
git commit -m "feat: add admin route protection middleware"
```

---

## Task 6: Layout Components

**Covers:** [S4]

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`

**Interfaces:**
- Consumes: useCart hook
- Produces: Layout components

- [ ] **Step 1: Create Header component**

```typescript
// src/components/layout/Header.tsx
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items, openCart } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-10 md:py-6">
        <Link to="/" className="font-display text-sm tracking-widest text-foreground/90">
          BRAYAN <span className="text-accent">BEEF</span>
        </Link>
        <div className="hidden gap-8 text-xs uppercase tracking-[0.2em] text-foreground/60 md:flex">
          <Link to="/produtos" className="hover:text-foreground transition-colors">Produtos</Link>
          <Link to="/sobre" className="hover:text-foreground transition-colors">Sobre</Link>
          <Link to="/contato" className="hover:text-foreground transition-colors">Contato</Link>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={openCart} className="relative text-foreground/90 hover:text-accent transition-colors" aria-label="Abrir carrinho">
            <ShoppingBag size={20} />
            {itemCount > 0 && <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-foreground">{itemCount}</span>}
          </button>
          <a href="https://wa.me/5500090000009" target="_blank" rel="noreferrer" className="hidden text-xs uppercase tracking-[0.2em] text-foreground/90 hover:text-accent transition-colors md:block">WhatsApp</a>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground/90 md:hidden" aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-line bg-background md:hidden">
            <div className="flex flex-col gap-4 px-6 py-6">
              <Link to="/produtos" onClick={() => setMobileOpen(false)} className="text-sm uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground">Produtos</Link>
              <Link to="/sobre" onClick={() => setMobileOpen(false)} className="text-sm uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground">Sobre</Link>
              <Link to="/contato" onClick={() => setMobileOpen(false)} className="text-sm uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground">Contato</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
```

- [ ] **Step 2: Create Footer component**

```typescript
// src/components/layout/Footer.tsx
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-line bg-background px-6 py-16 md:px-10">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <Link to="/" className="font-display text-2xl">BRAYAN <span className="text-accent">BEEF</span></Link>
          <p className="mt-4 max-w-xs text-sm text-foreground/50">A melhor carne de Porto Fictício�. Do corte ao churrasco.</p>
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-4 text-xs uppercase tracking-[0.2em] text-foreground/50">
          <Link to="/produtos" className="hover:text-foreground">Produtos</Link>
          <Link to="/sobre" className="hover:text-foreground">Sobre</Link>
          <Link to="/contato" className="hover:text-foreground">Contato</Link>
          <a href="https://wa.me/5500090000009" className="hover:text-foreground">WhatsApp</a>
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-[1600px] items-center justify-between text-[10px] uppercase tracking-[0.3em] text-foreground/30">
        <span>© {new Date().getFullYear()} Brayan Beef</span>
        <span>Feito com fogo</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add Header and Footer layout components"
```

---

## Task 7: Cart System

**Covers:** [S6]

**Files:**
- Create: `src/hooks/useCart.ts`
- Create: `src/components/cart/CartItem.tsx`
- Create: `src/components/cart/CartDrawer.tsx`
- Create: `src/components/cart/CartProvider.tsx`

**Interfaces:**
- Consumes: Product type
- Produces: Cart context, CartDrawer, useCart hook

- [ ] **Step 1: Create useCart hook**

```typescript
// src/hooks/useCart.ts
import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/types/product";

export interface CartItem { product: Product; quantity: number; }

const CART_KEY = "brayan-beef-cart";

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => { setItems(getStoredCart()); }, []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const newItems = existing ? prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i) : [...prev, { product, quantity }];
      localStorage.setItem(CART_KEY, JSON.stringify(newItems));
      return newItems;
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => { const n = prev.filter((i) => i.product.id !== id); localStorage.setItem(CART_KEY, JSON.stringify(n)); return n; });
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) { removeItem(id); return; }
    setItems((prev) => { const n = prev.map((i) => i.product.id === id ? { ...i, quantity: qty } : i); localStorage.setItem(CART_KEY, JSON.stringify(n)); return n; });
  }, [removeItem]);

  const clearCart = useCallback(() => { setItems([]); localStorage.removeItem(CART_KEY); }, []);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, isOpen, total, itemCount, addItem, removeItem, updateQuantity, clearCart, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) };
}
```

- [ ] **Step 2: Create CartItem component**

```typescript
// src/components/cart/CartItem.tsx
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "@/hooks/useCart";

export function CartItem({ item, onUpdateQuantity, onRemove }: { item: CartItemType; onUpdateQuantity: (id: string, qty: number) => void; onRemove: (id: string) => void }) {
  return (
    <div className="flex gap-4 border-b border-line py-4">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden bg-surface">
        {item.product.images[0] && <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h4 className="text-sm font-medium text-foreground">{item.product.name}</h4>
          <p className="text-xs text-foreground/50">R$ {item.product.price.toFixed(2)} / {item.product.unit}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)} className="flex h-6 w-6 items-center justify-center border border-line hover:bg-surface"><Minus size={12} /></button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} className="flex h-6 w-6 items-center justify-center border border-line hover:bg-surface"><Plus size={12} /></button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
            <button onClick={() => onRemove(item.product.id)} className="text-foreground/40 hover:text-accent"><Trash2 size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create CartDrawer**

```typescript
// src/components/cart/CartDrawer.tsx
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, MessageCircle } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { CartItem } from "./CartItem";

export function CartDrawer() {
  const { items, isOpen, total, closeCart, updateQuantity, removeItem, clearCart } = useCart();

  const whatsappMessage = encodeURIComponent(
    ["🥩 *Pedido Brayan Beef*", "", ...items.map((i) => `• ${i.quantity}x ${i.product.name} (${i.product.weight}) — R$ ${(i.product.price * i.quantity).toFixed(2)}`), "", `📊 *Total: R$ ${total.toFixed(2)}*`, "", "---", "Via brayanbeef.com.br"].join("\n")
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCart} className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm" />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-background border-l border-line">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div className="flex items-center gap-3"><ShoppingBag size={20} /><h2 className="font-display text-lg">Carrinho</h2></div>
              <button onClick={closeCart} className="text-foreground/60 hover:text-foreground"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12"><ShoppingBag size={48} className="mb-4 text-foreground/20" /><p className="text-sm text-foreground/50">Seu carrinho está vazio</p></div>
              ) : items.map((item) => <CartItem key={item.product.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />)}
            </div>
            {items.length > 0 && (
              <div className="border-t border-line px-6 py-4">
                <div className="mb-4 flex items-center justify-between"><span className="text-sm text-foreground/60">Total</span><span className="font-display text-xl">R$ {total.toFixed(2)}</span></div>
                <a href={`https://wa.me/5500090000009?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 bg-accent py-3 text-sm font-medium text-foreground hover:bg-accent/90"><MessageCircle size={18} />Finalizar pelo WhatsApp</a>
                <button onClick={clearCart} className="mt-3 w-full text-center text-xs text-foreground/40 hover:text-foreground/60">Limpar carrinho</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Create CartProvider**

```typescript
// src/components/cart/CartProvider.tsx
import { ReactNode } from "react";
import { CartDrawer } from "./CartDrawer";

export function CartProvider({ children }: { children: ReactNode }) {
  return <>{children}<CartDrawer /></>;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/cart/ src/hooks/useCart.ts
git commit -m "feat: add shopping cart system with WhatsApp integration"
```

---

## Task 8: Product Pages

**Covers:** [S4]

**Files:**
- Create: `src/components/products/ProductCard.tsx`
- Create: `src/components/products/ProductGrid.tsx`
- Create: `src/components/products/CategoryFilter.tsx`
- Create: `src/routes/produtos.tsx`
- Create: `src/routes/produtos.$slug.tsx`

**Interfaces:**
- Consumes: Product, Category types, useCart hook
- Produces: Catalog and detail pages

- [ ] **Step 1: Create ProductCard**

```typescript
// src/components/products/ProductCard.tsx
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types/product";
import { useCart } from "@/hooks/useCart";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const finalPrice = product.promotion ? product.price * (1 - product.promotion.discount / 100) : product.price;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="group relative">
      <Link to="/produtos/$slug" params={{ slug: product.slug }} className="block">
        <div className="aspect-[4/5] overflow-hidden bg-surface">
          {product.images[0] && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />}
          {product.promotion && <div className="absolute left-4 top-4 bg-accent px-2 py-1 text-[10px] uppercase tracking-wider text-foreground">{product.promotion.label}</div>}
        </div>
      </Link>
      <div className="mt-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground"><Link to="/produtos/$slug" params={{ slug: product.slug }}>{product.name}</Link></h3>
            <p className="mt-1 text-xs text-foreground/50">{product.weight} / {product.unit}</p>
          </div>
          <div className="text-right">
            {product.promotion && <span className="text-xs text-foreground/40 line-through">R$ {product.price.toFixed(2)}</span>}
            <p className="text-sm font-medium text-accent">R$ {finalPrice.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {product.meta.slice(0, 2).map((tag) => <span key={tag} className="border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-foreground/50">{tag}</span>)}
        </div>
        <button onClick={(e) => { e.preventDefault(); addItem(product); }} className="mt-4 flex w-full items-center justify-center gap-2 border border-line bg-transparent py-2 text-xs uppercase tracking-wider text-foreground/70 hover:border-accent hover:text-accent">
          <ShoppingCart size={14} />Adicionar
        </button>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Create ProductGrid**

```typescript
// src/components/products/ProductGrid.tsx
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
```

- [ ] **Step 3: Create CategoryFilter**

```typescript
// src/components/products/CategoryFilter.tsx
import type { Category } from "@/types/category";

export function CategoryFilter({ categories, selected, onSelect }: { categories: Category[]; selected: string | null; onSelect: (slug: string | null) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => onSelect(null)} className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${selected === null ? "bg-accent text-foreground" : "border border-line text-foreground/60 hover:text-foreground"}`}>Todos</button>
      {categories.map((c) => <button key={c.id} onClick={() => onSelect(c.slug)} className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${selected === c.slug ? "bg-accent text-foreground" : "border border-line text-foreground/60 hover:text-foreground"}`}>{c.name}</button>)}
    </div>
  );
}
```

- [ ] **Step 4: Create produtos page**

```typescript
// src/routes/produtos.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CategoryFilter } from "@/components/products/CategoryFilter";

export const Route = createFileRoute("/produtos")({
  head: () => ({ meta: [{ title: "Produtos — Brayan Beef" }, { name: "description", content: "Conheça nossa seleção de carnes premium." }] }),
  component: ProdutosPage,
});

function ProdutosPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["products"], queryFn: async () => { const r = await fetch("/api/github/read?path=products"); return r.json(); } });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["categories"], queryFn: async () => { const r = await fetch("/api/github/read?path=categories"); return r.json(); } });
  const filtered = selectedCategory ? products.filter((p) => p.category === selectedCategory) : products;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-foreground/50">— Nossos Produtos</p>
            <h1 className="font-display text-5xl leading-[0.95] md:text-7xl">Seleção <span className="text-accent">premium</span></h1>
            <p className="mt-6 max-w-lg text-sm text-foreground/60">Cada corte é selecionado com rigor e maturação ideal.</p>
          </motion.div>
          <div className="mt-12"><CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} /></div>
          <div className="mt-12"><ProductGrid products={filtered} /></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 5: Create product detail page**

```typescript
// src/routes/produtos.$slug.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import type { Product } from "@/types/product";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/hooks/useCart";

export const Route = createFileRoute("/produtos/$slug")({
  head: ({ params }) => ({ meta: [{ title: `${params.slug} — Brayan Beef` }] }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading } = useQuery<Product>({ queryKey: ["product", slug], queryFn: async () => { const r = await fetch(`/api/github/read?path=products/${slug}`); return r.json(); } });

  if (isLoading) return <div className="min-h-screen bg-background"><Header /><div className="flex items-center justify-center pt-32"><div className="h-8 w-8 animate-spin border-2 border-accent border-t-transparent" /></div></div>;
  if (!product) return <div className="min-h-screen bg-background"><Header /><div className="flex flex-col items-center justify-center pt-32"><h1 className="font-display text-4xl">Produto não encontrado</h1><Link to="/produtos" className="mt-6 text-sm text-foreground/60 hover:text-accent">← Voltar</Link></div><Footer /></div>;

  const finalPrice = product.promotion ? product.price * (1 - product.promotion.discount / 100) : product.price;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <Link to="/produtos" className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-foreground/50 hover:text-foreground"><ArrowLeft size={14} />Voltar</Link>
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="aspect-[4/5] overflow-hidden bg-surface">
                {product.images[0] && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex flex-col">
              <div className="mb-6 flex flex-wrap gap-2">{product.meta.map((tag) => <span key={tag} className="border border-line px-3 py-1 text-[10px] uppercase tracking-wider text-foreground/50">{tag}</span>)}</div>
              <h1 className="font-display text-4xl md:text-5xl">{product.name}</h1>
              <p className="mt-4 text-sm text-foreground/60">{product.weight} / {product.unit}</p>
              <div className="mt-6">
                {product.promotion && <span className="text-sm text-foreground/40 line-through">R$ {product.price.toFixed(2)}</span>}
                <p className="font-display text-3xl text-accent">R$ {finalPrice.toFixed(2)}</p>
              </div>
              <p className="mt-8 text-sm leading-relaxed text-foreground/70">{product.description}</p>
              <div className="mt-8">
                <p className="mb-3 text-xs uppercase tracking-wider text-foreground/50">Quantidade</p>
                <div className="flex items-center gap-4">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-10 w-10 items-center justify-center border border-line hover:bg-surface"><Minus size={16} /></button>
                  <span className="w-12 text-center font-display text-xl">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="flex h-10 w-10 items-center justify-center border border-line hover:bg-surface"><Plus size={16} /></button>
                </div>
              </div>
              <button onClick={() => addItem(product, quantity)} className="mt-8 flex items-center justify-center gap-3 border border-accent bg-accent/10 py-4 text-sm uppercase tracking-wider text-accent hover:bg-accent hover:text-foreground">
                <ShoppingCart size={18} />Adicionar ao carrinho
              </button>
              <div className="mt-6 flex items-center justify-between border-t border-line pt-6">
                <span className="text-sm text-foreground/50">Subtotal</span>
                <span className="font-display text-xl">R$ {(finalPrice * quantity).toFixed(2)}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/products/ src/routes/produtos.tsx src/routes/produtos.\$slug.tsx
git commit -m "feat: add product catalog and detail pages"
```

---

## Task 9: About and Contact Pages

**Covers:** [S4]

**Files:**
- Create: `src/routes/sobre.tsx`
- Create: `src/routes/contato.tsx`

**Interfaces:**
- Consumes: Layout components
- Produces: About and Contact pages

- [ ] **Step 1: Create sobre page**

```typescript
// src/routes/sobre.tsx
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/sobre")({
  head: () => ({ meta: [{ title: "Sobre — Brayan Beef" }, { name: "description", content: "Conheça a história da Brayan Beef." }] }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-foreground/50">— Nossa História</p>
            <h1 className="font-display text-5xl leading-[0.95] md:text-7xl">Feito com <span className="text-accent">paixão</span></h1>
          </motion.div>
          <div className="mt-24 grid gap-16 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <h2 className="font-display text-3xl">A origem</h2>
              <p className="mt-6 text-sm leading-relaxed text-foreground/70">A Brayan Beef nasceu do amor pela carne de qualidade. Começamos em Porto Fictício�, no coração do Estado Fictício, com um sonho simples: oferecer os melhores cortes para quem entende de churrasco.</p>
              <p className="mt-4 text-sm leading-relaxed text-foreground/70">Cada corte é selecionado com rigor, maturado na medida certa e entregue com a qualidade que nossos clientes merecem.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="aspect-[4/3] overflow-hidden bg-surface">
              <img src="/img/sobre.jpg" alt="Brayan Beef" className="h-full w-full object-cover" />
            </motion.div>
          </div>
          <div className="mt-32 grid gap-16 md:grid-cols-3">
            {[{ title: "Qualidade", desc: "Selecionamos apenas carnes Angus e Hereford de frigoríficos certificados." }, { title: "Maturação", desc: "Cada corte passa pelo processo de maturação ideal para garantir sabor e maciez." }, { title: "Compromisso", desc: "Do frigorífico à sua mesa, mantemos a cadeia do frio e a qualidade em cada etapa." }].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.15 }} className="relative pt-8">
                <span className="absolute left-0 top-0 block h-px w-full bg-line" />
                <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-foreground/50">/ 0{i + 1}</p>
                <h3 className="font-display text-2xl">{item.title}</h3>
                <p className="mt-4 text-sm text-foreground/60">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Create contato page**

```typescript
// src/routes/contato.tsx
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { MapPin, Phone, Clock, MessageCircle, Send } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/contato")({
  head: () => ({ meta: [{ title: "Contato — Brayan Beef" }, { name: "description", content: "Entre em contato com a Brayan Beef." }] }),
  component: ContatoPage,
});

function ContatoPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const whatsappMessage = encodeURIComponent(`Olá! Meu nome é ${name}.\n\n${message}`);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-foreground/50">— Fale Conosco</p>
            <h1 className="font-display text-5xl leading-[0.95] md:text-7xl">Contato</h1>
          </motion.div>
          <div className="mt-24 grid gap-16 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <h2 className="font-display text-2xl">Envie uma mensagem</h2>
              <form onSubmit={(e) => { e.preventDefault(); window.open(`https://wa.me/5500090000009?text=${whatsappMessage}`, "_blank"); }} className="mt-8 space-y-6">
                <div>
                  <label htmlFor="name" className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">Nome</label>
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-line bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none" placeholder="Seu nome" />
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">Mensagem</label>
                  <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="w-full resize-none border border-line bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none" placeholder="Como podemos ajudar?" />
                </div>
                <button type="submit" className="flex items-center gap-3 border border-accent bg-accent/10 px-8 py-3 text-sm uppercase tracking-wider text-accent hover:bg-accent hover:text-foreground"><Send size={16} />Enviar via WhatsApp</button>
              </form>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="space-y-12">
              <div>
                <h2 className="font-display text-2xl">Informações</h2>
                <div className="mt-8 space-y-6">
                  <div className="flex items-start gap-4"><MapPin size={20} className="mt-0.5 text-accent" /><div><p className="text-sm font-medium text-foreground">Endereço</p><p className="mt-1 text-sm text-foreground/60">Av. Fictícia, 333<br />Centro — Porto Fictício�, MS<br />CEP: 00000-000</p></div></div>
                  <div className="flex items-start gap-4"><Phone size={20} className="mt-0.5 text-accent" /><div><p className="text-sm font-medium text-foreground">Telefone</p><p className="mt-1 text-sm text-foreground/60">(00) 90000-0009</p></div></div>
                  <div className="flex items-start gap-4"><Clock size={20} className="mt-0.5 text-accent" /><div><p className="text-sm font-medium text-foreground">Horário</p><p className="mt-1 text-sm text-foreground/60">Seg a Sáb: 8h — 18h<br />Domingo: 8h — 13h</p></div></div>
                </div>
              </div>
              <a href="https://wa.me/5500090000009" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 border border-accent bg-accent/10 py-4 text-sm uppercase tracking-wider text-accent hover:bg-accent hover:text-foreground"><MessageCircle size={18} />Falar no WhatsApp</a>
              <div className="aspect-video overflow-hidden border border-line">
                <iframe src="https://www.google.com/maps/embed?pb=..." width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Localização Brayan Beef" />
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/sobre.tsx src/routes/contato.tsx
git commit -m "feat: add about and contact pages"
```

---

## Task 10: Admin Dashboard

**Covers:** [S5]

**Files:**
- Create: `src/components/admin/AdminLayout.tsx`
- Create: `src/routes/admin/_admin.tsx`
- Create: `src/routes/admin/admin.login.tsx`
- Create: `src/routes/admin/admin.index.tsx`
- Create: `src/routes/admin/admin.produtos.tsx`
- Create: `src/routes/admin/admin.configuracoes.tsx`

**Interfaces:**
- Consumes: useAuth, useCart hooks, Product/Category/Settings types
- Produces: Complete admin dashboard

- [ ] **Step 1: Create AdminLayout**

```typescript
// src/components/admin/AdminLayout.tsx
import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutDashboard, Package, Tags, ShoppingCart, Settings, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-background/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-surface transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-line px-6">
          <Link to="/admin" className="font-display text-sm">BRAYAN <span className="text-accent">BEEF</span></Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-foreground/60"><X size={20} /></button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const isActive = item.href === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.href);
            return <Link key={item.href} to={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isActive ? "bg-accent/10 text-accent" : "text-foreground/60 hover:text-foreground hover:bg-surface-2"}`}><item.icon size={18} />{item.label}</Link>;
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-line p-4">
          <button onClick={() => logout()} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground/60 hover:text-accent"><LogOut size={18} />Sair</button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-line px-6 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground/60"><Menu size={24} /></button>
          <Link to="/admin" className="font-display text-sm">BRAYAN <span className="text-accent">BEEF</span></Link>
        </header>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create admin layout route**

```typescript
// src/routes/admin/_admin.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/_admin")({ component: () => <AdminLayout><Outlet /></AdminLayout> });
```

- [ ] **Step 3: Create login page**

```typescript
// src/routes/admin/admin.login.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Login — Admin Brayan Beef" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn, loginError } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl">BRAYAN <span className="text-accent">BEEF</span></h1>
          <p className="mt-2 text-sm text-foreground/50">Acesso administrativo</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); login({ username, password }, { onSuccess: () => navigate({ to: "/admin" }) }); }} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">Usuário</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full border border-line bg-transparent py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none" placeholder="admin" />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-line bg-transparent py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none" placeholder="••••••••" />
            </div>
          </div>
          {loginError && <p className="text-sm text-accent">Credenciais inválidas.</p>}
          <button type="submit" disabled={isLoggingIn} className="w-full border border-accent bg-accent/10 py-3 text-sm uppercase tracking-wider text-accent hover:bg-accent hover:text-foreground disabled:opacity-50">
            {isLoggingIn ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 4: Create dashboard page**

```typescript
// src/routes/admin/admin.index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Package, ShoppingCart, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Dashboard — Admin Brayan Beef" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: products = [] } = useQuery({ queryKey: ["admin-products"], queryFn: async () => { const r = await fetch("/api/github/read?path=products"); return r.json(); } });
  const { data: orders = [] } = useQuery({ queryKey: ["admin-orders"], queryFn: async () => { const r = await fetch("/api/github/read?path=orders"); return r.json(); } });

  const stats = [
    { label: "Produtos", value: products.length, icon: Package },
    { label: "Pedidos", value: orders.length, icon: ShoppingCart },
    { label: "Receita", value: `R$ ${orders.reduce((s: number, o: { total: number }) => s + o.total, 0).toFixed(2)}`, icon: TrendingUp },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="mt-2 text-sm text-foreground/50">Visão geral do seu negócio</p>
      </motion.div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="border border-line bg-surface p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-foreground/50">{stat.label}</span>
              <stat.icon size={18} className="text-foreground/30" />
            </div>
            <p className="mt-4 font-display text-2xl">{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create products management page**

```typescript
// src/routes/admin/admin.produtos.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import type { Product } from "@/types/product";

export const Route = createFileRoute("/admin/produtos")({
  head: () => ({ meta: [{ title: "Produtos — Admin Brayan Beef" }] }),
  component: ProdutosAdminPage,
});

function ProdutosAdminPage() {
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: async () => { const r = await fetch("/api/github/read?path=products"); return r.json(); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch("/api/github/write", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: `products/${id}`, data: null, message: `Delete product ${id}` }) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin border-2 border-accent border-t-transparent" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Produtos</h1>
          <p className="mt-2 text-sm text-foreground/50">{products.length} produtos cadastrados</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 text-sm text-accent hover:bg-accent hover:text-foreground">
          <Plus size={16} />Novo Produto
        </button>
      </div>

      <div className="mt-8 overflow-x-auto border border-line">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-foreground/50">Nome</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-foreground/50">Preço</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-foreground/50">Categoria</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-foreground/50">Status</th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-foreground/50">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 text-sm">{product.name}</td>
                <td className="px-4 py-3 text-sm">R$ {product.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-foreground/60">{product.category}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={product.available ? "text-green-500" : "text-red-500"}>{product.available ? "Ativo" : "Inativo"}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setEditingProduct(product)} className="p-2 text-foreground/40 hover:text-foreground"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm("Excluir este produto?")) deleteMutation.mutate(product.id); }} className="p-2 text-foreground/40 hover:text-accent"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product form modal would go here */}
    </div>
  );
}
```

- [ ] **Step 6: Create settings page**

```typescript
// src/routes/admin/admin.configuracoes.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import type { BusinessSettings } from "@/types/settings";

export const Route = createFileRoute("/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Admin Brayan Beef" }] }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  const { data, isLoading } = useQuery<BusinessSettings>({
    queryKey: ["admin-settings"],
    queryFn: async () => { const r = await fetch("/api/github/read?path=settings/business"); return r.json(); },
  });

  useEffect(() => { if (data) setSettings(data); }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (data: BusinessSettings) => {
      await fetch("/api/github/write", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "settings/business", data, message: "Update business settings" }) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-settings"] }),
  });

  if (isLoading || !settings) return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin border-2 border-accent border-t-transparent" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Configurações</h1>
          <p className="mt-2 text-sm text-foreground/50">Dados do negócio</p>
        </div>
        <button onClick={() => saveMutation.mutate(settings)} disabled={saveMutation.isPending} className="flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 text-sm text-accent hover:bg-accent hover:text-foreground disabled:opacity-50">
          <Save size={16} />{saveMutation.isPending ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <div className="mt-8 space-y-8">
        <div className="border border-line p-6">
          <h2 className="font-display text-lg mb-4">Dados gerais</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">Nome</label>
              <input value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">Telefone</label>
              <input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">WhatsApp</label>
              <input value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="border border-line p-6">
          <h2 className="font-display text-lg mb-4">Endereço</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">Rua</label>
              <input value={settings.address.street} onChange={(e) => setSettings({ ...settings, address: { ...settings.address, street: e.target.value } })} className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">Número</label>
              <input value={settings.address.number} onChange={(e) => setSettings({ ...settings, address: { ...settings.address, number: e.target.value } })} className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">Bairro</label>
              <input value={settings.address.neighborhood} onChange={(e) => setSettings({ ...settings, address: { ...settings.address, neighborhood: e.target.value } })} className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">Cidade</label>
              <input value={settings.address.city} onChange={(e) => setSettings({ ...settings, address: { ...settings.address, city: e.target.value } })} className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/ src/routes/admin/
git commit -m "feat: add admin dashboard with login, products, and settings management"
```

---

## Task 11: Update Root Route

**Covers:** [S4]

**Files:**
- Modify: `src/routes/__root.tsx`

**Interfaces:**
- Consumes: CartProvider from Task 7
- Produces: Updated root with cart support

- [ ] **Step 1: Add CartProvider to root**

Update `__root.tsx` to wrap with CartProvider:

```typescript
import { CartProvider } from "@/components/cart/CartProvider";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Outlet />
      </CartProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/__root.tsx
git commit -m "feat: add CartProvider to root layout"
```

---

## Execution

This plan contains 11 tasks covering:
- **Task 1-2:** Data layer (types + GitHub API)
- **Task 3-5:** Authentication system
- **Task 6-7:** Layout and cart components
- **Task 8-9:** Public pages (catalog, detail, about, contact)
- **Task 10:** Admin dashboard
- **Task 11:** Root route update

**Recommended execution order:** Tasks 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11

Each task is independent and can be tested separately after completion.
