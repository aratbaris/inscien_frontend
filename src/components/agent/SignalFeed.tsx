"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchAgentBrief } from "@/lib/api";
import type { BriefResponse, BriefItem, AvailableDate } from "@/lib/types";
import { AgentHeader, StatusBadge, LoadingState, ErrorState, EmptyState } from "@/components/agent";
import { AccessGate } from "@/components/AccessGate";
import { useAuth } from "@/lib/auth";
import { getSignalFeedAccess } from "@/lib/agent-access";
import styles from "./signal-feed.module.css";

// ─── Config ───

interface SignalFeedProps {
  /** API agent key passed to fetchAgentBrief (e.g. "macro", "cyber", "regulatory") */
  agentKey: string;
  /** AgentHeader domain label */
  domain: string;
  /** AgentHeader title */
  title: string;
  /** AgentHeader description */
  description: string;
  /** Empty state hint shown when no signals exist */
  emptyHint?: string;
  /** Cadence label shown in header (default: "Daily") */
  cadence?: string;
  /** Group items by monitor_name within each date (for weekly cross brief) */
  groupByMonitor?: boolean;
}

/** Display order for monitor sections in weekly view */
const MONITOR_ORDER: Record<string, number> = {
  "G10 Macro Releases": 1,
  "Oil Market Monitor": 2,
  "Public Company Cyber Risk": 3,
  "Crypto Regulatory Shifts": 4,
  "Crypto ETF Access": 5,
};

interface MonitorSection {
  monitorName: string;
  items: BriefItem[];
}

function groupItemsByMonitor(items: BriefItem[]): MonitorSection[] {
  const map = new Map<string, BriefItem[]>();
  for (const item of items) {
    const name = (item as any).monitor_name || "Other";
    if (!map.has(name)) map.set(name, []);
    map.get(name)!.push(item);
  }
  const sections: MonitorSection[] = [];
  for (const [monitorName, monitorItems] of map) {
    sections.push({ monitorName, items: monitorItems });
  }
  sections.sort((a, b) => {
    const oa = MONITOR_ORDER[a.monitorName] ?? 99;
    const ob = MONITOR_ORDER[b.monitorName] ?? 99;
    return oa - ob;
  });
  return sections;
}

// ─── Helpers ───

function formatSource(source: string): string {
  return source.toUpperCase().replace(/^WWW\./, "");
}

