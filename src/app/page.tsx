"use client";

import { useAuth } from "@/lib/auth";
import styles from "./page.module.css";

/* ─── Agent Catalog ─── */

interface Agent {
  domain: string;
  status: "live" | "soon";
  name: string;
  href: string;
  desc: string;
  cadence: string;
  artifact: string;
  tier: string;
}

const analysisAgents: Agent[] = [
  {
    domain: "Markets",
    status: "live",
    name: "Market Returns",
    href: "/agents/market-returns",
    desc: "Comprehensive S&P 500 analysis covering risk-return snapshots, volatility regimes, Sharpe ratios, and bootstrap simulations.",
    cadence: "Daily",
    artifact: "Analysis report",
    tier: "Free",
  },
  {
    domain: "Markets",
    status: "live",
    name: "Volatility Lab",
    href: "/agents/volatility-lab",
    desc: "Analyzes realized volatility across multiple windows with distributional statistics and short-term forecasts for any ticker.",
    cadence: "Daily",
    artifact: "Analysis report",
    tier: "Free",
  },
  {
    domain: "Economy",
    status: "live",
    name: "U.S. Macro Dashboard",
    href: "/agents/macro-dashboard",
    desc: "Unified view of rates, inflation, GDP, and federal debt with FRED data.",
    cadence: "Daily",
    artifact: "Analysis report",
    tier: "Free",
  },
];

const monitorAgents: Agent[] = [
  {
    domain: "Security",
    status: "live",
    name: "Cyber Monitor",
    href: "/agents/cyber-monitor",
    desc: "Delivers a daily brief covering confirmed breaches, ransomware incidents, outages, and exploited vulnerabilities.",
    cadence: "Daily",
    artifact: "Brief",
    tier: "Free",
  },
  {
    domain: "Energy",
    status: "live",
    name: "Energy Monitor",
    href: "/agents/energy-monitor",
    desc: "Tracks policy shifts, infrastructure events, and commodity signals across global energy markets.",
    cadence: "Daily",
    artifact: "Brief",
    tier: "Free",
  },
  {
    domain: "Regulation",
    status: "live",
    name: "Regulatory Watch",
    href: "/agents/regulatory-watch",
    desc: "Monitors regulatory changes, enforcement actions, and policy developments across financial jurisdictions.",
    cadence: "Daily",
    artifact: "Brief",
    tier: "Free",
  },
  {
    domain: "Crypto",
    status: "live",
    name: "Crypto Monitor",
    href: "/agents/crypto-monitor",
    desc: "Tracks market-moving developments, protocol updates, and regulatory actions across cryptocurrency markets.",
    cadence: "Daily",
    artifact: "Brief",
    tier: "Free",
  },
];

const trackingAgents: Agent[] = [
  {
    domain: "Technology",
    status: "live",
    name: "Micro-SaaS Map",
    href: "/agents/micro-saas-map",
    desc: "Tracks developments across the micro-SaaS landscape, organized into structured topic maps updated daily.",
    cadence: "Daily",
    artifact: "Topic map",
    tier: "Free",
  },
  {
    domain: "Technology",
    status: "live",
    name: "Big Tech Evolution",
    href: "/agents/big-tech-evolution",
    desc: "Structured topic maps tracking product launches, strategy shifts, and ecosystem developments across major tech companies.",
    cadence: "Daily",
    artifact: "Topic map",
    tier: "Free",
  },
];

const audioAgents: Agent[] = [
  {
    domain: "Research",
    status: "live",
    name: "Paper Briefs",
    href: "/agents/paper-briefs",
    desc: "Weekly audio narratives of influential ML papers. Each episode distills a key research paper into a concise audio brief.",
    cadence: "Weekly",
    artifact: "Audio + Summary",
    tier: "Free",
  },
];

const learningAgents: Agent[] = [
  {
    domain: "Education",
    status: "live",
    name: "Statistical Foundations",
    href: "/agents/statistical-foundations",
    desc: "Interactive walk-throughs for variance, standard deviation, and bootstrap resampling with live visualizations.",
    cadence: "Self-paced",
    artifact: "Interactive flow",
    tier: "Free",
  },
];

