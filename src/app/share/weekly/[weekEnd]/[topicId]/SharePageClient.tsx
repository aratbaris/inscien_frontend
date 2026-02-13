"use client";

import { useEffect, useState } from "react";
import styles from "./SharePage.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ShareItem {
  title: string;
  source: string;
  url: string;
  timestamp: string;
}

interface ShareData {
  topic_id: string;
  topic_label: string;
  week_end: string;
  week_start: string;
  headline: string;
  summary: string;
  items: ShareItem[];
  item_count: number;
}

function fmtDate(ts: string): string {
  if (!ts) return "";
  const d = ts.substring(0, 10);
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [y, m, day] = d.split("-").map(Number);
  if (!m || !day) return d;
  return `${mo[m - 1]} ${day}, ${y}`;
}

function fmtSource(s: string): string {
  return s.toUpperCase().replace(/^WWW\./, "");
}

interface SharePageClientProps {
  weekEnd: string;
  topicId: string;
}

export default function SharePageClient({ weekEnd, topicId }: SharePageClientProps) {
  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/share/weekly/${weekEnd}/${topicId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Not found`);
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [weekEnd, topicId]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.center}>Loading…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.page}>
        <div className={styles.center}>
          <h1 className={styles.errorTitle}>Not Found</h1>
          <p className={styles.errorDesc}>This weekly highlight is no longer available.</p>
          <a href="/" className={styles.ctaBtn}>Go to FinanceLab</a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <span className={styles.brand}>FinanceLab</span>
          <span className={styles.headerSep}>·</span>
          <span className={styles.headerMeta}>Monitoring Weekly Highlights</span>
        </div>

        {/* Topic + week */}
        <h1 className={styles.topicTitle}>{data.topic_label}</h1>
        <p className={styles.weekRange}>Week ending {fmtDate(data.week_end)}</p>

        {/* Items */}
        <div className={styles.itemList}>
          {data.items.map((item, i) => (
            <a
              key={i}
              href={item.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.item}
            >
              <div className={styles.itemMeta}>
                <span className={styles.itemSource}>{fmtSource(item.source)}</span>
                <span className={styles.itemDate}>{fmtDate(item.timestamp)}</span>
              </div>
              <div className={styles.itemTitle}>{item.title}</div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className={styles.cardFooter}>
          <a href="/" className={styles.ctaBtn}>
            Explore all monitors on FinanceLab
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}