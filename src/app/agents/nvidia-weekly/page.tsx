"use client";

import TopicMapAgent from "@/components/agent/TopicMapAgent";

export default function NvidiaWeeklyPage() {
  return (
    <TopicMapAgent
      topicId="nvidia"
      label="NVIDIA"
      title="NVIDIA Weekly Topic Map"
      description="Weekly analysis of GPU architecture, data center strategy, AI compute developments, and supply chain shifts from NVIDIA."
    />
  );
}