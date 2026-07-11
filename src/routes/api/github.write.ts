import { createFileRoute } from "@tanstack/react-router";
import { writeJSON } from "@/lib/github";
import { verifyToken } from "@/lib/auth";

export const Route = createFileRoute("/api/github/write")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cookie = request.headers
          .get("cookie")
          ?.match(/auth-token=([^;]+)/)?.[1];

        if (!cookie || !(await verifyToken(cookie))) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const { path, data, message } = await request.json();
          await writeJSON(path, data, message || `Update ${path}`);

          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response(
            JSON.stringify({ error: "Failed to write" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});
