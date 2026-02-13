"use client";

import { useAuth } from "@/lib/auth";
import styles from "./landing.module.css";

/* ─── Agent Catalog ─── */

interface Agent {
  status: "live" | "soon";
  name: string;
  href: string;
  desc: string;
  cadence: string;
  artifact: string;
}

/* Monthly Market Reviews */
const monthlyReviewAgents: Agent[] = [
  {
    status: "live",
    name: "S&P Long-Term Performance",
    href: "/agents/market-returns",
    desc: "Comprehensive S&P 500 analysis covering risk-return snapshots, volatility regimes, Sharpe ratios, and bootstrap simulations.",
    cadence: "Monthly",
    artifact: "Analysis report",
  },
  {
    status: "live",
    name: "U.S. Macro Dashboard",
    href: "/agents/macro-dashboard",
    desc: "Unified view of rates, inflation, GDP, and federal debt with FRED data.",
    cadence: "Monthly",
    artifact: "Analysis report",
  },
];

/* Daily Analysis */
const dailyAnalysisAgents: Agent[] = [
  {
    status: "live",
    name: "Volatility Lab",
    href: "/agents/volatility-lab",
    desc: "Analyzes realized volatility across multiple windows with distributional statistics and short-term forecasts for any ticker.",
    cadence: "Daily",
    artifact: "Analysis report",
  },
];

/* Daily Monitors */
const dailyMonitorAgents: Agent[] = [
  {
    status: "live",
    name: "Public Company Cyber Risk",
    href: "/agents/cyber-monitor",
    desc: "Confirmed cyber incidents affecting publicly traded companies, SEC investigations, securities class actions, and material operational disruptions with equity relevance.",
    cadence: "Daily",
    artifact: "Brief",
  },
  {
    status: "live",
    name: "Oil Market Monitor",
    href: "/agents/oil-market-monitor",
    desc: "EIA inventories, OPEC actions, sanctions decisions, supply disruptions, and demand signals affecting oil markets.",
    cadence: "Daily",
    artifact: "Brief",
  },
  {
    status: "live",
    name: "G10 Macro Releases",
    href: "/agents/macro-market-monitor",
    desc: "G10 central bank rate decisions, official policy statements, and major data releases including CPI, PCE, NFP, GDP, PMI, retail sales, and unemployment.",
    cadence: "Daily",
    artifact: "Brief",
  },
  {
    status: "live",
    name: "Crypto Regulatory Shifts",
    href: "/agents/crypto-regulatory",
    desc: "Binding rule changes, stablecoin framework enactments, exchange licensing actions, major enforcement, and court rulings changing classification or scope.",
    cadence: "Daily",
    artifact: "Brief",
  },
  {
    status: "live",
    name: "Crypto ETF Access",
    href: "/agents/crypto-etf-access",
    desc: "ETF approvals, rejections, filings, listing decisions, and flow-related structural milestones for crypto capital access vehicles.",
    cadence: "Daily",
    artifact: "Brief",
  },
  {
    status: "live",
    name: "Weekly Highlights",
    href: "/agents/weekly-cross-brief",
    desc: "Top items across all monitors from the past week, ranked by significance.",
    cadence: "Weekly",
    artifact: "Brief",
  },
];

/* Company & Industry Weekly Wrap-Ups */
const weeklyWrapUpAgents: Agent[] = [
  {
    status: "live",
    name: "Big Tech Evolution",
    href: "/agents/big-tech-evolution",
    desc: "Weekly analysis of product launches, strategy shifts, and ecosystem developments across major tech companies.",
    cadence: "Weekly",
    artifact: "Weekly brief",
  },
  {
    status: "live",
    name: "Semiconductors & Supply Chain",
    href: "/agents/semis-supply-chain",
    desc: "Fab investments, export controls, supply constraints, packaging advances, and major design wins across the semiconductor ecosystem.",
    cadence: "Weekly",
    artifact: "Weekly brief",
  },
  {
    status: "live",
    name: "Micro-SaaS Map",
    href: "/agents/micro-saas-map",
    desc: "Tracks developments across the micro-SaaS landscape, organized into structured topic maps.",
    cadence: "Weekly",
    artifact: "Topic map",
  },
];

const audioAgents: Agent[] = [
  {
    status: "live",
    name: "Volatility Research Briefs",
    href: "/agents/paper-briefs",
    desc: "Audio narratives of influential papers in volatility modeling, tail risk, and asset pricing. Each episode distills a key research paper into a concise audio brief.",
    cadence: "Weekly",
    artifact: "Audio + Summary",
  },
];

