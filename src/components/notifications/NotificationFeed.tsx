"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { fetchNotifications } from "@/lib/api";
import type { NotificationsResponse, NotificationWeek, TopicNotification } from "@/lib/types";
import styles from "./NotificationFeed.module.css";

// ─── Topic labels ───

const TOPIC_LABELS: Record<string, string> = {
  cyber: "Cyber Risk",
  macro: "Macro",
  oil: "Oil",
  regulatory: "Crypto Regulatory",
  crypto: "Crypto ETF",
};

// ─── Formatters ───

function topicLabel(n: TopicNotification): string {
  return TOPIC_LABELS[n.topic_id] || n.topic_name;
}

function fmtDate(ts: string): string {
  if (!ts) return "";
  const d = ts.substring(0, 10);
  if (d.length !== 10) return d;
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [y, m, day] = d.split("-").map(Number);
  return `${mo[m - 1]} ${day}, ${y}`;
}

function fmtWeekRange(start: string, end: string): string {
  if (!start || !end) return "";
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  if (sy === ey && sm === em) return `${mo[sm - 1]} ${sd}–${ed}, ${sy}`;
  return `${mo[sm - 1]} ${sd} – ${mo[em - 1]} ${ed}, ${ey}`;
}

function fmtWeekOption(w: NotificationWeek): string {
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (!w.week_end) return "Unknown";
  const [y, m, d] = w.week_end.split("-").map(Number);
  return `Week ending ${mo[m - 1]} ${d}, ${y}`;
}

function fmtSource(source: string): string {
  return source.toUpperCase().replace(/^WWW\./, "");
}

// ─── Share helpers ───

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://financelab.ai";

function shareUrl(n: TopicNotification): string {
  return `${SITE_URL}/share/weekly/${n.week_end}/${n.topic_id}`;
}

function shareText(n: TopicNotification): string {
  const label = topicLabel(n);
  const lines = [`${label} — Weekly Highlights`, ""];
  for (const item of n.items.slice(0, 3)) lines.push(`• ${item.title}`);
  if (n.items.length > 3) lines.push(`  +${n.items.length - 3} more`);
  lines.push("", shareUrl(n));
  return lines.join("\n");
}

// ─── Component ───

interface NotificationFeedProps {
  onCountChange?: (count: number) => void;
}

