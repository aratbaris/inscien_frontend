/**
 * Centralized agent access configuration.
 *
 * Every agent page reads its access rules from here so that the funnel
 * logic lives in one place and the components stay generic.
 *
 * Tier hierarchy:  anon (0) < auth (1) < pro (2)
 *   - Defined in lib/auth.ts via TIER_RANK.
 *
 * Access levels per agent:
 *   pageAccess   - minimum tier to open the page at all
 *   freePreview  - what anonymous visitors see (teaser)
 *   authPreview  - what signed-in free users see
 *   pro          - full content (all sections / full history / full timeline)
 */

import type { AccessLevel } from "@/lib/auth";

// ─── Analysis / Report Pages ───

export interface AnalysisAccessConfig {
  /** Minimum tier to load the page (anon = everyone can see the teaser) */
  pageAccess: AccessLevel;
  /** Number of free sections for anonymous visitors */
  anonSections: number;
  /** Number of sections for signed-in free users (Infinity = all) */
  authSections: number;
  /** true = free users see all sections (showcase agent) */
  isShowcase?: boolean;
}

export const ANALYSIS_ACCESS: Record<string, AnalysisAccessConfig> = {
  // ── Showcase: full free access ──
  "spy": {
    pageAccess: "anon",
    anonSections: 1,
    authSections: Infinity,
    isShowcase: true,
  },
  "aapl": {
    pageAccess: "anon",
    anonSections: 1,
    authSections: Infinity,
    isShowcase: true,
  },

  // ── Partial: teaser → limited → full ──
  "market-returns": {
    pageAccess: "anon",
    anonSections: 1,
    authSections: 3,
  },
  "macro-dashboard": {
  pageAccess: "anon",
  anonSections: 1,
  authSections: Infinity,
  isShowcase: true,
 },
  "qqq": {
    pageAccess: "anon",
    anonSections: 1,
    authSections: 3,
  },
  "nvda": {
    pageAccess: "anon",
    anonSections: 1,
    authSections: 3,
  },

  // ── Pro-only: teaser for anon, upgrade CTA for auth ──
  "googl": {
    pageAccess: "anon",
    anonSections: 1,
    authSections: 0, // auth users see section 0 teaser + pro CTA
  },
  "msft": {
    pageAccess: "anon",
    anonSections: 1,
    authSections: 0,
  },
  "meta": {
    pageAccess: "anon",
    anonSections: 1,
    authSections: 0,
  },
};

/** Helper: resolve section limits for a given ticker and tier */
export function getAnalysisSections(
  ticker: string,
  tier: AccessLevel,
  totalSections: number
): { visibleCount: number; gateType: "none" | "auth" | "pro" } {
  const key = ticker.toLowerCase();
  const config = ANALYSIS_ACCESS[key];

  // Default fallback: standard partial access
  if (!config) {
    if (tier === "pro") return { visibleCount: totalSections, gateType: "none" };
    if (tier === "auth") return { visibleCount: 3, gateType: "pro" };
    return { visibleCount: 1, gateType: "auth" };
  }

  // Pro always sees everything
  if (tier === "pro") {
    return { visibleCount: totalSections, gateType: "none" };
  }

  // Auth (free signed-in)
  if (tier === "auth") {
    if (config.authSections === Infinity) {
      return { visibleCount: totalSections, gateType: "none" };
    }
    if (config.authSections === 0) {
      // Pro-only agent: auth sees section 0 teaser + pro upgrade CTA
      return { visibleCount: 1, gateType: "pro" };
    }
    const visible = Math.min(config.authSections, totalSections);
    return {
      visibleCount: visible,
      gateType: visible < totalSections ? "pro" : "none",
    };
  }

  // Anon
  return {
    visibleCount: Math.min(config.anonSections, totalSections),
    gateType: "auth",
  };
}

// ─── Topic Map / Weekly Deep Dives ───

export interface TopicMapAccessConfig {
  /** Minimum tier to load the page */
  pageAccess: AccessLevel;
  /** Whether anon users see the current week */
  anonCurrentWeek: boolean;
  /** Timeline weeks for auth (0 = no timeline, only current week) */
  authTimelineWeeks: number;
  /** Timeline weeks for pro */
  proTimelineWeeks: number;
  /** true = showcase agent */
  isShowcase?: boolean;
}

