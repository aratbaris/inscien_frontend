"use client";

import VolatilityAnalysisAgent from "@/components/agent/VolatilityAnalysisAgent";

export default function QQQAnalysisPage() {
  return (
    <VolatilityAnalysisAgent
      ticker="QQQ"
      title="Nasdaq-100 (QQQ) Market Analysis"
      description="Comprehensive volatility, risk, and regime analysis for the Nasdaq-100 ETF."
      domain="Markets"
      apiEndpoint="/api/v1/analysis/qqq"
    />
  );
}