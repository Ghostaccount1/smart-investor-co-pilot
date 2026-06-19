import { createFileRoute } from "@tanstack/react-router";
import { MarketCopilotApp } from "@/components/copilot/MarketCopilotApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Investor — Context-aware market research" },
      {
        name: "description",
        content: "A cross-browser AI research copilot that remembers how you analyze markets.",
      },
      { property: "og:title", content: "Smart Investor" },
      { property: "og:description", content: "Invest with more context." },
    ],
  }),
  component: Index,
});

function Index() {
  return <MarketCopilotApp />;
}
