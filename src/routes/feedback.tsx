import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import Feedback from "@/pages/Feedback";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Community Feedback — MHEWS" },
      { name: "description", content: "Community feedback loop on warning reach, clarity and response." },
      { property: "og:title", content: "Community Feedback — MHEWS" },
      { property: "og:description", content: "Feedback on warning reach, clarity and community response." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Feedback />
    </RequireAuth>
  ),
});
