"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "@/components/agent/topic-map.module.css";
import { AgentHeader, StatusBadge, LoadingState, ErrorState, EmptyState } from "@/components/agent";
import { AccessGate } from "@/components/AccessGate";
import { useAuth } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOPIC_ID = "semis_supply_chain";

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

// ─── Helpers ───

function formatWeekRange(start: string, end: string): string {
  if (!start || !end) return "";
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const fmt = (d: string) => {
    const parts = d.split("-");
    if (parts.length !== 3) return d;
    const m = parseInt(parts[1], 10) - 1;
    return `${months[m]} ${parseInt(parts[2], 10)}`;
  };
  return `${fmt(start)} - ${fmt(end)}`;
}

function formatEvidenceDate(ts: string): string {
  if (!ts) return "";
  const d = ts.substring(0, 10);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  const m = parseInt(parts[1], 10) - 1;
  return `${months[m]} ${parseInt(parts[2], 10)}`;
}

// ─── Components ───

function EvidenceCard({ item }: { item: EvidenceItem }) {
  return (
    <a
      href={item.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.evidenceCard}
    >
      <div className={styles.evidenceTitle}>{item.title}</div>
      <div className={styles.evidenceMeta}>
        <span className={styles.evidenceSource}>{item.source}</span>
        {item.timestamp && (
          <>
            <span className={styles.evidenceDot}>·</span>
            <span>{formatEvidenceDate(item.timestamp)}</span>
          </>
        )}
      </div>
    </a>
  );
}

