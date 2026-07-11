export interface Analytics {
  whatsappClicks: number;
  productClicks: Record<string, number>;
  productViews: Record<string, number>;
  pageViews: number;
}

const DEFAULT: Analytics = {
  whatsappClicks: 0,
  productClicks: {},
  productViews: {},
  pageViews: 0,
};

export type TrackEvent =
  | "whatsapp"
  | "product_whatsapp"
  | "product_view"
  | "page_view";

/**
 * Best-effort client-side analytics. Reads the current snapshot, increments
 * the relevant counter and writes it back via the same GitHub data layer used
 * for products/settings. Failures are silently ignored so tracking never
 * breaks the UI.
 */
export async function trackEvent(
  event: TrackEvent,
  productId?: string
): Promise<void> {
  try {
    const res = await fetch("/api/github/read?path=analytics");
    const current: Analytics = res.ok ? await res.json() : { ...DEFAULT };

    const next: Analytics = {
      whatsappClicks: current.whatsappClicks ?? 0,
      productClicks: { ...(current.productClicks || {}) },
      productViews: { ...(current.productViews || {}) },
      pageViews: current.pageViews ?? 0,
    };

    if (event === "whatsapp") next.whatsappClicks += 1;
    if (event === "page_view") next.pageViews += 1;
    if (event === "product_whatsapp" && productId) {
      next.productClicks[productId] = (next.productClicks[productId] || 0) + 1;
    }
    if (event === "product_view" && productId) {
      next.productViews[productId] = (next.productViews[productId] || 0) + 1;
    }

    await fetch("/api/github/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "analytics",
        data: next,
        message: `Track analytics: ${event}`,
      }),
    });
  } catch {
    // Ignore — analytics must never break the experience
  }
}
