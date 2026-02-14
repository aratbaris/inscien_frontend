"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import styles from "./topic-map.module.css";
import { AgentHeader, StatusBadge, LoadingState, ErrorState, EmptyState } from "@/components/agent";
import { AccessGate } from "@/components/AccessGate";
import { useAuth } from "@/lib/auth";
import { getTopicMapAccess } from "@/lib/agent-access";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ───

interface EvidenceItem {
  title: string;
  timestamp: string;
  source: string;
  url: string;
}

interface Cluster {
  label: string;
  takeaways: string[];
  evidence: EvidenceItem[];
}

interface WeeklyBrief {
  topicId: string;
  company: string;
  weekStartUtc: string;
  weekEndUtc: string;
  weekKey: string;
  generatedAtUtc: string;
  counts: {
    weeklyPoolRows: number;
    weeklyTopRows: number;
    clustersFinal: number;
  };
  clusters: Cluster[];
}

interface TimelineWeek {
  weekKey: string;
  weekStartUtc: string;
  weekEndUtc: string;
  generatedAtUtc: string;
  clusterCount: number;
  clusters: {
    label: string;
    takeaways: string[];
    evidenceCount: number;
    evidence: EvidenceItem[];
  }[];
}

interface TimelineResponse {
  status: string;
  topicId: string;
  label: string;
  weeks: TimelineWeek[];
}

// ─── Props ───

export interface TopicMapAgentProps {
  topicId: string;
  label: string;
  title: string;
  description: string;
  domain?: string;
}

// ─── Helpers ───

function formatWeekRange(start: string, end: string): string {
  if (!start || !end) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmt = (d: string) => {
    const parts = d.split("-");
    if (parts.length !== 3) return d;
    const m = parseInt(parts[1], 10) - 1;
    return `${months[m]} ${parseInt(parts[2], 10)}`;
  };
  return `${fmt(start)} to ${fmt(end)}`;
}

function formatEvidenceDate(ts: string): string {
  if (!ts) return "";
  const d = ts.substring(0, 10);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  const m = parseInt(parts[1], 10) - 1;
  return `${months[m]} ${parseInt(parts[2], 10)}`;
}

// ─── Sub-components ───

function EvidenceCard({ item }: { item: EvidenceItem }) {
  return (
    <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className={styles.evidenceCard}>
      <div className={styles.evidenceTitle}>{item.title}</div>
      <div className={styles.evidenceMeta}>
        <span className={styles.evidenceSource}>{item.source}</span>
        {item.timestamp && (
          <>
            <span className={styles.evidenceDot}>&middot;</span>
            <span>{formatEvidenceDate(item.timestamp)}</span>
          </>
        )}
      </div>
    </a>
  );
}

