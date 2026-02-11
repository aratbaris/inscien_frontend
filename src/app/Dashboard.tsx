"use client";

import { useState } from "react";
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
  {
    name: "Volatility Lab",
    href: "/agents/volatility-lab",
    desc: "Realized volatility, distributional statistics, and short-term forecasts.",
    cadence: "Daily",
    artifact: "Analysis report",
    category: "Daily Analysis",
  },
  {
    name: "Cyber Risk Monitor",
    href: "/agents/cyber-monitor",
    desc: "Breaches, ransomware, exploited vulnerabilities, infrastructure outages.",
    cadence: "Daily",
    artifact: "Brief",
    category: "Daily Monitors",
  },
  {
    name: "Oil Supply Monitor",
    href: "/agents/energy-monitor",
    desc: "Crude supply disruptions, OPEC actions, sanctions, chokepoint incidents.",
    cadence: "Daily",
    artifact: "Brief",
    category: "Daily Monitors",
  },
  {
    name: "Financial Regulation Monitor",
    href: "/agents/regulatory-watch",
    desc: "Enforcement actions, rulemaking, supervisory changes from major regulators.",
    cadence: "Daily",
    artifact: "Brief",
    category: "Daily Monitors",
  },
  {
    name: "Crypto Regulation & Incidents",
    href: "/agents/crypto-monitor",
    desc: "Regulatory enforcement, exchange hacks, stablecoin events, licensing actions.",
    cadence: "Daily",
    artifact: "Brief",
    category: "Daily Monitors",
  },
  {
    name: "Big Tech Evolution",
    href: "/agents/big-tech-evolution",
    desc: "Product launches, strategy shifts, and ecosystem developments.",
    cadence: "Weekly",
    artifact: "Topic map",
    category: "Weekly Wrap-Ups",
  },
  {
    name: "Semiconductors & Supply Chain",
    href: "/agents/semis-supply-chain",
    desc: "Fab investments, export controls, supply constraints, packaging advances.",
    cadence: "Weekly",
    artifact: "Topic map",
    category: "Weekly Wrap-Ups",
  },
  {
    name: "Micro-SaaS Map",
    href: "/agents/micro-saas-map",
    desc: "Developments across the micro-SaaS landscape in structured topic maps.",
    cadence: "Weekly",
    artifact: "Topic map",
    category: "Weekly Wrap-Ups",
  },
  {
    name: "Volatility Research Briefs",
    href: "/agents/paper-briefs",
    desc: "Audio narratives of key papers in volatility modeling and asset pricing.",
    cadence: "Weekly",
    artifact: "Audio",
    category: "Research Briefs",
  },
  {
    name: "S&P Long-Term Performance",
    href: "/agents/market-returns",
    desc: "Risk-return snapshots, volatility regimes, Sharpe ratios, and bootstrap simulations.",
    cadence: "Monthly",
    artifact: "Analysis report",
    category: "Monthly Reviews",
  },
  {
    name: "U.S. Macro Dashboard",
    href: "/agents/macro-dashboard",
    desc: "Rates, inflation, GDP, and federal debt from FRED data.",
    cadence: "Monthly",
    artifact: "Analysis report",
    category: "Monthly Reviews",
  },
  {
    name: "Statistical Foundations",
    href: "/agents/statistical-foundations",
    desc: "Interactive walk-throughs for variance, standard deviation, and bootstrap resampling.",
    cadence: "Self-paced",
    artifact: "Interactive flow",
    category: "Learning",
  },
];

function groupByCategory(list: AgentDef[]): Map<string, AgentDef[]> {
  const map = new Map<string, AgentDef[]>();
  for (const a of list) {
    if (!map.has(a.category)) map.set(a.category, []);
    map.get(a.category)!.push(a);
  }
  return map;
}

const cadenceBadge: Record<string, string> = {
  Daily: styles.cadenceDaily ?? "",
  Weekly: styles.cadenceWeekly ?? "",
  Monthly: styles.cadenceMonthly ?? "",
  "Self-paced": styles.cadenceSelf ?? "",
};

/* ─── Components ─── */

function AgentRow({ agent }: { agent: AgentDef }) {
  return (
    <a href={agent.href} className={styles.agentRow}>
      <div className={styles.agentRowMain}>
        <div className={styles.agentRowName}>{agent.name}</div>
        <div className={styles.agentRowDesc}>{agent.desc}</div>
      </div>
      <div className={styles.agentRowMeta}>
        <span className={`${styles.cadenceBadge} ${cadenceBadge[agent.cadence] || ""}`}>
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
  );
}

/* ─── Dashboard ─── */

export default function Dashboard() {
  const { user, tier, logout } = useAuth();
  const [query, setQuery] = useState("");

  const firstName = user?.first_name || user?.email?.split("@")[0] || "there";

  const q = query.toLowerCase().trim();
  const filtered = q
    ? agents.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.desc.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.cadence.toLowerCase().includes(q)
      )
    : agents;

  const grouped = groupByCategory(filtered);

  const initials =
    ((user?.first_name?.[0] || "") + (user?.last_name?.[0] || "")).toUpperCase() ||
    (user?.email?.[0]?.toUpperCase() || "?");

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
              <img
                src={user.picture_url}
                alt={initials}
                className={styles.avatar}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={styles.avatarFallback}>{initials}</div>
            )}
          </a>
        </div>
      </nav>

      {/* Greeting + Search */}
      <header className={styles.greeting}>
        <h1 className={styles.greetingTitle}>
          Welcome back, {firstName}
        </h1>
        <p className={styles.greetingDesc}>
          {agents.length} agents running across daily, weekly, and monthly cadences.
        </p>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Filter agents…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className={styles.searchClear} onClick={() => setQuery("")}>
              ✕
            </button>
          )}
        </div>
      </header>

      {/* Agent groups */}
      <main className={styles.main}>
        {Array.from(grouped.entries()).map(([category, items]) => (
          <section key={category} className={styles.group}>
            <div className={styles.groupHeader}>
              <h2 className={styles.groupTitle}>{category}</h2>
              <span className={styles.groupCount}>{items.length}</span>
            </div>
            <div className={styles.groupList}>
              {items.map((a) => (
                <AgentRow key={a.href} agent={a} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>© 2026 FinanceLab · Finance Lab Teknoloji A.Ş.</span>
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