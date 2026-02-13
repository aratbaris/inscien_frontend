"use client";

import SignalFeed from "@/components/agent/SignalFeed";

export default function OilMarketMonitorPage() {
  return (
    <SignalFeed
      agentKey="oil"
      domain="Energy"
      title="Oil Market Monitor"
      description="EIA inventories, OPEC actions, sanctions decisions, supply disruptions, and demand signals affecting oil markets."
      emptyHint="This can happen on days with no material supply disruptions or policy actions."
      historyDepth={14}
    />
  );
}