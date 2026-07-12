import { createFileRoute } from "@tanstack/react-router";
import { readJSON, writeJSON } from "@/lib/github";

export const Route = createFileRoute("/api/analytics")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const data = await readJSON("analytics");
          return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ whatsappClicks: 0, productClicks: {}, productViews: {}, pageViews: 0 }), {
            headers: { "Content-Type": "application/json" },
          });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          await writeJSON("analytics", body, "Update analytics");
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e: any) {
          console.error("analytics write error:", e?.message);
          return new Response(JSON.stringify({ error: "Failed to track" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
