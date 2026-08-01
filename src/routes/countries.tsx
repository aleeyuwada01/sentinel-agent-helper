import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import Countries from "@/pages/Countries";

export const Route = createFileRoute("/countries")({
  head: () => ({
    meta: [
      { title: "Country & Concern Registry — WAMHEWS" },
      {
        name: "description",
        content:
          "Register West African country deployments in WAMHEWS and log each hazard, exposure and coordination concern the system covers.",
      },
      { property: "og:title", content: "Country & Concern Registry — WAMHEWS" },
      {
        property: "og:description",
        content: "Onboard countries and record what the early warning system makes obtainable for each concern.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Countries />
    </RequireAuth>
  ),
});
