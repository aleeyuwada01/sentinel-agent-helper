import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WAMHEWS — West Africa Multi-Hazard Early Warning" },
      {
        name: "description",
        content:
          "Live multi-hazard early warning dashboard consolidating flood, drought, epidemic, heatwave and fire risk from Nigerian agencies.",
      },
      { property: "og:title", content: "WAMHEWS — West Africa Multi-Hazard Early Warning" },
      {
        property: "og:description",
        content: "Live multi-hazard early warning dashboard consolidating flood, drought, epidemic, heatwave and fire risk from Nigerian agencies.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Index />
    </RequireAuth>
  ),
});
