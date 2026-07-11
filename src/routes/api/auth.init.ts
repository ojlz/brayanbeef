import { createFileRoute } from "@tanstack/react-router";
import { getAdminCredentials, saveAdminCredentials, validatePasswordStrength } from "@/lib/auth";
import { z } from "zod";

const InitSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "Apenas letras, números e underscore"),
  password: z.string().min(8).max(200),
});

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

          const body = await request.json();
          const parsed = InitSchema.safeParse(body);

          if (!parsed.success) {
            return new Response(
              JSON.stringify({ error: "Dados inválidos", details: parsed.error.flatten() }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const { username, password } = parsed.data;

          const strengthError = validatePasswordStrength(password);
          if (strengthError) {
            return new Response(
              JSON.stringify({ error: strengthError }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          await saveAdminCredentials(username, password);

          return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        } catch {
          return new Response(
            JSON.stringify({ error: "Erro ao inicializar" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
