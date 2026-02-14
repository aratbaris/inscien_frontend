"use client";

import SignalFeed from "@/components/agent/SignalFeed";

export default function G10MacroReleasesPage() {
  return (
    <SignalFeed
      agentKey="macro"
      domain="Macro"
      title="G10 Macro Releases"
      description="G10 central bank rate decisions, official policy statements, and major data releases including CPI, PCE, NFP, GDP, PMI, retail sales, and unemployment."
      emptyHint="This is normal on non-release days. Items appear only when official G10 data or rate decisions are published."
    />
  );
}