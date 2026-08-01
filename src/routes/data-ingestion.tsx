import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import DataIngestion from "@/pages/DataIngestion";

export const Route = createFileRoute("/data-ingestion")({
  head: () => ({
    meta: [
      { title: "Data Ingestion — MHEWS" },
      { name: "description", content: "Register focal persons and ingest agency hazard data feeds." },
      { property: "og:title", content: "Data Ingestion — MHEWS" },
      { property: "og:description", content: "Register focal persons and ingest agency data feeds." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <DataIngestion />
    </RequireAuth>
  ),
});
