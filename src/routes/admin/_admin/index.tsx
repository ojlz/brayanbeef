import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_admin/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard" });
  },
});
