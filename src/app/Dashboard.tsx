"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { NotificationFeed } from "@/components/notifications";
import styles from "./dashboard.module.css";

/* ─── Agent Registry (shared source of truth) ─── */

interface AgentDef {
  name: string;
  href: string;
  desc: string;
  cadence: "Daily" | "Weekly" | "Monthly" | "Self-paced";
  artifact: string;
  category: string;
  /** Access tier: "free" = full for auth, "trial" = limited for auth, "pro" = pro-only */
  access?: "free" | "trial" | "pro";
}

const agents: AgentDef[] = [
  /* ── Macro Analysis ── */
  {
    name: "U.S. Macro Dashboard",
    href: "/agents/macro-dashboard",
    desc: "Rates, inflation, GDP, and federal debt from FRED data.",
    cadence: "Monthly",
    artifact: "Analysis report",
    category: "Macro Analysis",
    access: "free",
  },

  /* ── Market ETF Analysis ── */
  {
    name: "S&P 500 Long-Term Performance",
    href: "/agents/market-returns",
    desc: "Risk-return snapshots, volatility regimes, Sharpe ratios, and bootstrap simulations.",
    cadence: "Monthly",
    artifact: "Analysis report",
    category: "Market ETF Analysis",
    access: "trial",
  },
  {
    name: "S&P 500 Market Analysis",
    href: "/agents/analysis/spy",
    desc: "Volatility regimes, tail risk, drawdowns, and HAR model forecasts for the S&P 500.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Market ETF Analysis",
    access: "free",
  },
  {
    name: "QQQ Volatility & Risk",
    href: "/agents/analysis/qqq",
    desc: "Realized volatility, distributional statistics, and short-term forecasts for the Nasdaq-100 ETF.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Market ETF Analysis",
    access: "trial",
  },

  /* ── Company Analysis ── */
  {
    name: "NVIDIA Performance & Risk",
    href: "/agents/analysis/nvda",
    desc: "Earnings impact, profitability trend, volatility regimes, and risk analysis for NVDA. Includes SEC EDGAR fundamentals.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Company Analysis",
    access: "trial",
  },
  {
    name: "Apple Performance & Risk",
    href: "/agents/analysis/aapl",
    desc: "Earnings impact, profitability trend, volatility regimes, and risk analysis for AAPL. Includes SEC EDGAR fundamentals.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Company Analysis",
    access: "free",
  },
  {
    name: "Alphabet Performance & Risk",
    href: "/agents/analysis/googl",
    desc: "Earnings impact, profitability trend, volatility regimes, and risk analysis for GOOGL. Includes SEC EDGAR fundamentals.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Company Analysis",
    access: "pro",
  },
  {
    name: "Microsoft Performance & Risk",
    href: "/agents/analysis/msft",
    desc: "Earnings impact, profitability trend, volatility regimes, and risk analysis for MSFT. Includes SEC EDGAR fundamentals.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Company Analysis",
    access: "pro",
  },
  {
    name: "Meta Platforms Performance & Risk",
    href: "/agents/analysis/meta",
    desc: "Earnings impact, profitability trend, volatility regimes, and risk analysis for META. Includes SEC EDGAR fundamentals.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Company Analysis",
    access: "pro",
  },

  /* ── Daily Monitors ── */
  {
    name: "Public Company Cyber Risk",
    href: "/agents/cyber-monitor",
    desc: "Confirmed cyber incidents affecting listed companies, SEC investigations, securities class actions, and material operational disruptions with equity relevance.",
    cadence: "Daily",
    artifact: "Brief",
    category: "Daily Event Monitors",
    access: "trial",
  },
  {
    name: "Oil Market Monitor",
    href: "/agents/oil-market-monitor",
    desc: "EIA inventories, OPEC actions, sanctions decisions, supply disruptions, and demand signals.",
    cadence: "Daily",
    artifact: "Brief",
    category: "Daily Event Monitors",
    access: "trial",
  },
  {
    name: "G10 Macro Releases",
    href: "/agents/macro-market-monitor",
    desc: "G10 central bank rate decisions, official policy statements, and major data releases including CPI, NFP, GDP, and PMI.",
    cadence: "Daily",
    artifact: "Brief",
    category: "Daily Event Monitors",
    access: "trial",
  },
  {
    name: "Crypto Regulatory Shifts",
    href: "/agents/crypto-regulatory",
    desc: "Binding rule changes, stablecoin framework enactments, exchange licensing actions, major enforcement, and court rulings changing classification or scope.",
    cadence: "Daily",
    artifact: "Brief",
    category: "Daily Event Monitors",
    access: "pro",
  },
  {
    name: "Crypto ETF Access",
    href: "/agents/crypto-etf-access",
    desc: "ETF approvals, rejections, filings, listing decisions, and flow-related structural milestones for crypto capital access vehicles.",
    cadence: "Daily",
    artifact: "Brief",
    category: "Daily Event Monitors",
    access: "pro",
  },

  /* ── Company Briefs ── */
  {
    name: "OpenAI Weekly Brief",
    href: "/agents/openai-weekly",
    desc: "Product launches, API updates, partnerships, and strategic developments from OpenAI.",
    cadence: "Weekly",
    artifact: "Brief",
    category: "Company Briefs",
    access: "trial",
  },
  {
    name: "Google Weekly Brief",
    href: "/agents/google-weekly",
    desc: "Product launches, AI initiatives, cloud strategy, and ecosystem developments from Google.",
    cadence: "Weekly",
    artifact: "Brief",
    category: "Company Briefs",
    access: "pro",
  },
  {
    name: "Apple Weekly Brief",
    href: "/agents/apple-weekly",
    desc: "Product launches, services expansion, and platform developments from Apple.",
    cadence: "Weekly",
    artifact: "Brief",
    category: "Company Briefs",
    access: "free",
  },
  {
    name: "Microsoft Weekly Brief",
    href: "/agents/microsoft-weekly",
    desc: "Azure strategy, AI integration, enterprise developments, and ecosystem shifts from Microsoft.",
    cadence: "Weekly",
    artifact: "Brief",
    category: "Company Briefs",
    access: "pro",
  },
  {
    name: "NVIDIA Weekly Brief",
    href: "/agents/nvidia-weekly",
    desc: "GPU architecture, data center strategy, AI compute developments, and supply chain shifts from NVIDIA.",
    cadence: "Weekly",
    artifact: "Brief",
    category: "Company Briefs",
    access: "trial",
  },
  {
    name: "Meta Weekly Brief",
    href: "/agents/meta-weekly",
    desc: "AI research, social platform strategy, Reality Labs developments, and ecosystem shifts from Meta.",
    cadence: "Weekly",
    artifact: "Brief",
    category: "Company Briefs",
    access: "pro",
  },

  /* ── Industry Briefs ── */
  {
    name: "Semiconductor Supply Chain",
    href: "/agents/semis-supply-chain",
    desc: "Fab investments, export controls, supply constraints, packaging advances.",
    cadence: "Weekly",
    artifact: "Brief",
    category: "Industry Briefs",
    access: "trial",
  },

  /* ── Research Briefs ── */
  {
    name: "Modeling and Forecasting Realized Volatility",
    href: "/agents/paper-briefs/realized-volatility",
    desc: "Andersen, Bollerslev, Diebold & Labys · Econometrica 2003 · How high-frequency intraday returns construct nonparametric realized volatility measures.",
    cadence: "Self-paced",
    artifact: "Audio brief",
    category: "Research Briefs",
    access: "free",
  },
  {
    name: "Tail Risk and Asset Prices",
    href: "/agents/paper-briefs/tail-risk",
    desc: "Kelly & Jiang · The Review of Financial Studies 2014 · Cross-sectional tail risk measurement and its predictive power for market returns.",
    cadence: "Self-paced",
    artifact: "Audio brief",
    category: "Research Briefs",
    access: "free",
  },

  /* ── Quantitative Concepts ── */
  {
    name: "Understanding Variance",
    href: "/agents/learn/variance",
    desc: "From visual intuition to mathematical precision. See how variance captures the 'jitter' in data.",
    cadence: "Self-paced",
    artifact: "Interactive lesson",
    category: "Quantitative Concepts",
    access: "free",
  },
  {
    name: "Standard Deviation (σ)",
    href: "/agents/learn/standard-deviation",
    desc: "How σ measures spread, the 68-95-99.7 rule, and when ±σ notation breaks down.",
    cadence: "Self-paced",
    artifact: "Interactive lesson",
    category: "Quantitative Concepts",
    access: "free",
  },
  {
    name: "Bootstrap Resampling",
    href: "/agents/learn/bootstrap-resampling",
    desc: "Use real S&P 500 data to understand sampling distributions and quantify uncertainty.",
    cadence: "Self-paced",
    artifact: "Interactive lesson",
    category: "Quantitative Concepts",
    access: "free",
  },
];

