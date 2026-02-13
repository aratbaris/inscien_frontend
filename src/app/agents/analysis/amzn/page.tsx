"use client";

import VolatilityAnalysisAgent from "@/components/agent/VolatilityAnalysisAgent";

export default function AMZNAnalysisPage() {
  return (
    <VolatilityAnalysisAgent
      ticker="AMZN"
      title="Amazon.com Inc. Volatility & Risk"
      description="Realized volatility, distributional statistics, and short-term forecasts for Amazon."
      domain="Markets"
    />
  );
}