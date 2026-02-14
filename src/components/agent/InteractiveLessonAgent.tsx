"use client";

import { useState, useRef, useCallback, useEffect, ReactNode } from "react";
import styles from "./interactive-lesson.module.css";
import { AgentHeader, StatusBadge } from "@/components/agent";
import { topics, Topic } from "@/components/learn/topicData";
import { AccessGate } from "@/components/AccessGate";
import { useAuth } from "@/lib/auth";

/* ─── Visualization imports ─── */
import {
  VarianceDotVisualization,
  VarianceCloudVisualization,
  VarianceDeviationVisualization,
  VarianceFormulaVisualization,
  VarianceThreeCurvesVisualization,
} from "@/components/learn/VarianceVisualizations";
import {
  SigmaBallVisualization,
  SigmaGaussianVisualization,
  SigmaSamplePointsVisualization,
  SigmaSymmetryVisualization,
  SigmaComparisonVisualization,
  SigmaSummaryVisualization,
  SigmaNormalVisualization,
} from "@/components/learn/SigmaVisualizations";
import {
  BootstrapQuestionVisualization,
  BootstrapHistoryVisualization,
  BootstrapReturnsTransformVisualization,
  BootstrapHistogramVisualization,
  BootstrapSamplingVisualization,
  BootstrapSinglePathVisualization,
  BootstrapManyPathsVisualization,
  BootstrapConfidenceBandVisualization,
  BootstrapFinalDistVisualization,
  BootstrapInsightVisualization,
} from "@/components/learn/BootstrapVisualizations";

/* ─── Viz resolver ─── */

type VarPhase = "idle" | "jitter" | "complete";
type SigPhase = "idle" | "active" | "complete";
type BsPhase = "idle" | "animate";
type DotType = "orange" | "blue" | "red" | "all" | "none";

function resolveViz(key: string, active: boolean, props: Record<string, unknown> = {}): ReactNode {
  const varPhase: VarPhase = active ? "jitter" : "idle";
  const sigPhase: SigPhase = active ? "active" : "idle";
  const bsPhase: BsPhase = active ? "animate" : "idle";

  switch (key) {
    case "var-dot": return <VarianceDotVisualization phase={varPhase} activeDot={(props.activeDot as DotType) || "orange"} />;
    case "var-cloud": return <VarianceCloudVisualization phase={(props.phase as VarPhase) || "idle"} />;
    case "var-dev": return <VarianceDeviationVisualization phase={(props.phase as VarPhase) || "idle"} />;
    case "var-formula": return <VarianceFormulaVisualization phase={(props.phase as VarPhase) || "idle"} />;
    case "var-curves": return <VarianceThreeCurvesVisualization />;
    case "sig-ball": return <SigmaBallVisualization phase={sigPhase} sigmaLevel={(props.sigmaLevel as number) || 0.1} />;
    case "sig-gauss": return <SigmaGaussianVisualization showMean={!!props.showMean} showOneSigma={!!props.showOneSigma} showTwoSigma={!!props.showTwoSigma} showRings={!!props.showRings} />;
    case "sig-sample": return <SigmaSamplePointsVisualization showFormula={!!props.showFormula} />;
    case "sig-sym": return <SigmaSymmetryVisualization showAsymmetric={!!props.showAsymmetric} />;
    case "sig-comp": return <SigmaComparisonVisualization />;
    case "sig-summary": return <SigmaSummaryVisualization />;
    case "sig-normal": return <SigmaNormalVisualization />;
    case "bs-question": return <BootstrapQuestionVisualization phase={bsPhase} />;
    case "bs-history": return <BootstrapHistoryVisualization phase={bsPhase} />;
    case "bs-returns": return <BootstrapReturnsTransformVisualization phase={bsPhase} />;
    case "bs-histogram": return <BootstrapHistogramVisualization phase={bsPhase} />;
    case "bs-sampling": return <BootstrapSamplingVisualization phase={bsPhase} />;
    case "bs-single": return <BootstrapSinglePathVisualization phase={bsPhase} />;
    case "bs-many": return <BootstrapManyPathsVisualization phase={bsPhase} />;
    case "bs-band": return <BootstrapConfidenceBandVisualization phase={bsPhase} />;
    case "bs-final": return <BootstrapFinalDistVisualization phase={bsPhase} />;
    case "bs-insight": return <BootstrapInsightVisualization phase={bsPhase} />;
    default: return null;
  }
}

