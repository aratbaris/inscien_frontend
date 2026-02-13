"use client";

import VolatilityAnalysisAgent from "@/components/agent/VolatilityAnalysisAgent";

export default function METAAnalysisPage() {
  return (
    <VolatilityAnalysisAgent
      ticker="META"
      title="Meta Platforms Performance & Risk Analysis"
      description="Volatility, earnings impact, profitability, and risk analysis for META."
      domain="Companies"
      apiEndpoint="/api/v1/analysis/meta"
    />
  );
}