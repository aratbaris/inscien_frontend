"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import styles from "./landing.module.css";

/* ─── Agent Catalog (landing subset: up to 3 per section) ─── */

interface Agent {
  name: string;
  href: string;
  desc: string;
  cadence: string;
  artifact: string;
  access: "free" | "trial";
}

const marketAnalysisAgents: Agent[] = [
  { name: "S&P 500 Market Analysis", href: "/agents/analysis/spy", desc: "Volatility regimes, tail risk, drawdowns, and short-term forecasts.", cadence: "Daily", artifact: "Analysis report", access: "free" },
  { name: "QQQ Volatility & Risk", href: "/agents/analysis/qqq", desc: "Realized volatility and risk metrics for the Nasdaq-100 ETF.", cadence: "Daily", artifact: "Analysis report", access: "trial" },
  { name: "U.S. Macro Dashboard", href: "/agents/macro-dashboard", desc: "Rates, inflation, GDP, and federal debt from FRED data.", cadence: "Monthly", artifact: "Analysis report", access: "free" },
];

const companyAnalysisAgents: Agent[] = [
  { name: "Apple Performance & Risk", href: "/agents/analysis/aapl", desc: "Earnings impact, volatility regimes, and risk analysis for AAPL.", cadence: "Daily", artifact: "Analysis report", access: "free" },
  { name: "NVIDIA Performance & Risk", href: "/agents/analysis/nvda", desc: "Earnings impact, volatility regimes, and risk analysis for NVDA.", cadence: "Daily", artifact: "Analysis report", access: "trial" },
];

const dailyMonitorAgents: Agent[] = [
  { name: "G10 Macro Releases", href: "/agents/macro-market-monitor", desc: "Central bank decisions, policy statements, and major data releases.", cadence: "Daily", artifact: "Brief", access: "trial" },
  { name: "Oil Market Monitor", href: "/agents/oil-market-monitor", desc: "EIA inventories, OPEC actions, sanctions, and supply disruptions.", cadence: "Daily", artifact: "Brief", access: "trial" },
  { name: "Public Company Cyber Risk", href: "/agents/cyber-monitor", desc: "Cyber incidents affecting listed companies with equity relevance.", cadence: "Daily", artifact: "Brief", access: "trial" },
];

const deepDiveAgents: Agent[] = [
  { name: "Apple Weekly Topic Map", href: "/agents/apple-weekly", desc: "Product launches, services, and platform developments.", cadence: "Weekly", artifact: "Topic map", access: "free" },
  { name: "NVIDIA Weekly Topic Map", href: "/agents/nvidia-weekly", desc: "GPU architecture, data center strategy, and AI compute.", cadence: "Weekly", artifact: "Topic map", access: "trial" },
  { name: "Semiconductors & Supply Chain", href: "/agents/semis-supply-chain", desc: "Fab investments, export controls, and packaging advances.", cadence: "Weekly", artifact: "Topic map", access: "trial" },
];

const researchAgents: Agent[] = [
  { name: "Realized Volatility", href: "/agents/paper-briefs/realized-volatility", desc: "Andersen, Bollerslev, Diebold & Labys (2003).", cadence: "Self-paced", artifact: "Audio brief", access: "free" },
  { name: "Tail Risk and Asset Prices", href: "/agents/paper-briefs/tail-risk", desc: "Kelly & Jiang (2014).", cadence: "Self-paced", artifact: "Audio brief", access: "free" },
  { name: "Bootstrap Resampling", href: "/agents/learn/bootstrap-resampling", desc: "Sampling distributions using real S&P 500 data.", cadence: "Self-paced", artifact: "Interactive lesson", access: "free" },
];

/* ─── Scroll Reveal Hook ─── */

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    const children = el.querySelectorAll(`.${styles.reveal}`);
    children.forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ─── Components ─── */

function AccessBadge({ access }: { access: Agent["access"] }) {
  if (access === "free") return <span className={styles.badgeFree}>Free</span>;
  return <span className={styles.badgeTrial}>Trial</span>;
}

