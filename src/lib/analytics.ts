export interface AnalyticsEvent {
  event: string;
  label?: string;
  timestamp: number;
}

export interface DailyStats {
  date: string;
  visits: number;
  pageViews: number;
  events: Record<string, number>;
}

export interface AnalyticsData {
  days: DailyStats[];
}

export function trackEvent(name: string, label?: string) {
  if (typeof window === "undefined") return;

  try {
    const body: Record<string, string> = { event: name };
    if (label) body.label = label;
    navigator.sendBeacon("/api/analytics", new Blob([JSON.stringify(body)], { type: "application/json" }));
  } catch {
    /* offline */
  }
}