export default function NotificationFeed({ onCountChange }: NotificationFeedProps) {
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState("latest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [shareOpenId, setShareOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchNotifications(selectedWeek);
        if (!cancelled) {
          setData(res);
          // auto-expand first topic
          if (res.notifications.length > 0) {
            setExpandedId(res.notifications[0].notification_id);
          }
          if (selectedWeek === "latest" && onCountChange) {
            onCountChange(res.notification_count || 0);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedWeek, onCountChange]);

  const toggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setShareOpenId(null);
  }, []);

  // Close share popover on outside click
  useEffect(() => {
    if (!shareOpenId) return;
    function handleClick(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpenId(null);
        setCopied(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [shareOpenId]);

  const handleCopyLink = useCallback((n: TopicNotification) => {
    navigator.clipboard.writeText(shareUrl(n)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, []);

  const handleShareX = useCallback((n: TopicNotification) => {
    const text = encodeURIComponent(shareText(n));
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
    setShareOpenId(null);
  }, []);

  const handleShareLinkedIn = useCallback((n: TopicNotification) => {
    const url = shareUrl(n);
    window.open(
      "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url),
      "_blank"
    );
    setShareOpenId(null);
  }, []);

  const weeks = data?.available_weeks || [];

  // ─── Loading ───
  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.center}><span className={styles.muted}>Loading…</span></div>
      </div>
    );
  }

  // ─── Error ───
  if (error) {
    return (
      <div className={styles.wrap}>
        <div className={styles.center}>
          <span className={styles.error}>{error}</span>
          <button className={styles.retryBtn} onClick={() => setSelectedWeek(selectedWeek)}>Retry</button>
        </div>
      </div>
    );
  }

  // ─── Empty ───
  if (!data || weeks.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.center}>
          <span className={styles.muted}>No weekly highlights yet.</span>
        </div>
      </div>
    );
  }

  const weekLabel = fmtWeekRange(data.week_start, data.week_end);
  const totalItems = data.notifications.reduce((sum, n) => sum + n.item_count, 0);

  return (
    <div className={styles.wrap}>
      {/* ─── Header row ─── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Monitoring Weekly Highlights</h2>
          {weekLabel && <span className={styles.weekRange}>{weekLabel}</span>}
        </div>
        {weeks.length > 1 && (
          <select
            className={styles.weekPicker}
            value={selectedWeek === "latest" ? weeks[0]?.week_end || "" : selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            {weeks.map((w) => (
              <option key={w.week_end} value={w.week_end}>{fmtWeekOption(w)}</option>
            ))}
          </select>
        )}
      </div>

      {/* ─── Quiet week ─── */}
      {data.notifications.length === 0 ? (
        <div className={styles.panel}>
          <div className={styles.quietRow}>Quiet week — no significant developments.</div>
        </div>
      ) : (
        /* ─── Grouped list panel ─── */
        <div className={styles.panel}>
          {data.notifications.map((notif, idx) => {
            const isOpen = expandedId === notif.notification_id;
            return (
              <div key={notif.notification_id} className={`${styles.section} ${isOpen ? styles.sectionOpen : ""}`}>
                {/* Disclosure row */}
                <button
                  className={`${styles.row} ${isOpen ? styles.rowOpen : ""}`}
                  onClick={() => toggle(notif.notification_id)}
                  aria-expanded={isOpen}
                >
                  <span className={styles.rowLabel}>{topicLabel(notif)}</span>
                  <span className={styles.rowRight}>
                    <span className={styles.count}>{notif.item_count}</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                    >
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                {/* Expanded items */}
                {isOpen && (
                  <div className={styles.disclosure}>
                    <div className={styles.disclosureInner}>
                      {notif.items.map((item, i) => (
                        <a
                          key={`${item.title}-${i}`}
                          href={item.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.item}
                        >
                          <div className={styles.itemMeta}>
                            <span className={styles.itemSource}>{fmtSource(item.source)}</span>
                            <span className={styles.itemDate}>{fmtDate(item.timestamp)}</span>
                          </div>
                          <span className={styles.itemTitle}>{item.title}</span>
                        </a>
                      ))}
                    </div>

                    {/* Footer actions */}
                    <div className={styles.disclosureFooter}>
                      <a href={notif.agent_path} className={styles.monitorBtn}>
                        <span>View monitor</span>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                      <div className={styles.shareWrap} ref={shareOpenId === notif.notification_id ? shareRef : undefined}>
                        <button
                          className={styles.shareTrigger}
                          onClick={() => {
                            setShareOpenId((prev) => prev === notif.notification_id ? null : notif.notification_id);
                            setCopied(false);
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M4 8V13a1 1 0 001 1h6a1 1 0 001-1V8M11 4L8 1M8 1L5 4M8 1v9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>Share</span>
                        </button>

                        {shareOpenId === notif.notification_id && (
                          <div className={styles.sharePopover}>
                            <button className={styles.shareOption} onClick={() => handleCopyLink(notif)}>
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5L9.5 6.5M7 11L5.5 12.5a2.12 2.12 0 01-3-3L4 8m4-3l1.5-1.5a2.12 2.12 0 013 3L11 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              <span>{copied ? "Copied!" : "Copy link"}</span>
                            </button>
                            <button className={styles.shareOption} onClick={() => handleShareX(notif)}>
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M12.6 2H14.7L10 7.4L15.5 14H11.1L7.6 9.6L3.6 14H1.5L6.5 8.2L1.2 2H5.7L8.9 6L12.6 2ZM11.9 12.7H13L5 3.3H3.9L11.9 12.7Z" fill="currentColor"/></svg>
                              <span>Share on X</span>
                            </button>
                            <button className={styles.shareOption} onClick={() => handleShareLinkedIn(notif)}>
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4.5 6.5V12M7.5 12V9.5C7.5 8.4 8.4 7.5 9.5 7.5C10.6 7.5 11.5 8.4 11.5 9.5V12M4.5 4.5V4.51" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/></svg>
                              <span>Share on LinkedIn</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}


              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}