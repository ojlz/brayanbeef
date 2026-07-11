import { createFileRoute } from "@tanstack/react-router";
import { verifyToken } from "@/lib/auth";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cookie = request.headers
          .get("cookie")
          ?.match(/auth-token=([^;]+)/)?.[1];

        if (!cookie) {
          return new Response(
            JSON.stringify({ error: "Not authenticated" }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const payload = await verifyToken(cookie);

        if (!payload) {
          return new Response(JSON.stringify({ error: "Invalid token" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ username: payload.username }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      },
    },
  },
});
