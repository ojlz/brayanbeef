import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/debug")({
  server: {
    handlers: {
      GET: async () => {
        const token = process.env.GITHUB_TOKEN;
        const repo = process.env.GITHUB_REPO;
        const branch = process.env.GITHUB_BRANCH;
        const jwt = process.env.JWT_SECRET;

        const info = {
          hasToken: !!token,
          tokenPrefix: token ? token.substring(0, 8) + "..." : "missing",
          repo: repo || "missing",
          branch: branch || "missing (default: main)",
          hasJwt: !!jwt,
          jwtPrefix: jwt ? jwt.substring(0, 8) + "..." : "missing",
        };

        // Test GitHub API
        if (token && repo) {
          try {
            const url = `https://api.github.com/repos/${repo}/contents/data?ref=${branch || "main"}`;
            const res = await fetch(url, {
              headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" },
            });
            info.githubApiStatus = res.status;
            info.githubApiOk = res.ok;
            if (!res.ok) {
              const body = await res.text();
              info.githubApiError = body.substring(0, 200);
            }
          } catch (e: any) {
            info.githubApiError = e?.message;
          }
        }

        return new Response(JSON.stringify(info, null, 2), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
