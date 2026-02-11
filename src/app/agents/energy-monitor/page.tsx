"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchAgentBrief } from "@/lib/api";
import type { BriefResponse, BriefItem, AvailableDate } from "@/lib/types";
import { AgentHeader, StatusBadge, LoadingState, ErrorState, EmptyState } from "@/components/agent";
import { useAuth } from "@/lib/auth";
import styles from "@/components/agent/daily-brief.module.css";

function formatSource(source: string): string {
  return source.toUpperCase().replace(/^WWW\./, "");
}

function formatTimestamp(ts: string): string {
  if (!ts) return "";
  return ts.replace("T", " ").replace("Z", "").substring(0, 16);
}

function BriefItemCard({ item }: { item: BriefItem }) {
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

export default function OilSupplyMonitorPage() {
  const [data, setData] = useState<BriefResponse | null>(null);
  const [selectedDay, setSelectedDay] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canAccess, login } = useAuth();

  const loadBrief = useCallback(async (day: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAgentBrief("oil", day);
      setData(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load brief");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrief(selectedDay);
  }, [selectedDay, loadBrief]);

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDay(e.target.value);
  };

  const hasHistory = canAccess("auth");

  return (
    <div className={styles.page}>
      <AgentHeader
        domain="Energy"
        title="Oil Supply Monitor"
        description="Tracks crude supply disruptions, OPEC actions, sanctions enforcement, and chokepoint incidents that can materially affect oil flows."
        meta={[
          { label: "Cadence", value: "Daily" },
          { label: "Items per day", value: "3-10" },
          { label: "Status", value: <StatusBadge status="live" /> },
        ]}
      />

      <div className={styles.controls}>
        <div className={styles.controlsLeft}>
          {data && (
            <span className={styles.briefDate}>
              Brief for {data.day_label || data.day_key}
            </span>
          )}
        </div>
        <div className={styles.controlsRight}>
          {hasHistory ? (
            <>
              <label className={styles.dayLabel} htmlFor="day-select">
                Date
              </label>
              <select
                id="day-select"
                className={styles.daySelect}
                value={selectedDay}
                onChange={handleDayChange}
              >
                <option value="latest">Latest</option>
                {data?.available_dates.map((d: AvailableDate) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <button
              className={styles.signInHint}
              onClick={() => login(window.location.pathname)}
            >
              Sign in for history →
            </button>
          )}
        </div>
      </div>

      <main className={styles.content}>
        {loading && <LoadingState message="Loading brief…" />}
        {error && <ErrorState message={error} onRetry={() => loadBrief(selectedDay)} />}

        {!loading && !error && data && data.items.length === 0 && (
          <EmptyState
            message="No items for this date."
            hint="This can happen on days with no material supply disruptions or policy actions."
          />
        )}

        {!loading && !error && data && data.items.length > 0 && (
          <div className={styles.items}>
            {data.items.map((item: BriefItem, idx: number) => (
              <BriefItemCard key={`${item.title}-${idx}`} item={item} />
            ))}
          </div>
        )}

        {!loading && !error && data && (
          <div className={styles.footer}>
            <span>
              {data.item_count} item{data.item_count !== 1 ? "s" : ""}
            </span>
            <span>Times shown in UTC</span>
          </div>
        )}
      </main>
    </div>
  );
}