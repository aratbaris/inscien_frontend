"use client";

import PaperBriefAgent from "@/components/agent/PaperBriefAgent";

export default function RealizedVolatilityPage() {
  return (
    <PaperBriefAgent
      episodeNumber={2}
      title="Modeling and Forecasting Realized Volatility"
      authors="Torben G. Andersen, Tim Bollerslev, Francis X. Diebold, Paul Labys"
      affiliations="University of Pennsylvania · Duke University · NYU Stern"
      venue="Econometrica"
      year={2003}
      citations={5300}
      paperUrl="https://www.jstor.org/stable/3082068"
      audioFile="episode02.mp3"
      durationSeconds={500}
      summary="How high-frequency intraday returns can be used to construct nonparametric realized volatility measures, and why long-memory models applied to these measures dramatically improve out-of-sample forecasting of asset return volatility across multiple horizons."
    />
  );
}