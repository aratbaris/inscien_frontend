"use client";

import InteractiveLessonAgent from "@/components/agent/InteractiveLessonAgent";

export default function StandardDeviationLessonPage() {
  return (
    <InteractiveLessonAgent
      topicId="sigma"
      title="Standard Deviation (σ)"
      description="How σ measures spread, the 68-95-99.7 rule, and when ±σ notation breaks down. An interactive walk-through with live visualizations."
    />
  );
}