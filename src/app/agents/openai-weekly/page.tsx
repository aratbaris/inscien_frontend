"use client";

import TopicMapAgent from "@/components/agent/TopicMapAgent";

export default function OpenAIWeeklyPage() {
  return (
    <TopicMapAgent
      topicId="openai"
      label="OpenAI"
      title="OpenAI Weekly Topic Map"
      description="Weekly analysis of product launches, API updates, partnerships, and strategic developments from OpenAI."
    />
  );
}