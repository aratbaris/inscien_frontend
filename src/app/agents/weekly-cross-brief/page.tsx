"use client";

import SignalFeed from "@/components/agent/SignalFeed";

export default function WeeklyHighlightsPage() {
  return (
    <SignalFeed
      agentKey="weekly-cross-brief"
      domain="Cross-Monitor"
      title="Weekly Highlights"
      description="Top items across all monitors from the past week, ranked by significance. Covers macro releases, cyber risk, oil supply, crypto regulatory shifts, and ETF access events."
      emptyHint="No highlights for this period. This can happen during weeks with no material events across monitored domains."
      historyDepth={12}
      cadence="Weekly"
      groupByMonitor
    />
  );
}