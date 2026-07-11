import { createFileRoute } from "@tanstack/react-router";
import { readJSON, listFiles } from "@/lib/github";

export const Route = createFileRoute("/api/github/read")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const path = url.searchParams.get("path");

        if (!path) {
          return new Response(JSON.stringify({ error: "Missing path" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          // If path has slash, it's a specific file (e.g. "products/picanha")
          if (path.includes("/")) {
            const data = await readJSON(path);
            return new Response(JSON.stringify(data), {
              headers: { "Content-Type": "application/json" },
            });
          }

          // Otherwise, list all items in the directory (e.g. "products")
          const files = await listFiles(path);
          const items = await Promise.all(
            files.map((f) => readJSON(`${path}/${f}`))
          );
          return new Response(JSON.stringify(items), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
