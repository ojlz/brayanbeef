export function trackEvent(name: string, label?: string) {
  if (typeof window === "undefined") return;

  try {
    const body: Record<string, string> = { event: name };
    if (label) body.label = label;
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    /* offline */
  }
}
