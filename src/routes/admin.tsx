import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import AdminPanel from "@/pages/AdminPanel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — MHEWS" },
      { name: "description", content: "Manage agencies, users, thresholds and dissemination channels." },
      { property: "og:title", content: "Admin Panel — MHEWS" },
      { property: "og:description", content: "Manage agencies, users and alert thresholds." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AdminPanel />
    </RequireAuth>
  ),
});
