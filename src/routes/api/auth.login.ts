import { createFileRoute } from "@tanstack/react-router";
import { login, setSessionCookie } from "@/lib/auth";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { username, password } = await request.json();
          const token = await login(username, password);

          if (!token) {
            return new Response(
              JSON.stringify({ error: "Invalid credentials" }),
              {
                status: 401,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": setSessionCookie(token),
            },
          });
        } catch (e) {
          console.error("LOGIN ERROR:", e);
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
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