/* ─── Constants ─── */

const FREE_STEPS = 4;

/* ─── Props ─── */

export interface InteractiveLessonAgentProps {
  /** Topic ID matching topicData, e.g. "variance", "sigma", "sp500-bootstrap" */
  topicId: string;
  /** Page title shown in agent header */
  title: string;
  /** Description shown in agent header */
  description: string;
  /** Domain tag shown above the title */
  domain?: string;
}

/* ─── Component ─── */

export default function InteractiveLessonAgent({
  topicId,
  title,
  description,
  domain = "Education",
}: InteractiveLessonAgentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const flowRef = useRef<HTMLDivElement | null>(null);
  const clickSound = useRef<HTMLAudioElement | null>(null);
  const { canAccess } = useAuth();

  const topic = topics.find((t) => t.id === topicId);
  const totalSteps = topic?.steps.length || 0;

  useEffect(() => {
    clickSound.current = new Audio("/sounds/next-button.mp3");
    clickSound.current.volume = 0.5;
  }, []);

  const playClick = useCallback(() => {
    if (clickSound.current) {
      clickSound.current.currentTime = 0;
      clickSound.current.play().catch(() => {});
    }
  }, []);

  const scrollToStep = useCallback((idx: number) => {
    setTimeout(() => {
      const el = stepRefs.current[idx];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, []);

  const handleAdvance = () => {
    playClick();
    if (currentStep >= totalSteps - 1) {
      window.location.href = "/";
      return;
    }
    const next = currentStep + 1;
    setCurrentStep(next);
    scrollToStep(next);
  };

  const handleBack = () => {
    playClick();
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      scrollToStep(prev);
    }
  };

  if (!topic) {
    return (
      <div className={styles.page}>
        <AgentHeader
          domain={domain}
          title={title}
          description={description}
          meta={[{ label: "Status", value: "Topic not found" }]}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AgentHeader
        domain={domain}
        title={title}
        description={description}
        meta={[
          { label: "Steps", value: String(totalSteps) },
          { label: "Cadence", value: "Self-paced" },
          { label: "Status", value: <StatusBadge status="live" /> },
        ]}
      />

      <main className={styles.content} ref={flowRef}>
        {/* Progress strip */}
        <div className={styles.progressBar}>
          <div className={styles.progressBarInner}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
            <span className={styles.progressLabel}>
              {currentStep + 1} / {totalSteps}
            </span>
          </div>
        </div>

        {/* Steps */}
        {topic.steps.map((step, idx) => {
          if (idx > currentStep) return null;
          const isCurrent = idx === currentStep;

          if (idx >= FREE_STEPS && !canAccess("auth")) {
            return (
              <div key={idx} ref={(el) => { stepRefs.current[idx] = el; }}>
                <AccessGate requires="auth" featureLabel={`steps ${FREE_STEPS + 1}-${totalSteps}`}>
                  <div />
                </AccessGate>
              </div>
            );
          }

          return (
            <div key={idx}>
              {step.context && (
                <div className={styles.contextCard}>{step.context}</div>
              )}
              <div
                className={styles.stepPanel}
                ref={(el) => { stepRefs.current[idx] = el; }}
              >
                <div className={styles.stepLabel}>Step {idx + 1}</div>
                <h2 className={styles.stepTitle}>{step.title}</h2>
                <p className={styles.stepSubtitle}>{step.subtitle}</p>

                <div className={styles.stepContent}>
                  <div className={styles.stepChart}>
                    {resolveViz(step.vizKey, isCurrent, step.vizProps)}
                  </div>
                  <div className={styles.insightBox}>{step.insight}</div>
                </div>

                {isCurrent && (
                  <div className={styles.stepFooter}>
                    <div>
                      {idx === 0 ? (
                        <a href="/" className={styles.stepBackBtn}>
                          Back to dashboard
                        </a>
                      ) : (
                        <button className={styles.stepBackBtn} onClick={handleBack}>
                          Previous step
                        </button>
                      )}
                    </div>
                    <div className={styles.stepFooterRight}>
                      <span className={styles.stepHint}>{idx + 1} of {totalSteps}</span>
                      <button className={styles.continueBtn} onClick={handleAdvance}>
                        {idx >= totalSteps - 1 ? "Finish" : "Continue"}
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}