"use client";

import PaperBriefAgent from "@/components/agent/PaperBriefAgent";

export default function TailRiskPage() {
  return (
    <PaperBriefAgent
      episodeNumber={1}
      title="Tail Risk and Asset Prices"
      authors="Bryan Kelly, Hao Jiang"
      affiliations="Yale School of Management · Michigan State University"
      venue="The Review of Financial Studies"
      year={2014}
      citations={1000}
      paperUrl="https://www.jstor.org/stable/24466856"
      audioFile="episode01.mp3"
      durationSeconds={562}
      summary="How to measure tail risk when extreme events are too rare to estimate from aggregate data and why a cross-sectional approach using individual stock crashes predicts market returns, prices risk, and forecasts real economic downturns."
    />
  );
}