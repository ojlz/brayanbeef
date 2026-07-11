import { createFileRoute } from "@tanstack/react-router";
import { verifyToken, changePassword } from "@/lib/auth";
import { z } from "zod";

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

export const Route = createFileRoute("/api/auth/change-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const cookie = request.headers
            .get("cookie")
            ?.match(/auth-token=([^;]+)/)?.[1];

          if (!cookie) {
            return new Response(
              JSON.stringify({ error: "Não autenticado" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }

          const payload = await verifyToken(cookie);
          if (!payload) {
            return new Response(
              JSON.stringify({ error: "Token inválido" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }

          const body = await request.json();
          const parsed = ChangePasswordSchema.safeParse(body);

          if (!parsed.success) {
            return new Response(
              JSON.stringify({ error: "Dados inválidos", details: parsed.error.flatten() }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const { currentPassword, newPassword } = parsed.data;
          const result = await changePassword(currentPassword, newPassword);

          if (!result.success) {
            return new Response(
              JSON.stringify({ error: result.error }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
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