/* ─── Components ─── */

function AgentCard({ agent }: { agent: Agent }) {
  const isDisabled = agent.status === "soon";
  return (
    <a
      href={isDisabled ? undefined : agent.href}
      className={`${styles.agentCard} ${isDisabled ? styles.agentCardDisabled : ""}`}
    >
      <div className={styles.agentTop}>
        <div className={styles.agentDomain}>{agent.domain}</div>
        {agent.status === "live" ? (
          <div className={styles.agentStatus}>Live</div>
        ) : (
          <div className={styles.agentStatusSoon}>Coming soon</div>
        )}
      </div>
      <div className={styles.agentName}>{agent.name}</div>
      <p className={styles.agentDesc}>{agent.desc}</p>
      <div className={styles.agentFooter}>
        <div>
          <div className={styles.agentMetaVal}>{agent.cadence}</div>
          <div className={styles.agentMetaKey}>Cadence</div>
        </div>
        <div>
          <div className={styles.agentMetaVal}>{agent.artifact}</div>
          <div className={styles.agentMetaKey}>Artifact</div>
        </div>
        <div>
          <div className={styles.agentMetaVal}>{agent.tier}</div>
          <div className={styles.agentMetaKey}>Tier</div>
        </div>
      </div>
    </a>
  );
}

function UserNav() {
  const { user, isAuthenticated, isLoading, tier, login } = useAuth();

  if (isLoading) {
    return <div className={styles.navCtaPlaceholder} />;
  }

  if (!isAuthenticated || !user) {
    return (
      <button className={styles.navCta} onClick={() => login("/")}>
        Sign in
      </button>
    );
  }

  const initials =
    ((user.first_name?.[0] || "") + (user.last_name?.[0] || "")).toUpperCase() ||
    user.email[0].toUpperCase();

  return (
    <div className={styles.navUserGroup}>
      {tier === "pro" && <span className={styles.navProBadge}>Pro</span>}
      <a href="/settings" className={styles.navUser}>
        {user.picture_url ? (
          <img
            src={user.picture_url}
            alt={initials}
            className={styles.navAvatar}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={styles.navAvatarFallback}>{initials}</div>
        )}
      </a>
    </div>
  );
}

/* ─── Page ─── */

