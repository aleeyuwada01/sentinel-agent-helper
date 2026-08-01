import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import Alerts from "@/pages/Alerts";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — WAMHEWS" },
      { name: "description", content: "Active and historical multi-hazard alerts with dissemination status." },
      { property: "og:title", content: "Alerts — WAMHEWS" },
      { property: "og:description", content: "Active multi-hazard alerts and dissemination status." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Alerts />
    </RequireAuth>
  ),
});
