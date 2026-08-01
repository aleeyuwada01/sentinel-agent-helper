import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import AgencyDashboard from "@/pages/AgencyDashboard";

export const Route = createFileRoute("/agency/$code")({
  head: () => ({
    meta: [
      { title: "Agency Dashboard — MHEWS" },
      { name: "description", content: "Agency-level hazard readings, thresholds and operational status." },
      { property: "og:title", content: "Agency Dashboard — MHEWS" },
      { property: "og:description", content: "Agency-level hazard readings and operational status." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AgencyDashboard />
    </RequireAuth>
  ),
});