export default function Home() {
  const totalAgents =
    analysisAgents.length +
    monitorAgents.length +
    trackingAgents.length +
    audioAgents.length +
    learningAgents.length;

  return (
    <>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <div className={styles.navLogo}>InScien</div>
          <div className={styles.navLinks}>
            <a href="#agents">Agents</a>
            <a href="#how">How it works</a>
            <a href="/pricing">Pricing</a>
          </div>
        </div>
        <UserNav />
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroEyebrow}>Always-on analysis agents</div>
        <h1>
          Agents that
          <br />
          <span className={styles.rotatingWrapper}>
            <span className={styles.rotatingWords}>
              <span>monitor.</span>
              <span>analyze.</span>
              <span>brief you.</span>
              <span>monitor.</span>
            </span>
          </span>
        </h1>
        <p className={styles.heroDesc}>
          InScien runs continuous analysis agents across markets, research, and
          technology. Each agent has a defined job, operates on a set cadence,
          and delivers structured artifacts you can act on.
        </p>
        <div className={styles.heroActions}>
          <a href="#agents" className={styles.btnPrimary}>
            Explore agents →
          </a>
          <a href="#how" className={styles.btnGhost}>
            How it works
          </a>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statVal}>{totalAgents}</div>
            <div className={styles.statKey}>Active agents</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statVal}>Daily</div>
            <div className={styles.statKey}>Minimum cadence</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statVal}>50K+</div>
            <div className={styles.statKey}>Sources processed daily</div>
          </div>
        </div>
      </section>

      <div className={styles.divider}>
        <hr />
      </div>

      {/* Agents */}
      <section className={styles.section} id="agents">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>Agent Catalog</div>
          <div className={styles.sectionTitle}>Running systems</div>
          <p className={styles.sectionDesc}>
            Each agent covers a single domain, runs on a fixed schedule, and
            produces structured artifacts. Enable the ones relevant to your
            work.
          </p>
        </div>

        {/* Analysis Providers */}
        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Analysis Providers</div>
          <div className={styles.agentsGrid}>
            {analysisAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>

        {/* Material Event Monitors */}
        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Material Event Monitors</div>
          <div className={styles.agentsGrid}>
            {monitorAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>

        {/* In-Depth Tracking */}
        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>In-Depth Development Tracking</div>
          <div className={styles.agentsGrid}>
            {trackingAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>

        {/* Audio Briefs */}
        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Audio Briefs</div>
          <div className={styles.agentsGridWide}>
            {audioAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>

        {/* Interactive Learning */}
        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Interactive Learning</div>
          <div className={styles.agentsGridWide}>
            {learningAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>
      </section>

      <div className={styles.divider}>
        <hr />
      </div>

      {/* How it works */}
      <section className={styles.section} id="how">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>How It Works</div>
          <div className={styles.sectionTitle}>Three steps. No setup.</div>
          <p className={styles.sectionDesc}>
            There is nothing to build or configure. You enable an agent and it
            starts working for you.
          </p>
        </div>

        <div className={styles.howGrid}>
          <div className={styles.howCard}>
            <div className={styles.howNum}>01</div>
            <div className={styles.howTitle}>Pick an agent</div>
            <p className={styles.howDesc}>
              Browse the catalog. Each agent covers a specific domain and
              performs a clear, recurring job. Enable the ones that match your
              needs.
            </p>
          </div>
          <div className={styles.howCard}>
            <div className={styles.howNum}>02</div>
            <div className={styles.howTitle}>It runs on its own</div>
            <p className={styles.howDesc}>
              Agents process sources according to their cadence, whether daily,
              weekly, or triggered by events. No manual input is required.
            </p>
          </div>
          <div className={styles.howCard}>
            <div className={styles.howNum}>03</div>
            <div className={styles.howTitle}>You receive artifacts</div>
            <p className={styles.howDesc}>
              Briefings, scorecards, audio summaries, and dashboards are
              delivered to your inbox, feed, or made available through the API.
            </p>
          </div>
        </div>
      </section>

      <div className={styles.divider}>
        <hr />
      </div>

      {/* Pricing */}
      <section className={styles.section} id="pricing">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>Pricing</div>
          <div className={styles.sectionTitle}>Simple, transparent pricing.</div>
          <p className={styles.sectionDesc}>
            Start free. Upgrade when you need full access.
          </p>
        </div>

        <div className={styles.pricingRow}>
          <div className={styles.priceCard}>
            <div className={styles.priceLabel}>Free</div>
            <div className={styles.priceAmount}>$0</div>
            <div className={styles.priceList}>
              <div className={styles.priceItem}>Access to all public agents</div>
              <div className={styles.priceItem}>Latest artifact from each agent</div>
              <div className={styles.priceItem}>Limited history</div>
            </div>
          </div>
          <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
            <div className={styles.priceLabel}>Early Access</div>
            <div className={styles.priceAmount}>
              $12 <span>/ month</span>
            </div>
            <div className={styles.priceList}>
              <div className={styles.priceItem}>Full artifact history and search</div>
              <div className={styles.priceItem}>All tickers and company tracking</div>
              <div className={styles.priceItem}>14-day timelines on topic maps</div>
              <div className={styles.priceItem}>Exports and API access</div>
              <div className={styles.priceItem}>Priority support</div>
            </div>
            <a href="/pricing" className={styles.priceCardCta}>
              View plans →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerCopy}>© 2026 InScien · Finance Lab Teknoloji A.Ş.</div>
        <div className={styles.footerLinks}>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <span>info@inscien.com</span>
        </div>
      </footer>
    </>
  );
}