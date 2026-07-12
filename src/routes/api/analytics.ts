import { createFileRoute } from "@tanstack/react-router";
import { readJSON, writeJSON } from "@/lib/github";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

interface AnalyticsData {
  days: Array<{
    date: string;
    visits: number;
    pageViews: number;
    events: Record<string, number>;
  }>;
}

export const Route = createFileRoute("/api/analytics")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const data = await readJSON<AnalyticsData>("analytics");
          const today = getToday();
          const todayStats = data.days?.find((d: any) => d.date === today);
          return new Response(JSON.stringify({
            today: todayStats || { date: today, visits: 0, pageViews: 0, events: {} },
            history: data.days || [],
          }), { headers: { "Content-Type": "application/json" } });
        } catch {
          const today = getToday();
          return new Response(JSON.stringify({
            today: { date: today, visits: 0, pageViews: 0, events: {} },
            history: [],
          }), { headers: { "Content-Type": "application/json" } });
        }
      },
      POST: async ({ request }) => {
        try {
          const { event, label } = await request.json();
          if (!event) {
            return new Response(JSON.stringify({ error: "event required" }), { status: 400 });
          }

          let data: AnalyticsData;
          try {
            data = await readJSON<AnalyticsData>("analytics");
          } catch {
            data = { days: [] };
          }

          const today = getToday();
          let day = data.days.find((d: any) => d.date === today);

          if (!day) {
            day = { date: today, visits: 0, pageViews: 0, events: {} };
            data.days.push(day);
          }

          if (event === "session") {
            day.visits++;
          } else if (event === "pageview") {
            day.pageViews++;
          } else {
            const key = label ? `${event}:${label}` : event;
            day.events[key] = (day.events[key] || 0) + 1;
          }

          await writeJSON("analytics", data, "Track analytics");
          return new Response(JSON.stringify({ success: true }));
        } catch (e: any) {
          console.error("analytics error:", e?.message);
          return new Response(JSON.stringify({ error: "Failed to track" }), { status: 500 });
        }
      },
    },
  },
});