export const TOPIC_MAP_ACCESS: Record<string, TopicMapAccessConfig> = {
  // ── Showcase: generous free access ──
  "apple": {
    pageAccess: "anon",
    anonCurrentWeek: true,
    authTimelineWeeks: 4,
    proTimelineWeeks: 8,
    isShowcase: true,
  },

  // ── Partial: current week free, timeline pro ──
  "openai": {
    pageAccess: "anon",
    anonCurrentWeek: true,
    authTimelineWeeks: 0,
    proTimelineWeeks: 8,
  },
  "nvidia": {
    pageAccess: "anon",
    anonCurrentWeek: true,
    authTimelineWeeks: 0,
    proTimelineWeeks: 8,
  },
  "semis": {
    pageAccess: "anon",
    anonCurrentWeek: true,
    authTimelineWeeks: 0,
    proTimelineWeeks: 8,
  },

  // ── Pro-only: anon teaser, auth gets upgrade CTA ──
  "google": {
    pageAccess: "anon",
    anonCurrentWeek: true,
    authTimelineWeeks: -1, // -1 = pro-only (current week blocked for auth too)
    proTimelineWeeks: 8,
  },
  "microsoft": {
    pageAccess: "anon",
    anonCurrentWeek: true,
    authTimelineWeeks: -1,
    proTimelineWeeks: 8,
  },
  "meta": {
    pageAccess: "anon",
    anonCurrentWeek: true,
    authTimelineWeeks: -1,
    proTimelineWeeks: 8,
  },
};

/** Helper: resolve topic map access for a given topic and tier */
export function getTopicMapAccess(
  topicId: string,
  tier: AccessLevel
): {
  canViewCurrentWeek: boolean;
  timelineWeeks: number;
  gateType: "none" | "auth" | "pro";
} {
  const config = TOPIC_MAP_ACCESS[topicId];

  // Default fallback
  if (!config) {
    if (tier === "pro") return { canViewCurrentWeek: true, timelineWeeks: 8, gateType: "none" };
    if (tier === "auth") return { canViewCurrentWeek: true, timelineWeeks: 0, gateType: "pro" };
    return { canViewCurrentWeek: true, timelineWeeks: 0, gateType: "auth" };
  }

  if (tier === "pro") {
    return { canViewCurrentWeek: true, timelineWeeks: config.proTimelineWeeks, gateType: "none" };
  }

  if (tier === "auth") {
    // Pro-only agent
    if (config.authTimelineWeeks === -1) {
      return { canViewCurrentWeek: true, timelineWeeks: 0, gateType: "pro" };
    }
    return {
      canViewCurrentWeek: true,
      timelineWeeks: config.authTimelineWeeks,
      gateType: config.authTimelineWeeks < config.proTimelineWeeks ? "pro" : "none",
    };
  }

  // Anon
  return {
    canViewCurrentWeek: config.anonCurrentWeek,
    timelineWeeks: 0,
    gateType: "auth",
  };
}

// ─── Signal Feed / Daily Monitors ───

export interface SignalFeedAccessConfig {
  /** Minimum tier to load the page */
  pageAccess: AccessLevel;
  /** Dates shown to anon */
  anonDays: number;
  /** Dates shown to auth */
  authDays: number;
  /** Dates shown to pro */
  proDays: number;
}

export const SIGNAL_FEED_ACCESS: Record<string, SignalFeedAccessConfig> = {
  // ── Standard: 10 → 30 → 60 ──
  "macro": {
    pageAccess: "anon",
    anonDays: 10,
    authDays: 30,
    proDays: 60,
  },
  "oil": {
    pageAccess: "anon",
    anonDays: 10,
    authDays: 30,
    proDays: 60,
  },
  "cyber": {
    pageAccess: "anon",
    anonDays: 10,
    authDays: 30,
    proDays: 60,
  },
  "weekly-cross": {
    pageAccess: "anon",
    anonDays: 10,
    authDays: 30,
    proDays: 60,
  },

  // ── Pro-only monitors ──
  "crypto-regulatory": {
    pageAccess: "anon",
    anonDays: 10,
    authDays: 0,  // 0 = show upgrade CTA instead of feed
    proDays: 60,
  },
  "crypto-etf": {
    pageAccess: "anon",
    anonDays: 10,
    authDays: 0,
    proDays: 60,
  },
};

/** Helper: resolve signal feed depth for a given agent and tier */
export function getSignalFeedAccess(
  agentKey: string,
  tier: AccessLevel
): {
  days: number;
  gateType: "none" | "auth" | "pro";
} {
  const config = SIGNAL_FEED_ACCESS[agentKey];

  // Default fallback
  if (!config) {
    if (tier === "pro") return { days: 60, gateType: "none" };
    if (tier === "auth") return { days: 30, gateType: "pro" };
    return { days: 10, gateType: "auth" };
  }

  if (tier === "pro") {
    return { days: config.proDays, gateType: "none" };
  }

  if (tier === "auth") {
    if (config.authDays === 0) {
      return { days: 10, gateType: "pro" }; // show teaser + pro CTA
    }
    return {
      days: config.authDays,
      gateType: config.authDays < config.proDays ? "pro" : "none",
    };
  }

  // Anon
  return { days: config.anonDays, gateType: "auth" };
}

// ─── Dashboard Notifications ───
// Updates tab: always visible (free engagement hook)
// Clicking through to a pro-only agent page → hits the pro gate there
// No special config needed - the gate lives on the destination page

// ─── Free Content (no gating) ───
// - Deep Research Reviews (Audio)
// - Paper Briefs
// - Quantitative Concepts (Interactive lessons)
// These have no access config - components render fully for all tiers.