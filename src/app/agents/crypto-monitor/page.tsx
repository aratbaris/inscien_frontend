"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchAgentBrief } from "@/lib/api";
import type { BriefResponse, BriefItem, AvailableDate } from "@/lib/types";
import { AccessGate } from "@/components/AccessGate";
import { useAuth } from "@/lib/auth";
import styles from "./page.module.css";

function formatSource(source: string): string {
  return source.toUpperCase().replace(/^WWW\./, "");
}

function formatTimestamp(ts: string): string {
  if (!ts) return "";
  return ts.replace("T", " ").replace("Z", "").substring(0, 16);
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      <p>No items for this date.</p>
      <p className={styles.emptyHint}>
        This can happen on days with no material crypto regulatory actions or incidents.
      </p>
    </div>
  );
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

export default function CryptoRegulationMonitorPage() {
  const [data, setData] = useState<BriefResponse | null>(null);
  const [selectedDay, setSelectedDay] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canAccess, login } = useAuth();

  const loadBrief = useCallback(async (day: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAgentBrief("crypto", day);
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
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <a href="/" className={styles.backLink}>
            ← FinanceLab
          </a>
        </div>
        <div className={styles.headerMain}>
          <div>
            <div className={styles.agentDomain}>Crypto</div>
            <h1 className={styles.agentTitle}>Crypto Regulation & Incidents</h1>
            <p className={styles.agentDesc}>
              Regulatory enforcement, exchange hacks, stablecoin and custody
              events, and licensing actions affecting crypto markets and
              infrastructure. No price commentary or market speculation.
            </p>
          </div>
          <div className={styles.agentMeta}>
            <div className={styles.metaItem}>
              <div className={styles.metaVal}>Daily</div>
              <div className={styles.metaKey}>Cadence</div>
            </div>
            <div className={styles.metaItem}>
              <div className={styles.metaVal}>3-8</div>
              <div className={styles.metaKey}>Items per day</div>
            </div>
            <div className={styles.metaItem}>
              <div className={styles.statusLive}>Live</div>
              <div className={styles.metaKey}>Status</div>
            </div>
          </div>
        </div>
      </header>

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
        {loading && (
          <div className={styles.loading}>Loading brief...</div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button
              onClick={() => loadBrief(selectedDay)}
              className={styles.retry}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && data && data.items.length === 0 && (
          <EmptyState />
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