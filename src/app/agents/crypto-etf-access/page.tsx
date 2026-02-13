"use client";

import SignalFeed from "@/components/agent/SignalFeed";

export default function CryptoEtfAccessPage() {
  return (
    <SignalFeed
      agentKey="crypto"
      domain="Digital Assets"
      title="Crypto ETF Access"
      description="ETF approvals, rejections, filings, listing decisions, and flow-related structural milestones for crypto capital access vehicles."
      emptyHint="This can happen on days with no ETF filings, approvals, or structural milestones."
      historyDepth={60}
    />
  );
}