function formatTimestamp(ts: string): string {
  if (!ts) return "";
  return ts.replace("T", " ").replace("Z", "").substring(0, 16);
}

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return `${months[m]} ${d}, ${parts[0]}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round(Math.abs(da.getTime() - db.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Types ───

interface DateGroup {
  dateKey: string;
  dateLabel: string;
  items: BriefItem[];
}

// ─── Sub-components ───

function ItemCard({ item }: { item: BriefItem }) {
  return (
    <a
      href={item.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.item}
    >
      <div className={styles.itemMeta}>
        <span className={styles.itemSource}>{formatSource(item.source)}</span>
        <span className={styles.itemTime}>{formatTimestamp(item.timestamp)}</span>
      </div>
      <h3 className={styles.itemTitle}>{item.title}</h3>
      {item.extended_headline && (
        <p className={styles.itemExtended}>{item.extended_headline}</p>
      )}
    </a>
  );
}

function GapSpacer() {
  return <div className={styles.gapSpacer} />;
}

function AnchorDate({ dateKey }: { dateKey: string }) {
  return (
    <div className={styles.anchorDate}>
      <div className={styles.anchorDateInner}>
        <div className={styles.quietDot} />
        <span className={styles.quietLabel}>{formatDateLabel(dateKey)}</span>
      </div>
    </div>
  );
}

function MonitorSectionHeader({ name, count }: { name: string; count: number }) {
  return (
    <div className={styles.monitorSection}>
      <span className={styles.monitorName}>{name}</span>
      <span className={styles.monitorCount}>
        {count} item{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

// ─── Main Component ───

export default function SignalFeed({
  agentKey,
  domain,
  title,
  description,
  emptyHint = "No signals yet. This monitor surfaces items only when material events occur.",
  cadence = "Daily",
  groupByMonitor = false,
}: SignalFeedProps) {
  const [dateGroups, setDateGroups] = useState<DateGroup[]>([]);
  const [anchorDate, setAnchorDate] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const auth = useAuth();
  const { canAccess, login, tier } = auth;

  // Auth may still be resolving
  const authReady = "loading" in auth ? !(auth as any).loading : "user" in auth ? (auth as any).user !== undefined : true;
  const isAuthenticated = authReady && canAccess("auth");

  // Resolve access from centralized config
  const feedAccess = useMemo(
    () => getSignalFeedAccess(agentKey, authReady ? tier : "anon"),
    [agentKey, tier, authReady]
  );

  useEffect(() => {
    if (!authReady) return;

    // Pro-only monitors: don't fetch if auth user has 0 days
    if (feedAccess.days === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadFeed() {
      setLoading(true);
      setError(null);

      try {
        const latest = await fetchAgentBrief(agentKey, "latest");

        const allDates = latest.available_dates.map((d: AvailableDate) => d.key);
        const datesToFetch = allDates.slice(0, feedAccess.days);

        if (datesToFetch.length === 0) {
          datesToFetch.push(latest.day_key);
        }

        const BATCH_SIZE = 10;
        const groups: DateGroup[] = [];
        let total = 0;

        for (let i = 0; i < datesToFetch.length; i += BATCH_SIZE) {
          if (cancelled) return;
          const batch = datesToFetch.slice(i, i + BATCH_SIZE);
          const results = await Promise.all(
            batch.map((dayKey: string) =>
              fetchAgentBrief(agentKey, dayKey).catch(() => null)
            )
          );

          for (const res of results) {
            if (!res || (res as BriefResponse).items.length === 0) continue;
            const r = res as BriefResponse;
            groups.push({
              dateKey: r.day_key,
              dateLabel: r.day_label || r.day_key,
              items: r.items,
            });
            total += r.items.length;
          }
        }

        if (cancelled) return;

        groups.sort((a, b) => b.dateKey.localeCompare(a.dateKey));

        const topDate = latest.available_dates.length > 0
          ? latest.available_dates[0].key
          : latest.day_key;
        setAnchorDate(topDate);

        setDateGroups(groups);
        setTotalCount(total);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load feed");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFeed();

    return () => { cancelled = true; };
  }, [agentKey, authReady, feedAccess.days, retryKey]);

  // Pro-only monitor: auth users who have 0 days see AccessGate
  const isProBlocked = authReady && isAuthenticated && feedAccess.days === 0 && feedAccess.gateType === "pro";

  return (
    <div className={styles.page}>
      <AgentHeader
        domain={domain}
        title={title}
        description={description}
        meta={[
          { label: "Cadence", value: cadence },
          { label: "Status", value: <StatusBadge status="live" /> },
        ]}
      />

      {/* Pro-only gate for authenticated free users on gated monitors */}
      {isProBlocked && (
        <AccessGate requires="pro" featureLabel="this monitor">
          <div />
        </AccessGate>
      )}

      {/* Main content - only render if not pro-blocked */}
      {!isProBlocked && (
        <>
          {(!authReady || loading) && (
            <div className={styles.timeline}>
              <LoadingState message={!authReady ? "Preparing feed…" : "Loading feed…"} />
            </div>
          )}

          {authReady && error && (
            <div className={styles.timeline}>
              <ErrorState message={error} onRetry={() => setRetryKey((k) => k + 1)} />
            </div>
          )}

          {authReady && !loading && !error && dateGroups.length === 0 && (
            <div className={styles.timeline}>
              <div className={styles.emptyTimeline}>
                <div className={styles.emptyTitle}>No items</div>
                <div className={styles.emptyHint}>{emptyHint}</div>
              </div>
              {feedAccess.gateType === "auth" && (
                <AccessGate requires="auth" featureLabel="the full history">
                  <div />
                </AccessGate>
              )}
            </div>
          )}

          {authReady && !loading && !error && dateGroups.length > 0 && (
            <div className={styles.timeline}>
              {/* Anchor: show latest date as quiet node if it has no items */}
              {anchorDate && dateGroups[0].dateKey !== anchorDate && (
                <>
                  <AnchorDate dateKey={anchorDate} />
                  <GapSpacer />
                </>
              )}

              {dateGroups.map((group, groupIdx) => {
                const prevGroup = groupIdx > 0 ? dateGroups[groupIdx - 1] : null;
                const showGap = prevGroup && daysBetween(prevGroup.dateKey, group.dateKey) > 1;

                return (
                  <div key={group.dateKey}>
                    {showGap && <GapSpacer />}

                    <div className={styles.dateGroup}>
                      <div className={styles.dateHeader}>
                        <div className={styles.dateDot} />
                        <span className={styles.dateLabel}>
                          {formatDateLabel(group.dateKey)}
                        </span>
                        <span className={styles.dateCount}>
                          {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className={styles.dateItems}>
                        {groupByMonitor ? (
                          groupItemsByMonitor(group.items).map((section) => (
                            <div key={section.monitorName} className={styles.monitorGroup}>
                              <MonitorSectionHeader
                                name={section.monitorName}
                                count={section.items.length}
                              />
                              {section.items.map((item, idx) => (
                                <ItemCard key={`${item.title}-${idx}`} item={item} />
                              ))}
                            </div>
                          ))
                        ) : (
                          group.items.map((item, idx) => (
                            <ItemCard key={`${item.title}-${idx}`} item={item} />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bottom gate: consistent AccessGate card */}
              {feedAccess.gateType === "auth" && (
                <AccessGate requires="auth" featureLabel="the full history">
                  <div />
                </AccessGate>
              )}
              {feedAccess.gateType === "pro" && feedAccess.days > 0 && (
                <AccessGate requires="pro" featureLabel="the full history">
                  <div />
                </AccessGate>
              )}
            </div>
          )}

          {/* Footer */}
          {authReady && !loading && !error && dateGroups.length > 0 && (
            <div className={styles.footer}>
              <span>
                {totalCount} item{totalCount !== 1 ? "s" : ""} across {dateGroups.length} {cadence === "Weekly" ? "week" : "day"}{dateGroups.length !== 1 ? "s" : ""}
              </span>
              <span>Times shown in UTC</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}