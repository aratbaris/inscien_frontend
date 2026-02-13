"use client";

import VolatilityAnalysisAgent from "@/components/agent/VolatilityAnalysisAgent";

export default function NVDAAnalysisPage() {
  return (
    <VolatilityAnalysisAgent
      ticker="NVDA"
      title="NVIDIA Performance & Risk Analysis"
      description="Volatility, earnings impact, profitability, and risk analysis for NVDA."
      domain="Companies"
      apiEndpoint="/api/v1/analysis/nvda"
    />
  );
}