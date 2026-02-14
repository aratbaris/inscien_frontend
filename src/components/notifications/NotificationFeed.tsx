"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { fetchAnalysisEvents, fetchTechmapHighlights } from "@/lib/api";
import type {
  AnalysisEvent, AnalysisEventsResponse,
  TechmapHighlight, TechmapHighlightsResponse,
} from "@/lib/types";
import styles from "./NotificationFeed.module.css";

// ─── Constants ───

const READ_KEY = "financelab_read_notifications";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://financelab.ai";

// ─── Read state helpers ───

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
  } catch {}
}

// ─── Unified feed item type ───

interface FeedItem {
  id: string;
  type: "analysis" | "techmap" | "monitor-item";
  title: string;
  subtitle: string;
  date: string; // YYYY-MM-DD for grouping
  agentPath: string;
  agentLabel: string; // e.g. "Oil Market Monitor", "Apple Weekly Brief"
  // Type-specific data for expanded view
  analysisEvent?: AnalysisEvent;
  techmapHighlight?: TechmapHighlight;
  monitorItem?: { source: string; url: string };
}

// ─── Formatters ───

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDateShort(d: string): string {
  if (!d || d.length < 10) return d || "";
  const [, m, day] = d.split("-").map(Number);
  return `${MONTHS[m - 1]} ${day}`;
}

function fmtSource(source: string): string {
  return source.toUpperCase().replace(/^WWW\./, "");
}

