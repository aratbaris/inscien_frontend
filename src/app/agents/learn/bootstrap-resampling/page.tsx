"use client";

import InteractiveLessonAgent from "@/components/agent/InteractiveLessonAgent";

export default function BootstrapResamplingLessonPage() {
  return (
    <InteractiveLessonAgent
      topicId="sp500-bootstrap"
      title="Bootstrap Resampling"
      description="Use real S&P 500 data to understand sampling distributions and quantify uncertainty through an interactive guided sequence."
    />
  );
}