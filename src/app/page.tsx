import styles from "./page.module.css";

const agents = [
  {
    domain: "Technology",
    status: "live" as const,
    name: "Micro-SaaS Map",
    href: "/agents/micro-saas-map",
    desc: "Tracks developments across the micro-SaaS landscape, organized into structured topic maps updated daily.",
    cadence: "Daily",
    artifact: "Topic map",
    tier: "Free",
  },
  {
    domain: "Technology",
    status: "live" as const,
    name: "Big Tech Evolution",
    href: "/agents/big-tech-evolution",
    desc: "Structured topic maps tracking product launches, strategy shifts, and ecosystem developments across major tech companies.",
    cadence: "Daily",
    artifact: "Topic map",
    tier: "Free",
  },
  {
    domain: "Security",
    status: "live" as const,
    name: "Cyber Monitor",
    href: "/agents/cyber-monitor",
    desc: "Delivers a daily brief covering confirmed breaches, ransomware incidents, outages, and exploited vulnerabilities.",
    cadence: "Daily",
    artifact: "Brief",
    tier: "Free",
  },
{
    domain: "Research",
    status: "live" as const,
    name: "Paper Briefs",
    href: "/agents/paper-briefs",
    desc: "Weekly audio narratives of influential ML papers. Each episode distills a key research paper into a concise audio brief.",
    cadence: "Weekly",
    artifact: "Audio + Summary",
    tier: "Free",
},
{
    domain: "Markets",
    status: "live" as const,
    name: "Market Returns",
    href: "/agents/market-returns",
    desc: "Comprehensive S&P 500 analysis covering risk-return snapshots, volatility regimes, Sharpe ratios, and bootstrap simulations.",
    cadence: "Daily",
    artifact: "Analysis report",
    tier: "Free",
},
{
    domain: "Markets",
    status: "live" as const,
    name: "Volatility Lab",
    href: "/agents/volatility-lab",
    desc: "Analyzes realized volatility across multiple windows with distributional statistics and short-term forecasts for any ticker.",
    cadence: "Daily",
    artifact: "Analysis report",
    tier: "Free",
},
  {
    domain: "Energy",
    status: "live" as const,
    name: "Energy Monitor",
    href: "/agents/energy-monitor",
    desc: "Tracks policy shifts, infrastructure events, and commodity signals across global energy markets.",
    cadence: "Daily",
    artifact: "Brief + Dashboard",
    tier: "Pro",
  },
  {
    domain: "Economy",
    status: "live" as const,
    name: "U.S. Macro Dashboard",
    href: "/agents/macro-dashboard",
    desc: "Unified view of rates, inflation, GDP, and federal debt with FRED data.",
    cadence: "Daily",
    artifact: "Analysis report",
    tier: "Free",
  },
  {
    domain: "Regulation",
    status: "live" as const,
    name: "Regulatory Watch",
    href: "/agents/regulatory-watch",
    desc: "Monitors regulatory changes, enforcement actions, and policy developments across financial jurisdictions.",
    cadence: "Daily",
    artifact: "Brief",
    tier: "Free",
  },
  {
    domain: "Crypto",
    status: "live" as const,
    name: "Crypto Monitor",
    href: "/agents/crypto-monitor",
    desc: "Tracks market-moving developments, protocol updates, and regulatory actions across cryptocurrency markets.",
    cadence: "Daily",
    artifact: "Brief",
    tier: "Free",
  },
];

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <div className={styles.navLogo}>InScien</div>
          <div className={styles.navLinks}>
            <a href="#agents">Agents</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
          </div>
        </div>
        <button className={styles.navCta}>Get early access</button>
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
            <div className={styles.statVal}>5</div>
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

        <div className={styles.agentsGrid}>
          {agents.map((agent) => (
            <a
              key={agent.name}
              href={agent.status === "live" ? agent.href : undefined}
              className={`${styles.agentCard} ${agent.status === "soon" ? styles.agentCardDisabled : ""}`}
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
          ))}
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
          <div className={styles.sectionTitle}>Pay for control, not content.</div>
          <p className={styles.sectionDesc}>
            The free tier gets you started. Pro gives you the tools to depend on
            it.
          </p>
        </div>

        <div className={styles.pricingRow}>
          <div className={styles.priceCard}>
            <div className={styles.priceLabel}>Free</div>
            <div className={styles.priceAmount}>$0</div>
            <div className={styles.priceList}>
              <div className={styles.priceItem}>Access to all public agents</div>
              <div className={styles.priceItem}>Latest artifact from each agent</div>
              <div className={styles.priceItem}>Email delivery</div>
              <div className={styles.priceItem}>Limited history</div>
            </div>
          </div>
          <div className={styles.priceCard}>
            <div className={styles.priceLabel}>Pro</div>
            <div className={styles.priceAmount}>
              TBD <span>/ month</span>
            </div>
            <div className={styles.priceList}>
              <div className={styles.priceItem}>Full artifact history and search</div>
              <div className={styles.priceItem}>Alerts and custom thresholds</div>
              <div className={styles.priceItem}>Configurable delivery channels</div>
              <div className={styles.priceItem}>Exports and API access</div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.divider}>
        <hr />
      </div>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Early access is opening soon.</h2>
        <p>
          Leave your email and we will notify you when new agents go live.
        </p>
        <div className={styles.ctaInput}>
          <input type="email" placeholder="you@company.com" />
          <button className={styles.btnPrimary}>Join waitlist</button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerCopy}>© 2026 InScien</div>
        <div className={styles.footerLinks}>
          <a href="#">X</a>
          <a href="#">LinkedIn</a>
          <a href="#">GitHub</a>
        </div>
      </footer>
    </>
  );
}