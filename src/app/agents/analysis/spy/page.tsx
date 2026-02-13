"use client";

import VolatilityAnalysisAgent from "@/components/agent/VolatilityAnalysisAgent";

export default function SPYAnalysisPage() {
  return (
    <VolatilityAnalysisAgent
      ticker="SPY"
      title="S&P 500 Market Analysis"
      description="Comprehensive volatility, risk, and regime analysis for SPY."
      domain="Markets"
      apiEndpoint="/api/v1/analysis/spy"
    />
  );
}