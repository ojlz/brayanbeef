import { createFileRoute } from "@tanstack/react-router";
import { readJSON, listFiles } from "@/lib/github";
import { verifyToken } from "@/lib/auth";

// Paths that require authentication to read
const AUTH_REQUIRED_PATHS = ["settings"];

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

        // Validate path format
        if (path.includes("..") || !/^[a-zA-Z0-9_\-\/]+$/.test(path)) {
          return new Response(JSON.stringify({ error: "Invalid path" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Check if path requires authentication
        const requiresAuth = AUTH_REQUIRED_PATHS.some(
          (prefix) => path === prefix || path.startsWith(prefix + "/")
        );

        if (requiresAuth) {
          const cookie = request.headers
            .get("cookie")
            ?.match(/auth-token=([^;]+)/)?.[1];

          if (!cookie || !(await verifyToken(cookie))) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }
        }

        try {
          if (path.includes("/")) {
            const data = await readJSON(path);
            return new Response(JSON.stringify(data), {
              headers: { "Content-Type": "application/json" },
            });
          }

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