function TimelineEvidence({ evidence }: { evidence: EvidenceItem[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.timelineEvidenceWrap}>
      <button
        className={styles.timelineEvidenceToggle}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Hide sources" : `Show ${evidence.length} sources`}
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={expanded ? styles.chevronUp : styles.chevronDown}
        >
          <path d="M4 6L8 10L12 6" />
        </svg>
      </button>
      {expanded && (
        <div className={styles.timelineClusterEvidence}>
          {evidence.map((ev, idx) => (
            <EvidenceCard key={`${ev.url}-${idx}`} item={ev} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClusterCard({ cluster }: { cluster: Cluster }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.clusterCard}>
      <button className={styles.clusterHeader} onClick={() => setExpanded(!expanded)}>
        <div className={styles.clusterInfo}>
          <h3 className={styles.clusterLabel}>{cluster.label}</h3>
          <span className={styles.clusterCount}>{cluster.evidence.length} sources</span>
        </div>
        <span className={styles.clusterToggle}>{expanded ? "−" : "+"}</span>
      </button>

      <div className={styles.clusterTakeaways}>
        {cluster.takeaways.map((t, i) => (
          <div key={i} className={styles.takeaway}>{t}</div>
        ))}
      </div>

      {expanded && cluster.evidence.length > 0 && (
        <div className={styles.clusterEvidence}>
          {cluster.evidence.map((ev, idx) => (
            <EvidenceCard key={`${ev.url}-${idx}`} item={ev} />
          ))}
        </div>
      )}
    </div>
  );
}

function WeekView({ data }: { data: WeeklyBrief }) {
  return (
    <div className={styles.weekView}>
      <div className={styles.clusterList}>
        {data.clusters.map((cluster) => (
          <ClusterCard key={cluster.label} cluster={cluster} />
        ))}
      </div>
      {data.clusters.length === 0 && (
        <EmptyState message="No clusters for this week." />
      )}
    </div>
  );
}

function TimelineView({ data }: { data: TimelineResponse }) {
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  return (
    <div className={styles.timeline}>
      {data.weeks.map((week) => {
        const isExpanded = expandedWeek === week.weekKey;
        return (
          <div key={week.weekKey} className={styles.timelineWeek}>
            <button
              className={styles.timelineWeekHeader}
              onClick={() => setExpandedWeek(isExpanded ? null : week.weekKey)}
            >
              <div className={styles.timelineDot} />
              <div className={styles.timelineWeekInfo}>
                <span className={styles.timelineWeekLabel}>
                  {formatWeekRange(week.weekStartUtc, week.weekEndUtc)}
                </span>
                <span className={styles.timelineWeekStats}>
                  {week.clusterCount} topic{week.clusterCount !== 1 ? "s" : ""}
                </span>
              </div>
              <span className={styles.timelineWeekToggle}>{isExpanded ? "−" : "+"}</span>
            </button>

            {isExpanded && (
              <div className={styles.timelineWeekBody}>
                {week.clusters.map((cluster) => (
                  <div key={cluster.label} className={styles.timelineCluster}>
                    <div className={styles.timelineClusterHeader}>
                      <span className={styles.timelineClusterLabel}>{cluster.label}</span>
                      <span className={styles.timelineClusterCount}>
                        {cluster.evidenceCount} sources
                      </span>
                    </div>
                    <div className={styles.timelineClusterTakeaways}>
                      {cluster.takeaways.map((t, i) => (
                        <div key={i} className={styles.takeaway}>{t}</div>
                      ))}
                    </div>
                    {cluster.evidence && cluster.evidence.length > 0 && (
                      <TimelineEvidence evidence={cluster.evidence} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {data.weeks.length === 0 && (
        <EmptyState message="No timeline data available." />
      )}
    </div>
  );
}

// ─── Main Shared Component ───

export default function TopicMapAgent({
  topicId,
  label,
  title,
  description,
  domain = "Weekly Brief",
}: TopicMapAgentProps) {
  const [view, setView] = useState<"week" | "timeline">("week");
  const [weekData, setWeekData] = useState<WeeklyBrief | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tier, login } = useAuth();

  const topicAccess = useMemo(
    () => getTopicMapAccess(topicId, tier),
    [topicId, tier]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWeekData(null);
    setTimelineData(null);
    try {
      const weekRes = await fetch(
        `${API_BASE}/api/v1/techmap/topic/${topicId}`,
        { cache: "no-store" }
      );
      if (!weekRes.ok) throw new Error(`API error: ${weekRes.status}`);
      setWeekData(await weekRes.json());

      if (topicAccess.timelineWeeks > 0) {
        const timelineRes = await fetch(
          `${API_BASE}/api/v1/techmap/topic/${topicId}/timeline?weeks=${topicAccess.timelineWeeks}`,
          { cache: "no-store" }
        );
        if (timelineRes.ok) {
          setTimelineData(await timelineRes.json());
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [topicId, topicAccess.timelineWeeks]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clusterCount = weekData?.clusters?.length || 0;
  const evidenceCount = weekData
    ? weekData.clusters.reduce((sum, c) => sum + (c.evidence?.length || 0), 0)
    : 0;

  const hasTimelineAccess = topicAccess.timelineWeeks > 0;
  const timelineGateType = topicAccess.gateType;

  return (
    <div className={styles.page}>
      <AgentHeader
        domain={domain}
        title={title}
        description={description}
        meta={[
          { label: "Topics this week", value: String(clusterCount) },
          { label: "Sources", value: String(evidenceCount) },
          { label: "Status", value: <StatusBadge status="live" /> },
        ]}
      />

      <div className={styles.controlsBar}>
        <div />
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewTab} ${view === "week" ? styles.viewTabActive : ""}`}
            onClick={() => setView("week")}
          >
            This week
          </button>

          {hasTimelineAccess ? (
            <button
              className={`${styles.viewTab} ${view === "timeline" ? styles.viewTabActive : ""}`}
              onClick={() => setView("timeline")}
            >
              Timeline{topicAccess.timelineWeeks < 8 ? ` (${topicAccess.timelineWeeks}w)` : ""}
            </button>
          ) : timelineGateType === "auth" ? (
            <div className={styles.viewTabLockedWrap}>
              <button
                className={`${styles.viewTab} ${styles.viewTabLocked}`}
                onClick={() => login(window.location.pathname)}
              >
                Timeline
              </button>
              <div className={styles.viewTabTooltip}>Sign in to access timeline</div>
            </div>
          ) : timelineGateType === "pro" ? (
            <div className={styles.viewTabLockedWrap}>
              <button
                className={`${styles.viewTab} ${styles.viewTabLocked}`}
                onClick={() => setView("timeline")}
              >
                Timeline
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}>
                  <rect x="4" y="7" width="8" height="7" rx="1" />
                  <path d="M6 7V5a2 2 0 114 0v2" />
                </svg>
              </button>
              <div className={styles.viewTabTooltip}>Upgrade to Pro for timeline</div>
            </div>
          ) : null}
        </div>
      </div>

      {weekData && !loading && view === "week" && (
        <div className={styles.companyHeader}>
          <h2 className={styles.companyTitle}>
            {weekData.company || label}
          </h2>
          <p className={styles.companySubtitle}>
            Week of {formatWeekRange(weekData.weekStartUtc, weekData.weekEndUtc)}
            <span className={styles.companyTopicCount}>
              {clusterCount} topic{clusterCount !== 1 ? "s" : ""}
            </span>
          </p>
        </div>
      )}

      <main className={styles.content}>
        {loading && <LoadingState message={`Loading ${label} weekly brief...`} />}
        {error && <ErrorState message={error} onRetry={loadData} />}

        {!loading && !error && view === "week" && weekData && (
          <WeekView data={weekData} />
        )}

        {!loading && !error && view === "timeline" && hasTimelineAccess && timelineData && (
          <TimelineView data={timelineData} />
        )}

        {!loading && !error && view === "timeline" && !hasTimelineAccess && (
          <AccessGate
            requires={timelineGateType as "auth" | "pro"}
            featureLabel="the weekly timeline"
          >
            <div />
          </AccessGate>
        )}
      </main>
    </div>
  );
}