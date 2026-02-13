"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import styles from "./dashboard.module.css";

/* ─── Agent Registry (shared source of truth) ─── */

interface AgentDef {
  name: string;
  href: string;
  desc: string;
  cadence: "Daily" | "Weekly" | "Monthly" | "Self-paced";
  artifact: string;
  category: string;
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
  },

  /* ── Market ETF Analysis ── */
  {
    name: "S&P 500 Long-Term Performance",
    href: "/agents/market-returns",
    desc: "Risk-return snapshots, volatility regimes, Sharpe ratios, and bootstrap simulations.",
    cadence: "Monthly",
    artifact: "Analysis report",
    category: "Market ETF Analysis",
  },
  {
    name: "S&P 500 Market Analysis",
    href: "/agents/analysis/spy",
    desc: "Volatility regimes, tail risk, drawdowns, and HAR model forecasts for the S&P 500.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Market ETF Analysis",
  },
  {
    name: "QQQ Volatility & Risk",
    href: "/agents/analysis/qqq",
    desc: "Realized volatility, distributional statistics, and short-term forecasts for the Nasdaq-100 ETF.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Market ETF Analysis",
  },

  /* ── Company Analysis ── */
  {
    name: "NVIDIA Performance & Risk",
    href: "/agents/analysis/nvda",
    desc: "Earnings impact, profitability trend, volatility regimes, and risk analysis for NVDA — with SEC EDGAR fundamentals.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Company Analysis",
  },
  {
    name: "Apple Performance & Risk",
    href: "/agents/analysis/aapl",
    desc: "Earnings impact, profitability trend, volatility regimes, and risk analysis for AAPL — with SEC EDGAR fundamentals.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Company Analysis",
  },
  {
    name: "Alphabet Performance & Risk",
    href: "/agents/analysis/googl",
    desc: "Earnings impact, profitability trend, volatility regimes, and risk analysis for GOOGL — with SEC EDGAR fundamentals.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Company Analysis",
  },
  {
    name: "Microsoft Performance & Risk",
    href: "/agents/analysis/msft",
    desc: "Earnings impact, profitability trend, volatility regimes, and risk analysis for MSFT — with SEC EDGAR fundamentals.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Company Analysis",
  },
  {
    name: "Meta Platforms Performance & Risk",
    href: "/agents/analysis/meta",
    desc: "Earnings impact, profitability trend, volatility regimes, and risk analysis for META — with SEC EDGAR fundamentals.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Company Analysis",
  },

  /* ── Daily Monitors ── */
  {
    name: "Public Company Cyber Risk",
    href: "/agents/cyber-monitor",
    desc: "Confirmed cyber incidents affecting listed companies, SEC investigations, securities class actions, and material operational disruptions with equity relevance.",
    cadence: "Daily",
    artifact: "Brief",
    category: "Daily Monitors",
  },
  {
    name: "Oil Market Monitor",
    href: "/agents/oil-market-monitor",
    desc: "EIA inventories, OPEC actions, sanctions decisions, supply disruptions, and demand signals.",
    cadence: "Daily",
    artifact: "Brief",
    category: "Daily Monitors",
  },
  {
    name: "G10 Macro Releases",
    href: "/agents/macro-market-monitor",
    desc: "G10 central bank rate decisions, official policy statements, and major data releases including CPI, NFP, GDP, and PMI.",
    cadence: "Daily",
    artifact: "Brief",
    category: "Daily Monitors",
  },
  {
    name: "Crypto Regulatory Shifts",
    href: "/agents/crypto-regulatory",
    desc: "Binding rule changes, stablecoin framework enactments, exchange licensing actions, major enforcement, and court rulings changing classification or scope.",
    cadence: "Daily",
    artifact: "Brief",
    category: "Daily Monitors",
  },
  {
    name: "Crypto ETF Access",
    href: "/agents/crypto-etf-access",
    desc: "ETF approvals, rejections, filings, listing decisions, and flow-related structural milestones for crypto capital access vehicles.",
    cadence: "Daily",
    artifact: "Brief",
    category: "Daily Monitors",
  },

  /* ── Highlights ── */
  {
    name: "Weekly Monitoring Highlights",
    href: "/agents/weekly-cross-brief",
    desc: "Top items across all monitors from the past week, ranked by significance.",
    cadence: "Weekly",
    artifact: "Brief",
    category: "Highlights",
  },

  /* ── Weekly Company Deep Dives ── */
  {
    name: "OpenAI Weekly Topic Map",
    href: "/agents/openai-weekly",
    desc: "Product launches, API updates, partnerships, and strategic developments from OpenAI.",
    cadence: "Weekly",
    artifact: "Topic map",
    category: "Weekly Company Deep Dives",
  },
  {
    name: "Google Weekly Topic Map",
    href: "/agents/google-weekly",
    desc: "Product launches, AI initiatives, cloud strategy, and ecosystem developments from Google.",
    cadence: "Weekly",
    artifact: "Topic map",
    category: "Weekly Company Deep Dives",
  },
  {
    name: "Apple Weekly Topic Map",
    href: "/agents/apple-weekly",
    desc: "Product launches, services expansion, and platform developments from Apple.",
    cadence: "Weekly",
    artifact: "Topic map",
    category: "Weekly Company Deep Dives",
  },
  {
    name: "Microsoft Weekly Topic Map",
    href: "/agents/microsoft-weekly",
    desc: "Azure strategy, AI integration, enterprise developments, and ecosystem shifts from Microsoft.",
    cadence: "Weekly",
    artifact: "Topic map",
    category: "Weekly Company Deep Dives",
  },
  {
    name: "NVIDIA Weekly Topic Map",
    href: "/agents/nvidia-weekly",
    desc: "GPU architecture, data center strategy, AI compute developments, and supply chain shifts from NVIDIA.",
    cadence: "Weekly",
    artifact: "Topic map",
    category: "Weekly Company Deep Dives",
  },
  {
    name: "Meta Weekly Topic Map",
    href: "/agents/meta-weekly",
    desc: "AI research, social platform strategy, Reality Labs developments, and ecosystem shifts from Meta.",
    cadence: "Weekly",
    artifact: "Topic map",
    category: "Weekly Company Deep Dives",
  },

  /* ── Weekly Industry Deep Dives ── */
  {
    name: "Semiconductors & Supply Chain",
    href: "/agents/semis-supply-chain",
    desc: "Fab investments, export controls, supply constraints, packaging advances.",
    cadence: "Weekly",
    artifact: "Topic map",
    category: "Weekly Industry Deep Dives",
  },

  /* ── Deep Research Reviews ── */
  {
    name: "Volatility & Risk Modeling",
    href: "/agents/deep-research/volatility-risk",
    desc: "Audio narratives walking through influential papers in volatility modeling and asset pricing.",
    cadence: "Self-paced",
    artifact: "Audio series",
    category: "Deep Research Reviews",
  },

  /* ── Paper Briefs ── */
  {
    name: "Modeling and Forecasting Realized Volatility",
    href: "/agents/paper-briefs/realized-volatility",
    desc: "Andersen, Bollerslev, Diebold & Labys · Econometrica 2003 · How high-frequency intraday returns construct nonparametric realized volatility measures.",
    cadence: "Self-paced",
    artifact: "Audio brief",
    category: "Paper Briefs",
  },
  {
    name: "Tail Risk and Asset Prices",
    href: "/agents/paper-briefs/tail-risk",
    desc: "Kelly & Jiang · The Review of Financial Studies 2014 · Cross-sectional tail risk measurement and its predictive power for market returns.",
    cadence: "Self-paced",
    artifact: "Audio brief",
    category: "Paper Briefs",
  },

  /* ── Quantitative Concepts ── */
  {
    name: "Understanding Variance",
    href: "/agents/learn/variance",
    desc: "From visual intuition to mathematical precision. See how variance captures the 'jitter' in data.",
    cadence: "Self-paced",
    artifact: "Interactive lesson",
    category: "Quantitative Concepts",
  },
  {
    name: "Standard Deviation (σ)",
    href: "/agents/learn/standard-deviation",
    desc: "How σ measures spread, the 68-95-99.7 rule, and when ±σ notation breaks down.",
    cadence: "Self-paced",
    artifact: "Interactive lesson",
    category: "Quantitative Concepts",
  },
  {
    name: "Bootstrap Resampling",
    href: "/agents/learn/bootstrap-resampling",
    desc: "Use real S&P 500 data to understand sampling distributions and quantify uncertainty.",
    cadence: "Self-paced",
    artifact: "Interactive lesson",
    category: "Quantitative Concepts",
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

function groupByCategory(list: AgentDef[]): Map<string, AgentDef[]> {
  const map = new Map<string, AgentDef[]>();
  for (const a of list) {
    if (!map.has(a.category)) map.set(a.category, []);
    map.get(a.category)!.push(a);
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
  return map;
}

const FAVORITES_KEY = "financelab_favorites";

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

function CadenceIcon({ cadence }: { cadence: AgentDef["cadence"] }) {
  const cls =
    cadence === "Daily"
      ? styles.cadenceIconDaily
      : cadence === "Weekly"
        ? styles.cadenceIconWeekly
        : cadence === "Monthly"
          ? styles.cadenceIconMonthly
          : styles.cadenceIconSelf;

  switch (cadence) {
    case "Daily":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={cls}>
          <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "Weekly":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={cls}>
          <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "Monthly":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={cls}>
          <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <text x="8" y="12" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="700">31</text>
        </svg>
      );
    case "Self-paced":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={cls}>
          <path d="M1.5 6.5L8 3l6.5 3.5L8 10 1.5 6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M4 8v3.5c0 0 1.5 1.5 4 1.5s4-1.5 4-1.5V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.5 6.5V11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
  }
}

function StarIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#e6a817">
      <path d="M8 1.5l1.85 3.75 4.15.6-3 2.93.71 4.12L8 10.88l-3.71 1.95.71-4.12-3-2.93 4.15-.6L8 1.5z" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M8 1.5l1.85 3.75 4.15.6-3 2.93.71 4.12L8 10.88l-3.71 1.95.71-4.12-3-2.93 4.15-.6L8 1.5z" />
    </svg>
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
      <button
        className={`${styles.starBtn} ${isFavorited ? styles.starBtnActive : ""}`}
        onClick={() => onToggleFavorite(agent.href)}
        aria-label={isFavorited ? "Remove from feed" : "Add to feed"}
      >
        <StarIcon filled={isFavorited} />
      </button>
      <a href={agent.href} className={styles.agentRowLink}>
        <div className={styles.agentRowMain}>
          <div className={styles.agentRowName}>{agent.name}</div>
          <div className={styles.agentRowDesc}>{agent.desc}</div>
        </div>
        <div className={styles.agentRowMeta}>
          <span className={styles.cadenceBadge}>
            <CadenceIcon cadence={agent.cadence} />
            {agent.cadence}
          </span>
          <span className={styles.artifactLabel}>{agent.artifact}</span>
        </div>
        <div className={styles.agentRowArrow}>
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
  { label: "Crypto", query: "crypto" },
  { label: "Volatility", query: "volatility" },
  { label: "S&P", query: "s&p" },
  { label: "ETF", query: "etf" },
  { label: "Research", query: "research" },
  { label: "Macro", query: "macro" },
  { label: "AI & Tech", query: "ai" },
  { label: "AAPL", query: "aapl" },
  { label: "Interactive", query: "interactive" },
];

/* ─── Dashboard ─── */

export default function Dashboard() {
  const { user, tier } = useAuth();
  const [tab, setTab] = useState<"feed" | "explore">("feed");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadFavorites();
    setFavorites(loaded);
    if (loaded.size === 0) setTab("explore");
    setHydrated(true);
  }, []);

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
  const filtered = q
    ? agents.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.desc.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.cadence.toLowerCase().includes(q) ||
          a.artifact.toLowerCase().includes(q)
      )
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
          {tier === "pro" && <span className={styles.proBadge}>Pro</span>}
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
            {favorites.size > 0 && <span className={styles.tabCount}>{favorites.size}</span>}
          </button>
          <button className={`${styles.tab} ${tab === "explore" ? styles.tabActive : ""}`} onClick={() => setTab("explore")}>
            Explore
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
                placeholder="Search agents, topics, or categories…"
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
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M20 5l4.63 9.38L35 16l-7.5 7.32L29.25 35 20 29.69 10.75 35l1.75-11.68L5 16l10.37-1.62L20 5z" stroke="#c5c5ce" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <h3 className={styles.emptyTitle}>Your feed is empty</h3>
                <p className={styles.emptyDesc}>
                  Star agents in Explore to add them to your personal feed for quick daily access.
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