import { createFileRoute } from "@tanstack/react-router";
import Login from "@/pages/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — WAMHEWS" },
      { name: "description", content: "Sign in to the WAMHEWS multi-hazard early warning platform." },
      { property: "og:title", content: "Sign in — WAMHEWS" },
      { property: "og:description", content: "Access the WAMHEWS early warning dashboard." },
    ],
  }),
  component: Login,
});