function ClusterCard({
  cluster,
  defaultOpen,
}: {
  cluster: Cluster;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen || false);

  return (
    <div className={styles.clusterCard}>
      <button
        className={styles.clusterHeader}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={styles.clusterInfo}>
          <h3 className={styles.clusterLabel}>{cluster.label}</h3>
          <div className={styles.clusterStats}>
            <span className={styles.clusterCount}>
              {cluster.evidence.length} sources
            </span>
          </div>
        </div>
        <span className={styles.clusterToggle}>{expanded ? "−" : "+"}</span>
      </button>

      <div className={styles.clusterTakeaways}>
        {cluster.takeaways.map((t, i) => (
          <div key={i} className={styles.takeaway}>
            {t}
          </div>
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

// ─── Week View ───

function WeekView({ data }: { data: WeeklyBrief }) {
  return (
    <div className={styles.weekView}>
      <div className={styles.weekMeta}>
        <span className={styles.weekRange}>
          {formatWeekRange(data.weekStartUtc, data.weekEndUtc)}
        </span>
        <span className={styles.weekClusterCount}>
          {data.clusters.length} topic{data.clusters.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className={styles.clusterList}>
        {data.clusters.map((cluster, idx) => (
          <ClusterCard
            key={cluster.label}
            cluster={cluster}
            defaultOpen={idx === 0}
          />
        ))}
      </div>
      {data.clusters.length === 0 && (
        <EmptyState message="No clusters for this week." />
      )}
    </div>
  );
}

// ─── Timeline View ───

function TimelineView({ data }: { data: TimelineResponse }) {
  const [expandedWeek, setExpandedWeek] = useState<string | null>(
    data.weeks.length > 0 ? data.weeks[0].weekKey : null
  );

  return (
    <div className={styles.timeline}>
      {data.weeks.map((week) => {
        const isExpanded = expandedWeek === week.weekKey;
        return (
          <div key={week.weekKey} className={styles.timelineWeek}>
            <button
              className={styles.timelineWeekHeader}
              onClick={() =>
                setExpandedWeek(isExpanded ? null : week.weekKey)
              }
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
              <span className={styles.timelineWeekToggle}>
                {isExpanded ? "−" : "+"}
              </span>
            </button>

            {isExpanded && (
              <div className={styles.timelineWeekBody}>
                {week.clusters.map((cluster) => (
                  <div key={cluster.label} className={styles.timelineCluster}>
                    <div className={styles.timelineClusterHeader}>
                      <span className={styles.timelineClusterLabel}>
                        {cluster.label}
                      </span>
                      <span className={styles.timelineClusterCount}>
                        {cluster.evidenceCount} sources
                      </span>
                    </div>
                    <div className={styles.timelineClusterTakeaways}>
                      {cluster.takeaways.map((t, i) => (
                        <div key={i} className={styles.takeaway}>
                          {t}
                        </div>
                      ))}
                    </div>
                    {cluster.evidence && cluster.evidence.length > 0 && (
                      <div className={styles.timelineClusterEvidence}>
                        {cluster.evidence.map((ev, idx) => (
                          <EvidenceCard key={`${ev.url}-${idx}`} item={ev} />
                        ))}
                      </div>
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

// ─── Main Page ───

export default function SemisSupplyChainPage() {
  const [view, setView] = useState<"week" | "timeline">("week");
  const [weekData, setWeekData] = useState<WeeklyBrief | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canAccess, login } = useAuth();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWeekData(null);
    setTimelineData(null);
    try {
      const [weekRes, timelineRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/techmap/topic/${TOPIC_ID}`, {
          cache: "no-store",
        }),
        fetch(
          `${API_BASE}/api/v1/techmap/topic/${TOPIC_ID}/timeline?weeks=8`,
          { cache: "no-store" }
        ),
      ]);
      if (!weekRes.ok) throw new Error(`API error: ${weekRes.status}`);
      if (!timelineRes.ok)
        throw new Error(`Timeline API error: ${timelineRes.status}`);
      setWeekData(await weekRes.json());
      setTimelineData(await timelineRes.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clusterCount = weekData?.clusters?.length || 0;
  const evidenceCount = weekData
    ? weekData.clusters.reduce(
        (sum, c) => sum + (c.evidence?.length || 0),
        0
      )
    : 0;

  const hasTimeline = canAccess("auth");

  return (
    <div className={styles.page}>
      <AgentHeader
        domain="Industry"
        title="Semiconductors & Supply Chain"
        description="Weekly wrap-up of chip industry developments including fab investments, export controls, supply constraints, packaging advances, and major design wins across the semiconductor ecosystem."
        meta={[
          { label: "Topics this week", value: String(clusterCount) },
          { label: "Sources", value: String(evidenceCount) },
          { label: "Status", value: <StatusBadge status="live" /> },
        ]}
      />

      <div className={styles.controlsBar}>
        {/* No company selector - single-topic page */}
        <div />
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewTab} ${view === "week" ? styles.viewTabActive : ""}`}
            onClick={() => setView("week")}
          >
            This week
          </button>
          {hasTimeline ? (
            <button
              className={`${styles.viewTab} ${view === "timeline" ? styles.viewTabActive : ""}`}
              onClick={() => setView("timeline")}
            >
              Timeline
            </button>
          ) : (
            <div className={styles.viewTabLockedWrap}>
              <button
                className={`${styles.viewTab} ${styles.viewTabLocked}`}
                onClick={() => login(window.location.pathname)}
              >
                Timeline
              </button>
              <div className={styles.viewTabTooltip}>
                Sign in to access timeline
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Week subheader */}
      {weekData && !loading && (
        <div className={styles.companyHeader}>
          <p className={styles.companySubtitle}>
            Week of{" "}
            {formatWeekRange(weekData.weekStartUtc, weekData.weekEndUtc)}
          </p>
        </div>
      )}

      <main className={styles.content}>
        {loading && <LoadingState message="Loading weekly brief…" />}
        {error && (
          <ErrorState message={error} onRetry={() => loadData()} />
        )}
        {!loading && !error && view === "week" && weekData && (
          <WeekView data={weekData} />
        )}
        {!loading &&
          !error &&
          view === "timeline" &&
          hasTimeline &&
          timelineData && <TimelineView data={timelineData} />}
        {!loading &&
          !error &&
          view === "timeline" &&
          !hasTimeline && (
            <AccessGate requires="auth" featureLabel="the weekly timeline">
              <div />
            </AccessGate>
          )}
      </main>
    </div>
  );
}