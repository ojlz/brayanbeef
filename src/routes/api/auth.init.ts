import { createFileRoute } from "@tanstack/react-router";
import { getAdminCredentials, saveAdminCredentials } from "@/lib/auth";

export const Route = createFileRoute("/api/auth/init")({
  server: {
    handlers: {
      GET: async () => {
        const credentials = await getAdminCredentials();
        return new Response(
          JSON.stringify({ initialized: !!credentials }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      },
      POST: async ({ request }) => {
        try {
          const existing = await getAdminCredentials();
          if (existing) {
            return new Response(
              JSON.stringify({ error: "Admin já configurado" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const { username, password } = await request.json();

          if (!username || !password) {
            return new Response(
              JSON.stringify({ error: "Usuário e senha são obrigatórios" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          if (password.length < 6) {
            return new Response(
              JSON.stringify({ error: "Senha deve ter pelo menos 6 caracteres" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          await saveAdminCredentials(username, password);

          return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        } catch (e) {
          console.error("INIT ERROR:", e);
          return new Response(
            JSON.stringify({ error: "Erro ao inicializar" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
