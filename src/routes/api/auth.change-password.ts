import { createFileRoute } from "@tanstack/react-router";
import { verifyToken, changePassword } from "@/lib/auth";

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

          const { currentPassword, newPassword } = await request.json();

          if (!currentPassword || !newPassword) {
            return new Response(
              JSON.stringify({ error: "Preencha todos os campos" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          if (newPassword.length < 6) {
            return new Response(
              JSON.stringify({ error: "Nova senha deve ter pelo menos 6 caracteres" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

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
        } catch (e) {
          console.error("CHANGE PASSWORD ERROR:", e);
          return new Response(
            JSON.stringify({ error: "Erro interno" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
