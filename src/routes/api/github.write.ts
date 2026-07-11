import { createFileRoute } from "@tanstack/react-router";
import { writeJSON } from "@/lib/github";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const WriteSchema = z.object({
  path: z.string().min(1).max(200).regex(/^[a-zA-Z0-9_\-\/]+$/, "Invalid path"),
  data: z.unknown(),
  message: z.string().max(200).optional(),
});

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
          const body = await request.json();
          const parsed = WriteSchema.safeParse(body);

          if (!parsed.success) {
            return new Response(
              JSON.stringify({ error: "Dados inválidos", details: parsed.error.flatten() }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const { path, data, message } = parsed.data;
          await writeJSON(path, data, message || `Update ${path}`);

          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response(
            JSON.stringify({ error: "Failed to write" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