function fmtDayLabel(dateStr: string): string {
  if (!dateStr) return "Unknown";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(dateStr + "T00:00:00");

  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";

  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Within last 7 days: show day name + date
  if (d > weekAgo) {
    return `${dayNames[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
  }

  // Older: show full date
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ─── Monitor topic labels + agent paths ───
// The daily monitor items come from weekly notifications API.
// Each notification has topic_id, agent_path, and items[].
// We flatten items into individual FeedItems.

const TOPIC_LABELS: Record<string, string> = {
  cyber: "Cyber Risk Monitor",
  macro: "G10 Macro Releases",
  oil: "Oil Market Monitor",
  regulatory: "Crypto Regulatory Shifts",
  crypto: "Crypto ETF Access",
};

// ─── Share helpers ───

function shareUrl(item: FeedItem): string {
  return `${SITE_URL}${item.agentPath}`;
}

// ─── Component ───

interface NotificationFeedProps {
  onCountChange?: (count: number) => void;
  favorites?: Set<string>;
  onGoToExplore?: () => void;
}

export default function NotificationFeed({
  onCountChange,
  favorites,
  onGoToExplore,
}: NotificationFeedProps) {
  const [analysisData, setAnalysisData] = useState<AnalysisEventsResponse | null>(null);
  const [techmapData, setTechmapData] = useState<TechmapHighlightsResponse | null>(null);
  const [monitorItems, setMonitorItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [shareOpenId, setShareOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  // Load read state
  useEffect(() => {
    setReadIds(loadReadIds());
  }, []);

  // Fetch data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Fetch analysis events (14 days) and techmap highlights (2 weeks)
        const [analysisRes, techmapRes] = await Promise.all([
          fetchAnalysisEvents("recent", undefined, 14),
          fetchTechmapHighlights(2),
        ]);

        if (cancelled) return;
        setAnalysisData(analysisRes);
        setTechmapData(techmapRes);

        // Fetch daily monitor data from the weekly notifications endpoint
        // We import fetchNotifications dynamically to flatten items
        const { fetchNotifications } = await import("@/lib/api");
        const weeklyRes = await fetchNotifications("latest");

        if (cancelled) return;

        // Flatten: each monitoring notification item becomes its own FeedItem
        const flatItems: FeedItem[] = [];
        if (weeklyRes?.notifications) {
          for (const notif of weeklyRes.notifications) {
            const label = TOPIC_LABELS[notif.topic_id] || notif.topic_name;
            for (const item of notif.items || []) {
              const itemDate = item.timestamp
                ? item.timestamp.substring(0, 10)
                : notif.week_end || "";
              flatItems.push({
                id: `monitor-${notif.topic_id}-${item.title.substring(0, 40)}-${itemDate}`,
                type: "monitor-item",
                title: item.title,
                subtitle: label,
                date: itemDate,
                agentPath: notif.agent_path,
                agentLabel: label,
                monitorItem: {
                  source: item.source,
                  url: item.url,
                },
              });
            }
          }
        }
        setMonitorItems(flatItems);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Build unified feed (all items, unfiltered)
  const allFeedItems: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = [];

    // Analysis events
    if (analysisData?.events) {
      for (const evt of analysisData.events) {
        items.push({
          id: evt.event_id,
          type: "analysis",
          title: evt.headline,
          subtitle: evt.detail,
          date: evt.date,
          agentPath: evt.agent_path,
          agentLabel: `${evt.ticker} Analysis`,
          analysisEvent: evt,
        });
      }
    }

    // Techmap highlights — date is the week_end value
    if (techmapData?.highlights) {
      for (const hl of techmapData.highlights) {
        items.push({
          id: `techmap-${hl.topic_id}-${hl.week_end || ""}`,
          type: "techmap",
          title: `${hl.company}: ${hl.headline}`,
          subtitle: hl.takeaways.slice(0, 2).join(". "),
          date: hl.week_end || hl.week_start || "",
          agentPath: hl.agent_path,
          agentLabel: `${hl.company} Weekly Brief`,
          techmapHighlight: hl,
        });
      }
    }

    // Daily monitor items (already flattened)
    items.push(...monitorItems);

    // Sort by date descending, then by title for same-date stability
    items.sort((a, b) => {
      const dc = (b.date || "").localeCompare(a.date || "");
      if (dc !== 0) return dc;
      return a.title.localeCompare(b.title);
    });

    return items;
  }, [analysisData, techmapData, monitorItems]);

  // Filter by bookmarks
  const feedItems: FeedItem[] = useMemo(() => {
    if (!favorites || favorites.size === 0) return [];
    return allFeedItems.filter((item) => favorites.has(item.agentPath));
  }, [allFeedItems, favorites]);

  // Group by individual date (YYYY-MM-DD)
  const groupedFeed: [string, FeedItem[]][] = useMemo(() => {
    const map = new Map<string, FeedItem[]>();
    for (const item of feedItems) {
      const dateKey = item.date.substring(0, 10) || "unknown";
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(item);
    }
    // Sort date keys descending (newest first)
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [feedItems]);

  // Unread count (filtered)
  const unreadCount = useMemo(() => {
    return feedItems.filter((item) => !readIds.has(item.id)).length;
  }, [feedItems, readIds]);

  // Report unread count to parent
  useEffect(() => {
    if (!loading && onCountChange) {
      onCountChange(unreadCount);
    }
  }, [unreadCount, loading, onCountChange]);

  // Mark helpers
  const markAsRead = useCallback((ids: string[]) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const markSectionAsRead = useCallback((items: FeedItem[]) => {
    markAsRead(items.map((i) => i.id));
  }, [markAsRead]);

  const markAllAsRead = useCallback(() => {
    markAsRead(feedItems.map((i) => i.id));
  }, [feedItems, markAsRead]);

  // Expand/collapse
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

  const openShare = useCallback((id: string, btnEl: HTMLButtonElement) => {
    if (shareOpenId === id) {
      setShareOpenId(null);
      setCopied(false);
      return;
    }
    const rect = btnEl.getBoundingClientRect();
    const spaceAbove = rect.top;
    const popoverHeight = 140;
    if (spaceAbove > popoverHeight + 8) {
      setPopoverStyle({
        position: "fixed",
        bottom: window.innerHeight - rect.top + 6,
        right: window.innerWidth - rect.right,
      });
    } else {
      setPopoverStyle({
        position: "fixed",
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
    setShareOpenId(id);
    setCopied(false);
  }, [shareOpenId]);

  const handleCopyLink = useCallback((item: FeedItem) => {
    navigator.clipboard.writeText(shareUrl(item)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, []);

  const handleShareX = useCallback((item: FeedItem) => {
    const text = encodeURIComponent(`${item.title}\n\n${shareUrl(item)}`);
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
    setShareOpenId(null);
  }, []);

  const handleShareLinkedIn = useCallback((item: FeedItem) => {
    const url = shareUrl(item);
    window.open(
      "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url),
      "_blank"
    );
    setShareOpenId(null);
  }, []);

  // ─── Share popover ───

  const renderSharePopover = (item: FeedItem) => {
    if (shareOpenId !== item.id) return null;
    return (
      <div className={styles.sharePopover} style={popoverStyle} ref={shareRef}>
        <button className={styles.shareOption} onClick={() => handleCopyLink(item)}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5L9.5 6.5M7 11L5.5 12.5a2.12 2.12 0 01-3-3L4 8m4-3l1.5-1.5a2.12 2.12 0 013 3L11 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>{copied ? "Copied!" : "Copy link"}</span>
        </button>
        <button className={styles.shareOption} onClick={() => handleShareX(item)}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M12.6 2H14.7L10 7.4L15.5 14H11.1L7.6 9.6L3.6 14H1.5L6.5 8.2L1.2 2H5.7L8.9 6L12.6 2ZM11.9 12.7H13L5 3.3H3.9L11.9 12.7Z" fill="currentColor"/></svg>
          <span>Share on X</span>
        </button>
        <button className={styles.shareOption} onClick={() => handleShareLinkedIn(item)}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4.5 6.5V12M7.5 12V9.5C7.5 8.4 8.4 7.5 9.5 7.5C10.6 7.5 11.5 8.4 11.5 9.5V12M4.5 4.5V4.51" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/></svg>
          <span>Share on LinkedIn</span>
        </button>
      </div>
    );
  };

  // ─── Type badge ───

  function typeBadge(item: FeedItem) {
    const labels: Record<string, string> = {
      analysis: "Analysis",
      techmap: "Brief",
      "monitor-item": "Monitor",
    };
    return <span className={styles.typeBadge}>{labels[item.type]}</span>;
  }

  // ─── Expanded content ───

  function renderExpanded(item: FeedItem) {
    if (item.type === "analysis" && item.analysisEvent) {
      const evt = item.analysisEvent;
      return (
        <div className={styles.disclosure}>
          <div className={styles.disclosureInner}>
            <p className={styles.eventDetail}>{evt.detail}</p>
          </div>
          <div className={styles.disclosureFooter}>
            <a href={evt.agent_path} className={styles.monitorBtn}>
              <span>View analysis</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <div className={styles.shareWrap}>
              <button className={styles.shareTrigger} onClick={(e) => openShare(item.id, e.currentTarget)}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 8V13a1 1 0 001 1h6a1 1 0 001-1V8M11 4L8 1M8 1L5 4M8 1v9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Share</span>
              </button>
              {renderSharePopover(item)}
            </div>
          </div>
        </div>
      );
    }

    if (item.type === "techmap" && item.techmapHighlight) {
      const hl = item.techmapHighlight;
      return (
        <div className={styles.disclosure}>
          <div className={styles.disclosureInner}>
            {hl.evidence.map((ev, i) => (
              <a key={`${ev.title}-${i}`} href={ev.url || "#"} target="_blank" rel="noopener noreferrer" className={styles.item}>
                <div className={styles.itemMeta}>
                  <span className={styles.itemSource}>{fmtSource(ev.source)}</span>
                  <span className={styles.itemDate}>{fmtDateShort(ev.timestamp)}</span>
                </div>
                <span className={styles.itemTitle}>{ev.title}</span>
              </a>
            ))}
          </div>
          <div className={styles.disclosureFooter}>
            <a href={hl.agent_path} className={styles.monitorBtn}>
              <span>View full brief</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <div className={styles.shareWrap}>
              <button className={styles.shareTrigger} onClick={(e) => openShare(item.id, e.currentTarget)}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 8V13a1 1 0 001 1h6a1 1 0 001-1V8M11 4L8 1M8 1L5 4M8 1v9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Share</span>
              </button>
              {renderSharePopover(item)}
            </div>
          </div>
        </div>
      );
    }

    // Monitor item — minimal expanded view with source link
    if (item.type === "monitor-item" && item.monitorItem) {
      return (
        <div className={styles.disclosure}>
          <div className={styles.disclosureFooter} style={{ marginTop: 0 }}>
            <a href={item.monitorItem.url || "#"} target="_blank" rel="noopener noreferrer" className={styles.monitorBtn}>
              <span>{fmtSource(item.monitorItem.source)}</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <a href={item.agentPath} className={styles.agentLink}>{item.agentLabel}</a>
              <div className={styles.shareWrap}>
                <button className={styles.shareTrigger} onClick={(e) => openShare(item.id, e.currentTarget)}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 8V13a1 1 0 001 1h6a1 1 0 001-1V8M11 4L8 1M8 1L5 4M8 1v9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span>Share</span>
                </button>
                {renderSharePopover(item)}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  // ─── Render ───

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.center}><span className={styles.muted}>Loading...</span></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrap}>
        <div className={styles.center}>
          <span className={styles.error}>{error}</span>
          <button className={styles.retryBtn} onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // No bookmarks
  if (!favorites || favorites.size === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="32" height="32" viewBox="0 0 16 16" fill="none" stroke="#c5c5ce" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2.5V8L11 10" />
              <circle cx="8" cy="8" r="6" />
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>No updates to show</h3>
          <p className={styles.emptyDesc}>
            Bookmark agents in Explore to receive their updates here. Analysis alerts, weekly briefs, and daily monitors will appear as they publish.
          </p>
          {onGoToExplore && (
            <button className={styles.emptyAction} onClick={onGoToExplore}>
              Browse Explore
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Bookmarks but no data
  if (feedItems.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.center}>
          <span className={styles.muted}>No recent updates from your bookmarked agents.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {/* Global mark all as read */}
      {unreadCount > 0 && (
        <div className={styles.globalBar}>
          <span className={styles.globalUnread}>
            {unreadCount} unread update{unreadCount !== 1 ? "s" : ""}
          </span>
          <button className={styles.markAllBtn} onClick={markAllAsRead}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5L6.5 12L13 4"/></svg>
            Mark all as read
          </button>
        </div>
      )}

      {/* Per-day grouped feed */}
      {groupedFeed.map(([dateKey, items]) => {
        const sectionUnread = items.filter((i) => !readIds.has(i.id));
        const hasUnread = sectionUnread.length > 0;
        const dayLabel = fmtDayLabel(dateKey);

        return (
          <div key={dateKey} className={styles.timeGroup}>
            <div className={styles.timeGroupHeader}>
              <div className={styles.timeGroupLeft}>
                <span className={styles.timeGroupLabel}>{dayLabel}</span>
                {hasUnread && (
                  <span className={styles.timeGroupCount}>{sectionUnread.length}</span>
                )}
              </div>
              {hasUnread ? (
                <button
                  className={styles.sectionMarkBtn}
                  onClick={() => markSectionAsRead(items)}
                >
                  Mark as read
                </button>
              ) : (
                <span className={styles.sectionAllRead}>All read</span>
              )}
            </div>

            <div className={styles.panel}>
              {items.map((item) => {
                const isRead = readIds.has(item.id);
                const isOpen = expandedId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`${styles.section} ${isOpen ? styles.sectionOpen : ""}`}
                  >
                    <button
                      className={`${styles.row} ${isOpen ? styles.rowOpen : ""} ${isRead ? styles.rowRead : ""}`}
                      onClick={() => {
                        toggle(item.id);
                        if (!isRead) markAsRead([item.id]);
                      }}
                      aria-expanded={isOpen}
                    >
                      <div className={styles.rowLeft}>
                        <span className={styles.dotCol}>
                          {!isRead && <span className={styles.unreadDot} />}
                        </span>
                        <div className={styles.rowContent}>
                          <span className={`${styles.rowLabel} ${isRead ? styles.rowLabelRead : ""}`}>
                            {item.type === "analysis" && item.analysisEvent && (
                              <span className={styles.eventTicker}>{item.analysisEvent.ticker}</span>
                            )}
                            {item.type === "analysis" && item.analysisEvent
                              ? item.analysisEvent.headline.replace(`${item.analysisEvent.ticker} `, "")
                              : item.title
                            }
                          </span>
                          <span className={styles.rowAgent}>{item.agentLabel}</span>
                        </div>
                      </div>
                      <span className={styles.rowRight}>
                        {typeBadge(item)}
                        <svg
                          width="16" height="16" viewBox="0 0 16 16" fill="none"
                          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                        >
                          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>

                    {isOpen && renderExpanded(item)}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}