/* ─── Helpers ─── */

const CADENCE_ORDER: Record<string, number> = {
  Daily: 0,
  Weekly: 1,
  Monthly: 2,
  "Self-paced": 3,
};

const CADENCE_LABELS: Record<string, string> = {
  Daily: "Daily",
  Weekly: "Weekly",
  Monthly: "Monthly",
  "Self-paced": "Self-paced",
};

/** Shorten artifact labels to single words */
const ARTIFACT_SHORT: Record<string, string> = {
  "Analysis report": "Analysis",
  "Brief": "Brief",
  "Audio brief": "Audio",
  "Interactive lesson": "Lesson",
};

function shortArtifact(artifact: string): string {
  return ARTIFACT_SHORT[artifact] || artifact;
}

const ACCESS_ORDER: Record<string, number> = {
  free: 0,
  trial: 1,
  pro: 2,
};

function sortByAccess(list: AgentDef[]): AgentDef[] {
  return [...list].sort(
    (a, b) => (ACCESS_ORDER[a.access ?? "trial"] ?? 1) - (ACCESS_ORDER[b.access ?? "trial"] ?? 1)
  );
}

function groupByCategory(list: AgentDef[]): Map<string, AgentDef[]> {
  const map = new Map<string, AgentDef[]>();
  for (const a of list) {
    if (!map.has(a.category)) map.set(a.category, []);
    map.get(a.category)!.push(a);
  }
  for (const [key, items] of map) {
    map.set(key, sortByAccess(items));
  }
  return map;
}