function AgentCard({ agent, idx }: { agent: Agent; idx: number }) {
  return (
    <a href={agent.href} className={`${styles.agentCard} ${styles.reveal}`} style={{ transitionDelay: `${idx * 80}ms` }}>
      <div className={styles.agentTop}>
        <AccessBadge access={agent.access} />
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

function AgentSection({ label, agents }: { label: string; agents: Agent[] }) {
  const ref = useScrollReveal();
  return (
    <div className={styles.categoryBlock} ref={ref}>
      <div className={`${styles.categoryLabel} ${styles.reveal}`}>{label}</div>
      <div className={styles.agentsGrid}>
        {agents.map((a, i) => (
          <AgentCard key={a.name} agent={a} idx={i} />
        ))}
      </div>
    </div>
  );
}

/* ─── Landing Page ─── */

export default function Landing() {
  const { login } = useAuth();
  const howRef = useScrollReveal();
  const pricingRef = useScrollReveal();

  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
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
          <button className={styles.navCta} onClick={() => login("/")}>
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero — full viewport */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroH1}>
            <span className={styles.heroLine1}>Financial analysis, automated.</span>
            <span className={styles.rotatingWrapper}>
              <span className={styles.rotatingWords}>
                <span>Risk reports.</span>
                <span>Event monitors.</span>
                <span>Company reviews.</span>
                <span>Risk reports.</span>
              </span>
            </span>
          </h1>
          <p className={styles.heroDesc}>
            Subscribe to agents covering equities, macro, energy, and crypto.
            <br />
            Get daily reports and weekly reviews in your feed.
          </p>
          <div className={styles.heroActions}>
            <a href="#agents" className={styles.btnPrimary}>
              Explore agents
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#how" className={styles.btnGhost}>
              How it works
            </a>
          </div>
        </div>
        <div className={styles.scrollHint}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M6 12l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* Agents */}
      <section className={styles.section} id="agents">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>What&apos;s Running</div>
            <h2 className={styles.sectionTitle}>Explore agents</h2>
            <p className={styles.sectionDesc}>
              Sign up free and start exploring. Pro unlocks all 28 agents and full history.
            </p>
          </div>

          <AgentSection label="Market & Macro Analysis" agents={marketAnalysisAgents} />
          <AgentSection label="Company Analysis" agents={companyAnalysisAgents} />
          <AgentSection label="Daily Event Monitors" agents={dailyMonitorAgents} />
          <AgentSection label="Company & Industry Deep Dives" agents={deepDiveAgents} />
          <AgentSection label="Research & Learning" agents={researchAgents} />
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.sectionAlt} id="how">
        <div className={styles.sectionInner} ref={howRef}>
          <div className={`${styles.sectionHeader} ${styles.sectionHeaderCenter}`}>
            <div className={styles.sectionEyebrow}>How It Works</div>
            <h2 className={styles.sectionTitle}>Three steps to your feed</h2>
          </div>

          <div className={styles.howSteps}>
            <div className={`${styles.howStep} ${styles.reveal}`} style={{ transitionDelay: "0ms" }}>
              <div className={styles.howIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
              </div>
              <div className={styles.howTitle}>Explore</div>
              <div className={styles.howDesc}>Browse agents covering equities, macro, energy, and crypto.</div>
            </div>
            <div className={styles.howConnector}>
              <div className={styles.howConnectorLine} />
            </div>
            <div className={`${styles.howStep} ${styles.reveal}`} style={{ transitionDelay: "120ms" }}>
              <div className={styles.howIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 6h11"/><path d="M10 12h11"/><path d="M10 18h11"/><path d="M3 6l1.5 1.5L7 5"/><path d="M3 12l1.5 1.5L7 11"/><path d="M3 18l1.5 1.5L7 17"/></svg>
              </div>
              <div className={styles.howTitle}>Choose</div>
              <div className={styles.howDesc}>Select the agents you want in your feed.</div>
            </div>
            <div className={styles.howConnector}>
              <div className={styles.howConnectorLine} />
            </div>
            <div className={`${styles.howStep} ${styles.reveal}`} style={{ transitionDelay: "240ms" }}>
              <div className={styles.howIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>
              </div>
              <div className={styles.howTitle}>Receive</div>
              <div className={styles.howDesc}>Reports land on a daily, weekly, or monthly schedule.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.section} id="pricing">
        <div className={styles.sectionInner} ref={pricingRef}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>Pricing</div>
            <h2 className={styles.sectionTitle}>Start free, upgrade when you need more</h2>
            <p className={styles.sectionDesc}>
              Free accounts get full access to selected agents. Pro unlocks everything.
            </p>
          </div>

          <div className={styles.pricingRow}>
            <div className={`${styles.priceCard} ${styles.reveal}`} style={{ transitionDelay: "0ms" }}>
              <div className={styles.priceLabel}>Free</div>
              <div className={styles.priceAmount}>$0</div>
              <div className={styles.priceList}>
                <div className={styles.priceItem}>Access to all free-tier agents</div>
                <div className={styles.priceItem}>Latest report from each agent</div>
                <div className={styles.priceItem}>All research briefs and lessons</div>
              </div>
            </div>
            <div className={`${styles.priceCard} ${styles.priceCardFeatured} ${styles.reveal}`} style={{ transitionDelay: "100ms" }}>
              <div className={styles.priceFeaturedBadge}>Recommended</div>
              <div className={styles.priceLabel}>Pro</div>
              <div className={styles.priceAmount}>
                $12 <span>/ month</span>
              </div>
              <div className={styles.priceList}>
                <div className={styles.priceItem}>All 28 agents unlocked</div>
                <div className={styles.priceItem}>Full report history and search</div>
                <div className={styles.priceItem}>All tickers and company tracking</div>
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
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerInner}>
          <h2 className={styles.ctaBannerTitle}>Start tracking markets today</h2>
          <p className={styles.ctaBannerDesc}>Free to sign up. No credit card required.</p>
          <button className={styles.btnPrimaryLg} onClick={() => login("/")}>
            Get started
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerCopy}>&copy; 2026 FinanceLab &middot; Finance Lab Teknoloji A.Ş.</div>
          <div className={styles.footerLinks}>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <span>info@financelab.ai</span>
          </div>
        </div>
      </footer>
    </div>
  );
}