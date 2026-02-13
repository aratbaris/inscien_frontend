"use client";

import VolatilityAnalysisAgent from "@/components/agent/VolatilityAnalysisAgent";

export default function JPMAnalysisPage() {
  return (
    <VolatilityAnalysisAgent
      ticker="JPM"
      title="JPMorgan Chase Volatility & Risk"
      description="Realized volatility, distributional statistics, and short-term forecasts for JPMorgan Chase."
      domain="Markets"
    />
  );
}