function groupByCadence(list: AgentDef[]): Map<string, AgentDef[]> {
  const map = new Map<string, AgentDef[]>();
  const sorted = [...list].sort(
    (a, b) => (CADENCE_ORDER[a.cadence] ?? 9) - (CADENCE_ORDER[b.cadence] ?? 9)
  );
  for (const a of sorted) {
    if (!map.has(a.cadence)) map.set(a.cadence, []);
    map.get(a.cadence)!.push(a);
  }
  for (const [key, items] of map) {
    map.set(key, sortByAccess(items));
  }
  return map;
}

const FAVORITES_KEY = "financelab_favorites";
const TAB_KEY = "financelab_tab";

type TabValue = "feed" | "updates" | "explore";

const VALID_TABS: TabValue[] = ["feed", "updates", "explore"];

function isValidTab(val: string | null): val is TabValue {
  return val !== null && VALID_TABS.includes(val as TabValue);
}

function loadFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveFavorites(favs: Set<string>) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
  } catch {}
}

/* ─── Components ─── */

function BookmarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2.5h8a1 1 0 011 1v11L8 11.5 3 14.5v-11a1 1 0 011-1z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="7" width="9" height="7" rx="1" />
      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
    </svg>
  );
}

/** Access badge: outlined "Free" / "Trial" pill, or lock icon for pro */
function AccessBadge({ access }: { access?: AgentDef["access"] }) {
  if (access === "free") {
    return <span className={styles.badgeFree}>Free</span>;
  }
  if (access === "trial") {
    return <span className={styles.badgeTrial}>Trial</span>;
  }
  if (access === "pro") {
    return (
      <span className={styles.badgeLock}>
        <LockIcon />
      </span>
    );
  }
  return null;
}

/** Compound meta pill: outlined cadence pill (no dot) + access badge */
function MetaPill({ cadence, artifact, access }: { cadence: AgentDef["cadence"]; artifact: string; access?: AgentDef["access"] }) {
  const short = shortArtifact(artifact);
  const isSelfPaced = cadence === "Self-paced";

  return (
    <span className={styles.metaPillWrap}>
      <span className={styles.metaPill}>
        {isSelfPaced ? short : `${cadence} ${short}`}
      </span>
      <AccessBadge access={access} />
    </span>
  );
}

