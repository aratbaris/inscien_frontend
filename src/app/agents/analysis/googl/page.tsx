"use client";

import VolatilityAnalysisAgent from "@/components/agent/VolatilityAnalysisAgent";

export default function GOOGLAnalysisPage() {
  return (
    <VolatilityAnalysisAgent
      ticker="GOOGL"
      title="Alphabet Performance & Risk Analysis"
      description="Volatility, earnings impact, profitability, and risk analysis for GOOGL."
      domain="Companies"
      apiEndpoint="/api/v1/analysis/googl"
    />
  );
}