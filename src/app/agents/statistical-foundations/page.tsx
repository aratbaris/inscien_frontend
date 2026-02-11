"use client"

import { useState, useRef, useCallback, useEffect, ReactNode } from "react"
import styles from "./page.module.css"
import { AgentHeader, StatusBadge } from "@/components/agent"
import { topics } from "@/components/learn/topicData"
import { AccessGate } from "@/components/AccessGate"
import { useAuth } from "@/lib/auth"

/* ─── Visualization imports ─── */
import {
  VarianceDotVisualization,
  VarianceCloudVisualization,
  VarianceDeviationVisualization,
  VarianceFormulaVisualization,
  VarianceThreeCurvesVisualization,
} from "@/components/learn/VarianceVisualizations"
import {
  SigmaBallVisualization,
  SigmaGaussianVisualization,
  SigmaSamplePointsVisualization,
  SigmaSymmetryVisualization,
  SigmaComparisonVisualization,
  SigmaSummaryVisualization,
  SigmaNormalVisualization,
} from "@/components/learn/SigmaVisualizations"
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
} from "@/components/learn/BootstrapVisualizations"

/* ─── Viz resolver ─── */

type VarPhase = "idle" | "jitter" | "complete"
type SigPhase = "idle" | "active" | "complete"
type BsPhase = "idle" | "animate"
type DotType = "orange" | "blue" | "red" | "all" | "none"

function resolveViz(key: string, active: boolean, props: Record<string, unknown> = {}): ReactNode {
  const varPhase: VarPhase = active ? "jitter" : "idle"
  const sigPhase: SigPhase = active ? "active" : "idle"
  const bsPhase: BsPhase = active ? "animate" : "idle"

  switch (key) {
    case "var-dot": return <VarianceDotVisualization phase={varPhase} activeDot={(props.activeDot as DotType) || "orange"} />
    case "var-cloud": return <VarianceCloudVisualization phase={(props.phase as VarPhase) || "idle"} />
    case "var-dev": return <VarianceDeviationVisualization phase={(props.phase as VarPhase) || "idle"} />
    case "var-formula": return <VarianceFormulaVisualization phase={(props.phase as VarPhase) || "idle"} />
    case "var-curves": return <VarianceThreeCurvesVisualization />
    case "sig-ball": return <SigmaBallVisualization phase={sigPhase} sigmaLevel={(props.sigmaLevel as number) || 0.1} />
    case "sig-gauss": return <SigmaGaussianVisualization showMean={!!props.showMean} showOneSigma={!!props.showOneSigma} showTwoSigma={!!props.showTwoSigma} showRings={!!props.showRings} />
    case "sig-sample": return <SigmaSamplePointsVisualization showFormula={!!props.showFormula} />
    case "sig-sym": return <SigmaSymmetryVisualization showAsymmetric={!!props.showAsymmetric} />
    case "sig-comp": return <SigmaComparisonVisualization />
    case "sig-summary": return <SigmaSummaryVisualization />
    case "sig-normal": return <SigmaNormalVisualization />
    case "bs-question": return <BootstrapQuestionVisualization phase={bsPhase} />
    case "bs-history": return <BootstrapHistoryVisualization phase={bsPhase} />
    case "bs-returns": return <BootstrapReturnsTransformVisualization phase={bsPhase} />
    case "bs-histogram": return <BootstrapHistogramVisualization phase={bsPhase} />
    case "bs-sampling": return <BootstrapSamplingVisualization phase={bsPhase} />
    case "bs-single": return <BootstrapSinglePathVisualization phase={bsPhase} />
    case "bs-many": return <BootstrapManyPathsVisualization phase={bsPhase} />
    case "bs-band": return <BootstrapConfidenceBandVisualization phase={bsPhase} />
    case "bs-final": return <BootstrapFinalDistVisualization phase={bsPhase} />
    case "bs-insight": return <BootstrapInsightVisualization phase={bsPhase} />
    default: return null
  }
}

/* ─── Constants ─── */

const FREE_STEPS = 4

/* ─── Page ─── */

