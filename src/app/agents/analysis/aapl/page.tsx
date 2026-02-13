"use client";

import VolatilityAnalysisAgent from "@/components/agent/VolatilityAnalysisAgent";

export default function AAPLAnalysisPage() {
  return (
    <VolatilityAnalysisAgent
      ticker="AAPL"
      title="Apple Performance & Risk Analysis"
      description="Volatility, earnings impact, profitability, and risk analysis for AAPL."
      domain="Companies"
      apiEndpoint="/api/v1/analysis/aapl"
    />
  );
}