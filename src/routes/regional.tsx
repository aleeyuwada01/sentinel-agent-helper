import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import RegionalCommand from "@/pages/RegionalCommand";

export const Route = createFileRoute("/regional")({
  head: () => ({
    meta: [
      { title: "Regional Command — MHEWS" },
      { name: "description", content: "West Africa regional command view of cross-border hazards and alerts." },
      { property: "og:title", content: "Regional Command — MHEWS" },
      { property: "og:description", content: "Cross-border hazard monitoring across West Africa." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <RegionalCommand />
    </RequireAuth>
  ),
});
