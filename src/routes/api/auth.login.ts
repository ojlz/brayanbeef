import { createFileRoute } from "@tanstack/react-router";
import { login, setSessionCookie, checkRateLimit } from "@/lib/auth";
import { z } from "zod";

const LoginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Rate limit: 5 attempts per minute per IP
          const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
          if (!checkRateLimit(`login:${ip}`, 5, 60000)) {
            return new Response(
              JSON.stringify({ error: "Muitas tentativas. Tente novamente em 1 minuto." }),
              { status: 429, headers: { "Content-Type": "application/json" } }
            );
          }

          const body = await request.json();
          const parsed = LoginSchema.safeParse(body);

          if (!parsed.success) {
            return new Response(
              JSON.stringify({ error: "Dados inválidos" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const { username, password } = parsed.data;
          const token = await login(username, password);

          if (!token) {
            return new Response(
              JSON.stringify({ error: "Credenciais inválidas" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": setSessionCookie(token),
            },
          });
        } catch {
          return new Response(
            JSON.stringify({ error: "Erro interno" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
