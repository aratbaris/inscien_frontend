"use client";

import SignalFeed from "@/components/agent/SignalFeed";

export default function PublicCompanyCyberRiskPage() {
  return (
    <SignalFeed
      agentKey="cyber"
      domain="Security"
      title="Public Company Cyber Risk"
      description="Confirmed cyber incidents affecting publicly traded companies, SEC investigations, securities class actions tied to breaches, and material operational disruptions with equity relevance."
      emptyHint="This is normal on quiet days. Items appear only for equity-impacting cyber events affecting listed companies."
    />
  );
}