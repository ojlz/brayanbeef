# Brayan Beef — Production Website Design Spec

## [S1] Problem

Transform the existing landing page into a complete production-ready website with:
- Public pages (catalog, product details, about, contact)
- Admin dashboard (mobile-first)
- GitHub-based CMS (JSON files in repository)
- WhatsApp ordering flow
- SEO and Local SEO optimization

## [S2] Architecture Overview

### Data Layer (GitHub-based CMS)

Business data is stored as versioned JSON files in the repository:

```
/data
  /products/           # Product JSON files
  /categories/         # Category JSON files
  /settings/           # Business settings, SEO, hours
  /promotions/         # Promotional content
```

**Admin writes via GitHub REST API** → commits JSON changes → Vercel auto-deploys.
**Public reads from repository** (or GitHub API with caching).

### Authentication

- Custom username/password (env vars)
- JWT in HttpOnly Secure Cookie
- Middleware protects `/admin/*` routes
- Rate limiting: 5 attempts/minute
- Session expiration: 24 hours
- CSRF protection on forms
- Single administrator account

## [S3] Data Structures

### Product

```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "price": number,
  "unit": "kg" | "un",
  "weight": "string",
  "category": "string",
  "images": ["string"],
  "featured": boolean,
  "promotion": {
    "discount": number,
    "label": "string"
  } | null,
  "available": boolean,
  "meta": ["string"]
}
```

### Category

```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "order": number
}
```

### Business Settings

```json
{
  "name": "string",
  "phone": "string",
  "whatsapp": "string",
  "address": {
    "street": "string",
    "number": "string",
    "neighborhood": "string",
    "city": "string",
    "state": "string",
    "zip": "string"
  },
  "coordinates": {
    "lat": number,
    "lng": number
  },
  "hours": {
    "monday": { "open": "string", "close": "string" },
    ...
  },
  "social": {
    "instagram": "string",
    "facebook": "string"
  }
}
```

### Order (for tracking)

```json
{
  "id": "string",
  "items": [{ "productId": "string", "quantity": number, "price": number }],
  "total": number,
  "customer": { "name": "string", "phone": "string" },
  "status": "pending" | "confirmed" | "delivered" | "cancelled",
  "createdAt": "string",
  "notes": "string"
}
```

## [S4] Public Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page (existing, preserve as-is) |
| `/produtos` | Product catalog with category filters |
| `/produtos/[slug]` | Product detail + "Comprar" button |
| `/sobre` | Brand story, values, team |
| `/contato` | Form + WhatsApp + Google Maps |

## [S5] Admin Dashboard (`/admin`)

| Route | Description |
|-------|-------------|
| `/admin/login` | Username/password login |
| `/admin` | Dashboard overview (stats, recent orders) |
| `/admin/produtos` | Product CRUD (list, create, edit, delete) |
| `/admin/categorias` | Category CRUD |
| `/admin/pedidos` | Order viewing and status updates |
| `/admin/promocoes` | Promotion management |
| `/admin/configuracoes` | Business info, hours, SEO settings |

**Mobile-first design** with responsive desktop support.

## [S6] WhatsApp Ordering Flow

1. Customer adds product to cart
2. Cart stored in `localStorage`
3. Customer clicks "Comprar pelo WhatsApp"
4. Site formats message with:
   - Product list with quantities
   - Total estimated price
   - Customer notes (optional)
5. Redirects to `wa.me/{number}?text={encoded_message}`

**Message format:**
```
🥩 *Pedido Brayan Beef*

• 2x Picanha Angus (1kg) — R$ 179,80
• 1x Costela Especial (1kg) — R$ 69,90

📊 Total: R$ 249,70

📝 Observações: [notes]

---
Via brayanbeef.com.br
```

## [S7] Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (configured) |
| Routing | TanStack Router (file-based) |
| Data Fetching | TanStack Query |
| Styling | Tailwind CSS v4 (configured) |
| Animations | Framer Motion (in use) |
| Validation | Zod + React Hook Form |
| Auth | Custom JWT + bcrypt |
| CMS | GitHub REST API |
| Deploy | Vercel |

## [S8] Implementation Phases

### Phase 1 — Infrastructure
- Data directory structure
- GitHub API utilities (read/write)
- Authentication system (JWT, middleware)
- Protected API routes

### Phase 2 — Public Pages
- Product catalog page
- Product detail page
- About page
- Contact page
- Shopping cart implementation

### Phase 3 — Admin Dashboard
- Login page
- Dashboard overview
- Products management
- Categories management
- Settings management

### Phase 4 — Finalization
- Complete SEO (Open Graph, Twitter Cards, JSON-LD)
- Local SEO (LocalBusiness schema, Google Maps)
- Accessibility (ARIA, keyboard nav, focus states)
- Performance optimization
- Testing

## [S9] Visual Identity

All new pages MUST preserve the existing landing page identity:
- Background: `oklch(0.08 0 0)` (#090909)
- Foreground: `oklch(0.94 0 0)` (#ECECEC)
- Accent: `oklch(0.36 0.14 27)` (#8B0000 blood red)
- Fonts: Geist (display), Inter (sans)
- Grain overlay texture
- Cinematic scroll animations
- Same spacing, borders, shadows, transitions

## [S10] Success Criteria

- [ ] All public pages match landing page visual quality
- [ ] Admin dashboard works on mobile and desktop
- [ ] GitHub CMS workflow functional (edit → commit → deploy)
- [ ] WhatsApp ordering flow works end-to-end
- [ ] SEO complete (meta, OG, Twitter, JSON-LD)
- [ ] Local SEO implemented (LocalBusiness, coordinates)
- [ ] Accessibility passes WCAG 2.1 AA
- [ ] Performance: Lighthouse > 90
