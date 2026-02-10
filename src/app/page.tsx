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

/* Monthly Market Reviews */
const monthlyReviewAgents: Agent[] = [
  {
    domain: "Markets",
    status: "live",
    name: "S&P Long-Term Performance",
    href: "/agents/market-returns",
    desc: "Comprehensive S&P 500 analysis covering risk-return snapshots, volatility regimes, Sharpe ratios, and bootstrap simulations.",
    cadence: "Monthly",
    artifact: "Analysis report",
    tier: "Free",
  },
  {
    domain: "Economy",
    status: "live",
    name: "U.S. Macro Dashboard",
    href: "/agents/macro-dashboard",
    desc: "Unified view of rates, inflation, GDP, and federal debt with FRED data.",
    cadence: "Monthly",
    artifact: "Analysis report",
    tier: "Free",
  },
];

/* Daily Analysis */
const dailyAnalysisAgents: Agent[] = [
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
];

/* Daily Material Event Updates */
const dailyMonitorAgents: Agent[] = [
  {
    domain: "Security",
    status: "live",
    name: "Cyber Risk Monitor",
    href: "/agents/cyber-monitor",
    desc: "Confirmed breaches, ransomware incidents, actively exploited vulnerabilities, and major infrastructure outages requiring operational attention.",
    cadence: "Daily",
    artifact: "Brief",
    tier: "Free",
  },
  {
    domain: "Energy",
    status: "live",
    name: "Oil Supply Monitor",
    href: "/agents/energy-monitor",
    desc: "Tracks crude supply disruptions, OPEC actions, sanctions enforcement, and chokepoint incidents that can materially affect oil flows.",
    cadence: "Daily",
    artifact: "Brief",
    tier: "Free",
  },
  {
    domain: "Regulation",
    status: "live",
    name: "Financial Regulation Monitor",
    href: "/agents/regulatory-watch",
    desc: "Tracks enforcement actions, rulemaking, and supervisory changes from SEC, CFTC, FCA, ESMA, and other financial regulators.",
    cadence: "Daily",
    artifact: "Brief",
    tier: "Free",
  },
  {
    domain: "Crypto",
    status: "live",
    name: "Crypto Regulation & Incidents",
    href: "/agents/crypto-monitor",
    desc: "Regulatory enforcement, exchange hacks, stablecoin events, and licensing actions affecting crypto markets and infrastructure.",
    cadence: "Daily",
    artifact: "Brief",
    tier: "Free",
  },
];

/* Company & Industry Weekly Wrap-Ups */
const weeklyWrapUpAgents: Agent[] = [
  {
    domain: "Technology",
    status: "live",
    name: "Big Tech Evolution",
    href: "/agents/big-tech-evolution",
    desc: "Weekly analysis of product launches, strategy shifts, and ecosystem developments across major tech companies.",
    cadence: "Weekly",
    artifact: "Weekly brief",
    tier: "Free",
  },
  {
    domain: "Technology",
    status: "live",
    name: "Micro-SaaS Map",
    href: "/agents/micro-saas-map",
    desc: "Tracks developments across the micro-SaaS landscape, organized into structured topic maps.",
    cadence: "Weekly",
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
    monthlyReviewAgents.length +
    dailyAnalysisAgents.length +
    dailyMonitorAgents.length +
    weeklyWrapUpAgents.length +
    audioAgents.length +
    learningAgents.length;

  return (
    <>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <a href="/" className={styles.navLogo}>
            <img src="/icon.png" alt="" className={styles.navLogoIcon} />
            <span className={styles.navLogoText}>FinanceLab</span>
          </a>
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
        <div className={styles.heroEyebrow}>Your financial analysis companion</div>
        <h1>
          Understand markets.
          <br />
          <span className={styles.rotatingWrapper}>
            <span className={styles.rotatingWords}>
              <span>Monitor daily events.</span>
              <span>Track industry developments.</span>
              <span>Analyze asset risk.</span>
              <span>Explore new research.</span>
              <span>Monitor daily events.</span>
            </span>
          </span>
        </h1>
        <p className={styles.heroDesc}>
          FinanceLab brings together live market analysis, daily event monitoring,
          and research tools so you can follow what matters and make
          sense of it without the noise.
        </p>
        <div className={styles.heroActions}>
          <a href="#agents" className={styles.btnPrimary}>
            See what&apos;s running →
          </a>
          <a href="#how" className={styles.btnGhost}>
            How it works
          </a>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statVal}>{totalAgents}</div>
            <div className={styles.statKey}>Live agents</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statVal}>Daily</div>
            <div className={styles.statKey}>Updated continuously</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statVal}>50K+</div>
            <div className={styles.statKey}>Sources analyzed daily</div>
          </div>
        </div>
      </section>

      <div className={styles.divider}>
        <hr />
      </div>

      {/* Agents */}
      <section className={styles.section} id="agents">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>What&apos;s Running</div>
          <div className={styles.sectionTitle}>Everything runs daily, ready when you are</div>
          <p className={styles.sectionDesc}>
            From live risk metrics to market-moving events to research you can
            listen to on the go. Pick what&apos;s relevant to you.
          </p>
        </div>

        {/* Daily Analysis */}
        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Daily Analysis</div>
          <div className={styles.agentsGridWide}>
            {dailyAnalysisAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>

        {/* Daily Material Event Updates */}
        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Daily Event-Driven Updates</div>
          <div className={styles.agentsGrid}>
            {dailyMonitorAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>

        {/* Company & Industry Weekly Wrap-Ups */}
        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Company & Industry Weekly Wrap-Ups</div>
          <div className={styles.agentsGrid}>
            {weeklyWrapUpAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>

        {/* Monthly Market Reviews */}
        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Monthly Market Reviews</div>
          <div className={styles.agentsGrid}>
            {monthlyReviewAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>
        
        {/* Audio Briefs */}
        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Research on the Go</div>
          <div className={styles.agentsGridWide}>
            {audioAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>

        {/* Interactive Learning */}
        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Build Your Intuition</div>
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
          <div className={styles.sectionTitle}>Open it up and start reading.</div>
          <p className={styles.sectionDesc}>
            No setup, no configuration. Everything is already running.
          </p>
        </div>

        <div className={styles.howGrid}>
          <div className={styles.howCard}>
            <div className={styles.howNum}>01</div>
            <div className={styles.howTitle}>Pick what matters to you</div>
            <p className={styles.howDesc}>
              Markets, cyber, energy, regulation, tech. Each area is
              covered by a dedicated agent that runs every day.
            </p>
          </div>
          <div className={styles.howCard}>
            <div className={styles.howNum}>02</div>
            <div className={styles.howTitle}>Everything stays current</div>
            <p className={styles.howDesc}>
              Agents process thousands of sources daily and surface only
              what is material. Analysis is updated, not stale.
            </p>
          </div>
          <div className={styles.howCard}>
            <div className={styles.howNum}>03</div>
            <div className={styles.howTitle}>Read, listen, explore</div>
            <p className={styles.howDesc}>
              Daily briefs when you need a quick view. Audio summaries for
              your commute. Interactive tools when you want to go deeper.
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
        <div className={styles.footerCopy}>© 2026 FinanceLab · Finance Lab Teknoloji A.Ş.</div>
        <div className={styles.footerLinks}>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <span>info@financelab.ai</span>
        </div>
      </footer>
    </>
  );
}