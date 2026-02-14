"use client";

import SignalFeed from "@/components/agent/SignalFeed";

export default function CryptoRegulatoryShiftsPage() {
  return (
    <SignalFeed
      agentKey="regulatory"
      domain="Digital Assets"
      title="Crypto Regulatory Shifts"
      description="Binding rule changes, stablecoin framework enactments, exchange licensing actions, major enforcement, and court rulings changing classification or scope."
      emptyHint="This can happen on days with no binding regulatory changes, licensing actions, or court rulings."
    />
  );
}