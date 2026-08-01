import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import Analytics from "@/pages/Analytics";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — WAMHEWS" },
      { name: "description", content: "Trends, lead times and performance analytics across hazard agencies." },
      { property: "og:title", content: "Analytics — WAMHEWS" },
      { property: "og:description", content: "Hazard trends and early warning performance analytics." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Analytics />
    </RequireAuth>
  ),
});
