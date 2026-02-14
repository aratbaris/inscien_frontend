"use client";

import { useState } from "react";
import type { TopicNotification } from "@/lib/types";
import styles from "./TopicNotificationCard.module.css";

// ─── Short topic labels ───

const TOPIC_SHORT_LABELS: Record<string, string> = {
  cyber:      "Cyber Risk",
  macro:      "Macro",
  oil:        "Oil",
  regulatory: "Crypto Regulatory",
  crypto:     "Crypto ETF",
};

// ─── Helpers ───

function formatSource(source: string): string {
  return source.toUpperCase().replace(/^WWW\./, "");
}

function formatDateOnly(ts: string): string {
  if (!ts) return "";
  // Extract YYYY-MM-DD from timestamp
  const dateStr = ts.substring(0, 10);
  if (dateStr.length !== 10) return dateStr;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!m || !d) return dateStr;
  return `${months[m - 1]} ${d}, ${y}`;
}

function getTopicLabel(notification: TopicNotification): string {
  return TOPIC_SHORT_LABELS[notification.topic_id] || notification.topic_name;
}

// ─── Share text builder ───

function buildShareText(notification: TopicNotification): string {
  const label = getTopicLabel(notification);
  const lines: string[] = [];
  lines.push(`Monitoring Weekly Highlights - ${label}`);
  lines.push("");

  for (const item of notification.items.slice(0, 3)) {
    lines.push(`• ${item.title}`);
  }

  if (notification.items.length > 3) {
    lines.push(`  +${notification.items.length - 3} more`);
  }

  lines.push("");
  lines.push("#FinanceLab");

  return lines.join("\n");
}

function handleCopyShareText(notification: TopicNotification) {
  const text = buildShareText(notification);
  navigator.clipboard.writeText(text).catch(() => {});
}

function handleShareToX(notification: TopicNotification) {
  const text = encodeURIComponent(buildShareText(notification));
  window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
}

function handleShareToLinkedIn(notification: TopicNotification) {
  const text = encodeURIComponent(buildShareText(notification));
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=&summary=${text}`, "_blank");
}

// ─── Component ───

interface TopicNotificationCardProps {
  notification: TopicNotification;
  defaultExpanded?: boolean;
}

export default function TopicNotificationCard({
  notification,
  defaultExpanded = false,
}: TopicNotificationCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const label = getTopicLabel(notification);

  return (
    <div className={styles.card}>
      {/* Header - always visible */}
      <button
        className={styles.cardHeader}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className={styles.headerLeft}>
          <span className={styles.topicName}>{label}</span>
          <span className={styles.countChip}>{notification.item_count}</span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className={styles.cardBody}>
          <div className={styles.itemList}>
            {notification.items.map((item, idx) => (
              <a
                key={`${item.title}-${idx}`}
                href={item.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.item}
              >
                <div className={styles.itemMeta}>
                  <span className={styles.itemSource}>{formatSource(item.source)}</span>
                  <span className={styles.itemDate}>{formatDateOnly(item.timestamp)}</span>
                </div>
                <div className={styles.itemTitle}>{item.title}</div>
              </a>
            ))}
          </div>

          <div className={styles.cardActions}>
            <a href={notification.agent_path} className={styles.viewLink}>
              View full monitor
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <div className={styles.shareActions}>
              <button className={styles.shareBtn} onClick={() => handleCopyShareText(notification)} title="Copy share text">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M3 11V3h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className={styles.shareBtn} onClick={() => handleShareToX(notification)} title="Share on X">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M12.6 2H14.7L10 7.4L15.5 14H11.1L7.6 9.6L3.6 14H1.5L6.5 8.2L1.2 2H5.7L8.9 6L12.6 2ZM11.9 12.7H13L5 3.3H3.9L11.9 12.7Z" fill="currentColor" />
                </svg>
              </button>
              <button className={styles.shareBtn} onClick={() => handleShareToLinkedIn(notification)} title="Share on LinkedIn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4.5 6.5V12M7.5 12V9.5C7.5 8.4 8.4 7.5 9.5 7.5C10.6 7.5 11.5 8.4 11.5 9.5V12M4.5 4.5V4.51" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}