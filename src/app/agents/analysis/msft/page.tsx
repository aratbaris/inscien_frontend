"use client";

import VolatilityAnalysisAgent from "@/components/agent/VolatilityAnalysisAgent";

export default function MSFTAnalysisPage() {
  return (
    <VolatilityAnalysisAgent
      ticker="MSFT"
      title="Microsoft Performance & Risk Analysis"
      description="Volatility, earnings impact, profitability, and risk analysis for MSFT."
      domain="Companies"
      apiEndpoint="/api/v1/analysis/msft"
    />
  );
}