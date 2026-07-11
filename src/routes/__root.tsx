import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  redirect,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { WhatsAppButton } from "../components/layout/WhatsAppButton";
import { localBusinessJsonLd, websiteJsonLd } from "../lib/seo";

const SITE_URL = "https://brayanbeef.vercel.app";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ location }) => {
    // Protect admin routes (except login)
    if (
      location.pathname.startsWith("/admin") &&
      location.pathname !== "/admin/login"
    ) {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw redirect({ to: "/admin/login" });
      } catch {
        throw redirect({ to: "/admin/login" });
      }
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Brayan Beef ‚Äî Carnes Premium em Porto Fict√≠cio≠, MS" },
      {
        name: "description",
        content:
          "Brayan Beef ‚Äî Carnes Angus premium em Porto Fict√≠cio≠, MS. Picanha, costela, ancho e fraldinha de alta qualidade. A√ßougue artesanal com entrega pelo WhatsApp.",
      },
      { property: "og:title", content: "Brayan Beef ‚Äî Carnes Premium em Porto Fict√≠cio≠, MS" },
      {
        property: "og:description",
        content: "Carnes Angus premium em Porto Fict√≠cio≠, MS. Picanha, costela, ancho e fraldinha selecionados.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:site_name", content: "Brayan Beef" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: `${SITE_URL}/img/picanha.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Brayan Beef ‚Äî Carnes Premium em Porto Fict√≠cio≠, MS" },
      { name: "twitter:description", content: "Carnes Angus premium em Porto Fict√≠cio≠, MS. Picanha, costela, ancho e fraldinha selecionados." },
      { name: "twitter:image", content: `${SITE_URL}/img/picanha.jpg` },
      { name: "theme-color", content: "#8B0000" },
      { name: "robots", content: "index, follow" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify(websiteJsonLd()),
      },
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify(localBusinessJsonLd()),
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <WhatsAppButton />
    </QueryClientProvider>
  );
}
