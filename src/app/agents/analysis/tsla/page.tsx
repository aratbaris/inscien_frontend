"use client";

import VolatilityAnalysisAgent from "@/components/agent/VolatilityAnalysisAgent";

export default function TSLAAnalysisPage() {
  return (
    <VolatilityAnalysisAgent
      ticker="TSLA"
      title="Tesla Inc. Volatility & Risk"
      description="Realized volatility, distributional statistics, and short-term forecasts for Tesla."
      domain="Markets"
    />
  );
}