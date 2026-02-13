"use client";

import TopicMapAgent from "@/components/agent/TopicMapAgent";

export default function MicrosoftWeeklyPage() {
  return (
    <TopicMapAgent
      topicId="microsoft"
      label="Microsoft"
      title="Microsoft Weekly Topic Map"
      description="Weekly analysis of Azure strategy, AI integration, enterprise developments, and ecosystem shifts from Microsoft."
    />
  );
}