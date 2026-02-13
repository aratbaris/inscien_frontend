"use client";

import TopicMapAgent from "@/components/agent/TopicMapAgent";

export default function GoogleWeeklyPage() {
  return (
    <TopicMapAgent
      topicId="google"
      label="Google"
      title="Google Weekly Topic Map"
      description="Weekly analysis of product launches, AI initiatives, cloud strategy, and ecosystem developments from Google."
    />
  );
}