function AgentRow({
  agent,
  isFavorited,
  onToggleFavorite,
}: {
  agent: AgentDef;
  isFavorited: boolean;
  onToggleFavorite: (href: string) => void;
}) {
  return (
    <div className={styles.agentRow}>
      <a href={agent.href} className={styles.agentRowLink}>
        <div className={styles.agentRowMain}>
          <div className={styles.agentRowName}>{agent.name}</div>
          <div className={styles.agentRowDesc}>{agent.desc}</div>
        </div>
        <div className={styles.agentRowMeta}>
          <MetaPill cadence={agent.cadence} artifact={agent.artifact} access={agent.access} />
        </div>
        <button
          className={`${styles.bookmarkBtn} ${isFavorited ? styles.bookmarkBtnActive : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(agent.href);
          }}
          aria-label={isFavorited ? "Remove from feed" : "Add to feed"}
        >
          <BookmarkIcon />
        </button>
        <div className={styles.agentRowArrow} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </a>
    </div>
  );
}

/* ─── Filter Chips ─── */

interface FilterChip {
  label: string;
  query: string;
}

const FILTER_CHIPS: FilterChip[] = [
  { label: "ETF", query: "etf" },
  { label: "Apple", query: "apple" },
  { label: "NVIDIA", query: "nvidia" },
  { label: "Google", query: "google alphabet" },
  { label: "Crypto", query: "crypto" },
  { label: "Macro", query: "macro" },
];

/* ─── Dashboard ─── */

export default function Dashboard() {
  const { user, tier } = useAuth();

  const [tab, setTabRaw] = useState<TabValue>(() => {
    if (typeof window === "undefined") return "feed";
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get("tab");
    if (isValidTab(urlTab)) return urlTab;
    try {
      const stored = sessionStorage.getItem(TAB_KEY);
      if (isValidTab(stored)) return stored;
    } catch {}
    return "feed";
  });

  const setTab = useCallback((t: TabValue) => {
    setTabRaw(t);
    try { sessionStorage.setItem(TAB_KEY, t); } catch {}
    const url = new URL(window.location.href);
    url.searchParams.set("tab", t);
    window.history.replaceState({}, "", url.toString());
  }, []);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const loaded = loadFavorites();
    setFavorites(loaded);
    if (loaded.size === 0) {
      const hasPersistedTab =
        new URLSearchParams(window.location.search).has("tab") ||
        !!sessionStorage.getItem(TAB_KEY);
      if (!hasPersistedTab) setTab("explore");
    }
    setHydrated(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Notification count is now managed by NotificationFeed via onCountChange
  // which accounts for bookmark filtering and read state

  const toggleFavorite = useCallback((href: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      saveFavorites(next);
      return next;
    });
  }, []);

  const firstName = user?.first_name || user?.email?.split("@")[0] || "there";

  const q = query.toLowerCase().trim();
  const qTerms = q.split(/\s+/).filter(Boolean);
  const filtered = q
    ? agents.filter((a) => {
        const haystack = `${a.name} ${a.desc} ${a.category} ${a.cadence} ${a.artifact}`.toLowerCase();
        return qTerms.some((term) => haystack.includes(term));
      })
    : agents;
  const grouped = groupByCategory(filtered);

  const feedAgents = agents.filter((a) => favorites.has(a.href));
  const feedGrouped = groupByCadence(feedAgents);

  const handleChipClick = (chip: FilterChip) => {
    if (activeChip === chip.label) { setActiveChip(null); setQuery(""); }
    else { setActiveChip(chip.label); setQuery(chip.query); }
  };
  const handleQueryChange = (val: string) => { setQuery(val); setActiveChip(null); };
  const handleClear = () => { setQuery(""); setActiveChip(null); };

  const initials =
    ((user?.first_name?.[0] || "") + (user?.last_name?.[0] || "")).toUpperCase() ||
    (user?.email?.[0]?.toUpperCase() || "?");

  if (!hydrated) return <div className={styles.page} style={{ minHeight: "100vh" }} />;

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <nav className={styles.topBar}>
        <a href="/" className={styles.logo}>
          <img src="/icon.png" alt="" className={styles.logoIcon} />
          <span className={styles.logoText}>FinanceLab</span>
        </a>
        <div className={styles.topBarRight}>
          <button
            className={styles.bellBtn}
            onClick={() => setTab("updates")}
            aria-label="Updates"
          >
            <Bell size={18} strokeWidth={1.8} />
            {notifCount > 0 && <span className={styles.bellDot} />}
          </button>
          {tier === "pro" ? (
            <span className={styles.proBadge}>Pro</span>
          ) : (
            <a href="/pricing" className={styles.upgradeLink}>Upgrade</a>
          )}
          <a href="/settings" className={styles.avatarLink}>
            {user?.picture_url ? (
              <img src={user.picture_url} alt={initials} className={styles.avatar} referrerPolicy="no-referrer" />
            ) : (
              <div className={styles.avatarFallback}>{initials}</div>
            )}
          </a>
        </div>
      </nav>

      {/* Header */}
      <header className={styles.greeting}>
        <h1 className={styles.greetingTitle}>Welcome back, {firstName}</h1>
        <p className={styles.greetingDesc}>
          {agents.length} agents running across daily, weekly, and monthly cadences.
        </p>

        <div className={styles.tabBar}>
          <button className={`${styles.tab} ${tab === "feed" ? styles.tabActive : ""}`} onClick={() => setTab("feed")}>
            My Feed
            {favorites.size > 0 && <span className={styles.tabCountOutlined}>{favorites.size}</span>}
          </button>
          <button className={`${styles.tab} ${tab === "updates" ? styles.tabActive : ""}`} onClick={() => setTab("updates")}>
            Updates
            {notifCount > 0 && <span className={styles.tabCountOutlined}>{notifCount}</span>}
          </button>
          <button className={`${styles.tab} ${tab === "explore" ? styles.tabActive : ""}`} onClick={() => setTab("explore")}>
            Explore
            <span className={styles.tabCountOutlined}>{agents.length}</span>
          </button>
        </div>

        {tab === "explore" && (
          <div className={styles.searchArea}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search agents, topics, or categories..."
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
              />
              {query && (
                <button className={styles.searchClear} onClick={handleClear}>✕</button>
              )}
            </div>
            <div className={styles.filterRow}>
              <div className={styles.filterChips}>
                {FILTER_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    className={`${styles.filterChip} ${activeChip === chip.label ? styles.filterChipActive : ""}`}
                    onClick={() => handleChipClick(chip)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              {q && (
                <span className={styles.filterResultCount}>
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className={styles.main}>
        {tab === "feed" && (
          <>
            {feedAgents.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="36" height="36" viewBox="0 0 16 16" fill="none" stroke="#c5c5ce" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 2.5h8a1 1 0 011 1v11L8 11.5 3 14.5v-11a1 1 0 011-1z" />
                  </svg>
                </div>
                <h3 className={styles.emptyTitle}>Your feed is empty</h3>
                <p className={styles.emptyDesc}>
                  Bookmark agents in Explore to add them to your personal feed for quick daily access.
                </p>
                <button className={styles.emptyAction} onClick={() => setTab("explore")}>
                  Browse Explore
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ) : (
              Array.from(feedGrouped.entries()).map(([cadence, items]) => (
                <section key={cadence} className={styles.group}>
                  <div className={styles.groupHeader}>
                    <h2 className={styles.groupTitle}>{CADENCE_LABELS[cadence] || cadence}</h2>
                    <span className={styles.groupCount}>{items.length}</span>
                  </div>
                  <div className={styles.groupList}>
                    {items.map((a) => (
                      <AgentRow key={a.href} agent={a} isFavorited={true} onToggleFavorite={toggleFavorite} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </>
        )}

        {/* Always mounted for count reporting; hidden when not active */}
        <div style={tab !== "updates" ? { display: "none" } : undefined}>
          <NotificationFeed
            onCountChange={(count) => setNotifCount(count)}
            favorites={favorites}
            onGoToExplore={() => setTab("explore")}
          />
        </div>

        {tab === "explore" && (
          <>
            {Array.from(grouped.entries()).map(([category, items]) => (
              <section key={category} className={styles.group}>
                <div className={styles.groupHeader}>
                  <h2 className={styles.groupTitle}>{category}</h2>
                  <span className={styles.groupCount}>{items.length}</span>
                </div>
                <div className={styles.groupList}>
                  {items.map((a) => (
                    <AgentRow key={a.href} agent={a} isFavorited={favorites.has(a.href)} onToggleFavorite={toggleFavorite} />
                  ))}
                </div>
              </section>
            ))}
            {filtered.length === 0 && q && (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No results</h3>
                <p className={styles.emptyDesc}>No agents match &ldquo;{query}&rdquo;. Try a different search term.</p>
                <button className={styles.emptyAction} onClick={handleClear}>Clear search</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>&copy; 2026 FinanceLab &middot; Finance Lab Teknoloji A.Ş.</span>
        <div className={styles.footerLinks}>
          <a href="/settings">Settings</a>
          <a href="/pricing">Pricing</a>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
        </div>
      </footer>
    </div>
  );
}