const learningAgents: Agent[] = [
  {
    status: "live",
    name: "Statistical Foundations",
    href: "/agents/statistical-foundations",
    desc: "Interactive walk-throughs for variance, standard deviation, and bootstrap resampling with live visualizations.",
    cadence: "Self-paced",
    artifact: "Interactive flow",
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
          <div className={styles.agentMetaKey}>Output</div>
        </div>
      </div>
    </a>
  );
}

/* ─── Rhythm section data ─── */

interface RhythmItem {
  frequency: string;
  title: string;
  desc: string;
}

const rhythmItems: RhythmItem[] = [
  {
    frequency: "Daily",
    title: "Catalyst monitors",
    desc: "Equity-impacting cyber events, macro data releases, crypto regime changes, and oil supply signals. Only what moved or could move prices.",
  },
  {
    frequency: "Daily",
    title: "Risk & volatility analysis",
    desc: "Fresh numbers on any ticker. Realized volatility, distributional stats, and short-term forecasts updated every trading day.",
  },
  {
    frequency: "Weekly",
    title: "Industry wrap-ups",
    desc: "Big tech, semiconductors, and micro-SaaS developments distilled into structured briefs every week.",
  },
  {
    frequency: "Monthly",
    title: "Macro & market reviews",
    desc: "S&P performance, volatility regimes, rates, inflation, and federal debt. The longer view, refreshed monthly.",
  },
  {
    frequency: "Anytime",
    title: "Research & intuition",
    desc: "Audio briefs of key research papers and interactive tools for building quantitative intuition, on your own schedule.",
  },
];

/* ─── Landing Page ─── */

export default function Landing() {
  const { login } = useAuth();

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
            <a href="#rhythm">How it works</a>
            <a href="/pricing">Pricing</a>
          </div>
        </div>
        <button className={styles.navCta} onClick={() => login("/")}>
          Sign in
        </button>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <h1>
          Understand markets.
          <br />
          <span className={styles.rotatingWrapper}>
            <span className={styles.rotatingWords}>
              <span>Monitor daily catalysts.</span>
              <span>Track industry change.</span>
              <span>Analyze asset risk.</span>
              <span>Explore new research.</span>
              <span>Monitor daily catalysts.</span>
            </span>
          </span>
        </h1>
        <p className={styles.heroDesc}>
          Constraint and catalyst monitors, weekly industry wrap-ups,
          and research tools. Signal, not noise.
        </p>
        <div className={styles.heroActions}>
          <a href="#agents" className={styles.btnPrimary}>
            Explore agents
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#rhythm" className={styles.btnGhost}>
            How it works
          </a>
        </div>
      </section>

      <div className={styles.divider}>
        <hr />
      </div>

      {/* Agents */}
      <section className={styles.section} id="agents">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>What&apos;s Running</div>
          <div className={styles.sectionTitle}>High-signal monitors, ready when you are</div>
          <p className={styles.sectionDesc}>
            Each monitor tracks a narrow wedge of constraint changes, capital access shifts,
            or equity-impact events. Empty on quiet days by design.
          </p>
        </div>

        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Daily Analysis</div>
          <div className={styles.agentsGrid}>
            {dailyAnalysisAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>

        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Daily Monitors</div>
          <div className={styles.agentsGrid}>
            {dailyMonitorAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>

        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Company & Industry Weekly Wrap-Ups</div>
          <div className={styles.agentsGrid}>
            {weeklyWrapUpAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>

        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Monthly Market Reviews</div>
          <div className={styles.agentsGrid}>
            {monthlyReviewAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>

        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Research on the Go</div>
          <div className={styles.agentsGrid}>
            {audioAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>

        <div className={styles.categoryBlock}>
          <div className={styles.categoryLabel}>Build Your Intuition</div>
          <div className={styles.agentsGrid}>
            {learningAgents.map((a) => (
              <AgentCard key={a.name} agent={a} />
            ))}
          </div>
        </div>
      </section>

      <div className={styles.divider}>
        <hr />
      </div>

      {/* Product Rhythm */}
      <section className={styles.section} id="rhythm">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>Stay Current With Ease</div>
          <div className={styles.sectionTitle}>From morning catalysts to monthly deep dives</div>
          <p className={styles.sectionDesc}>
            Every layer of your financial awareness covered, from overnight constraint changes
            to long-term macro trends.
          </p>
        </div>

        <div className={styles.rhythmTimeline}>
          {rhythmItems.map((item) => (
            <div key={item.title} className={styles.rhythmItem}>
              <div className={styles.rhythmFreq}>{item.frequency}</div>
              <div className={styles.rhythmContent}>
                <div className={styles.rhythmTitle}>{item.title}</div>
                <p className={styles.rhythmDesc}>{item.desc}</p>
              </div>
            </div>
          ))}
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
            <div className={styles.priceFeaturedBadge}>Recommended</div>
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
              View plans
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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