export default function StatFoundationsPage() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const flowRef = useRef<HTMLDivElement | null>(null)
  const clickSound = useRef<HTMLAudioElement | null>(null)
  const { canAccess } = useAuth()

  const topic = topics.find((t) => t.id === activeTopic)
  const totalSteps = topic?.steps.length || 0
  const totalFlowSteps = topics.reduce((s, t) => s + t.steps.length, 0)

  useEffect(() => {
    clickSound.current = new Audio("/sounds/next-button.mp3")
    clickSound.current.volume = 0.5
  }, [])

  const playClick = useCallback(() => {
    if (clickSound.current) {
      clickSound.current.currentTime = 0
      clickSound.current.play().catch(() => {})
    }
  }, [])

  const scrollToStep = useCallback((idx: number) => {
    setTimeout(() => {
      const el = stepRefs.current[idx]
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 80)
  }, [])

  const handleAdvance = () => {
    playClick()
    if (currentStep >= totalSteps - 1) {
      setActiveTopic(null)
      setCurrentStep(0)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    const next = currentStep + 1
    setCurrentStep(next)
    scrollToStep(next)
  }

  const handleBack = () => {
    playClick()
    if (currentStep > 0) {
      const prev = currentStep - 1
      setCurrentStep(prev)
      scrollToStep(prev)
    }
  }

  const startTopic = (id: string) => {
    setActiveTopic(id)
    setCurrentStep(0)
    stepRefs.current = []
    setTimeout(() => {
      if (flowRef.current) flowRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  const exitFlow = () => {
    setActiveTopic(null)
    setCurrentStep(0)
  }

  return (
    <div className={styles.page}>
      <AgentHeader
        domain="Education"
        title="Statistical Foundations"
        description="Interactive walk-throughs for variance, standard deviation, and bootstrap resampling. Each topic is a guided sequence with live visualizations you step through at your own pace."
        meta={[
          { label: "Cadence", value: "Self-paced" },
          { label: "Topics", value: String(topics.length) },
          { label: "Total steps", value: String(totalFlowSteps) },
          { label: "Status", value: <StatusBadge status="live" /> },
        ]}
      />

      {/* Topic selector */}
      <div className={styles.topicSection}>
        <div className={styles.topicSectionLabel}>Choose a topic</div>
        <div className={styles.topicGrid}>
          {topics.map((t) => {
            const isActive = activeTopic === t.id
            return (
              <button
                key={t.id}
                className={`${styles.topicCard} ${isActive ? styles.topicCardActive : ""}`}
                onClick={() => isActive ? exitFlow() : startTopic(t.id)}
              >
                <div className={styles.topicTop}>
                  <span className={styles.topicSteps}>
                    {canAccess("auth")
                      ? `${t.steps.length} steps`
                      : `${Math.min(FREE_STEPS, t.steps.length)} of ${t.steps.length} free`}
                  </span>
                </div>
                <div className={styles.topicTitle}>{t.title}</div>
                <p className={styles.topicDesc}>{t.desc}</p>
                <div className={styles.topicAction}>
                  {isActive ? (
                    "Close ×"
                  ) : (
                    <>
                      Start
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Flow */}
      {topic && (
        <main className={styles.content} ref={flowRef}>
          {/* Progress strip */}
          <div className={styles.progressBar}>
            <div className={styles.progressBarInner}>
              <button className={styles.progressClose} onClick={exitFlow}>×</button>
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
            if (idx > currentStep) return null
            const isCurrent = idx === currentStep

            if (idx >= FREE_STEPS && !canAccess("auth")) {
              return (
                <div key={idx} ref={(el) => { stepRefs.current[idx] = el }}>
                  <AccessGate requires="auth" featureLabel={`steps ${FREE_STEPS + 1}-${totalSteps}`}>
                    <div />
                  </AccessGate>
                </div>
              )
            }

            return (
              <div key={idx}>
                {step.context && (
                  <div className={styles.contextCard}>{step.context}</div>
                )}
                <div
                  className={styles.stepPanel}
                  ref={(el) => { stepRefs.current[idx] = el }}
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
                          <button className={styles.stepBackBtn} onClick={exitFlow}>
                            Back to topics
                          </button>
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
            )
          })}
        </main>
      )}
    </div>
  )
}