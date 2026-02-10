"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import styles from "./page.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const PLANS = {
  free: {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Explore live dashboards, topic maps, and daily briefs at no cost.",
    features: [
      { label: "Agents", detail: "All 10 agents included" },
      { label: "Analysis reports", detail: "First section of each report" },
      { label: "Topic maps", detail: "Map view only" },
      { label: "Briefs", detail: "Latest day only" },
      { label: "Tickers", detail: "SPY default only" },
      { label: "Companies", detail: "OpenAI only" },
    ],
  },
  pro: {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "Full access to all tickers, companies, extended history, and timelines.",
    features: [
      { label: "Agents", detail: "All 10 agents included" },
      { label: "Analysis reports", detail: "Full multi-section reports" },
      { label: "Topic maps", detail: "Map + 14-day timeline" },
      { label: "Briefs", detail: "Full date history (30+ days)" },
      { label: "Tickers", detail: "All presets + custom tickers" },
      { label: "Companies", detail: "All 6 companies tracked" },
    ],
  },
};

export default function PricingPage() {
  const { user, isAuthenticated, isLoading, tier, login } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleUpgrade = useCallback(async () => {
    if (!isAuthenticated) {
      login("/pricing");
      return;
    }

    setBusy(true);
    try {
      const token = localStorage.getItem("inscien_access");
      const res = await fetch(`${API_BASE}/api/payment/gumroad/checkout-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_id: "pro" }),
      });
      if (!res.ok) throw new Error("Failed to get checkout link");
      const data = await res.json();
      if (data.url) {
        const w = window.open(data.url, "_blank", "noopener,noreferrer");
        if (!w) window.location.href = data.url;
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [isAuthenticated, login]);

  const isPro = tier === "pro";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <a href="/" className={styles.backLink}>← FinanceLab</a>
        </div>
        <div className={styles.headerMain}>
          <div className={styles.headerCenter}>
            <div className={styles.pageDomain}>Plans</div>
            <h1 className={styles.pageTitle}>Pricing</h1>
            <p className={styles.pageDesc}>
              Start free with live dashboards and daily briefs. Upgrade to Pro for full analysis depth.
            </p>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.plansGrid}>
          {/* Free Plan */}
          <div className={styles.planCard}>
            <div className={styles.planHeader}>
              <h2 className={styles.planName}>{PLANS.free.name}</h2>
              <div className={styles.planPriceRow}>
                <span className={styles.planPrice}>{PLANS.free.price}</span>
                <span className={styles.planPeriod}>{PLANS.free.period}</span>
              </div>
              <p className={styles.planDesc}>{PLANS.free.description}</p>
            </div>
            <div className={styles.planCta}>
              {isLoading ? (
                <span className={styles.ctaCurrent}>Loading…</span>
              ) : isAuthenticated ? (
                <span className={styles.ctaCurrent}>
                  {isPro ? "Included" : "Current plan"}
                </span>
              ) : (
                <button
                  className={styles.ctaSecondary}
                  onClick={() => login("/pricing")}
                >
                  Sign up free
                </button>
              )}
            </div>
            <div className={styles.featureList}>
              {PLANS.free.features.map((f, i) => (
                <div key={i} className={styles.featureRow}>
                  <span className={styles.featureLabel}>{f.label}</span>
                  <span className={styles.featureDetail}>{f.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan */}
          <div className={`${styles.planCard} ${styles.planCardPro}`}>
            <div className={styles.proBadge}>Recommended</div>
            <div className={styles.planHeader}>
              <h2 className={styles.planName}>{PLANS.pro.name}</h2>
              <div className={styles.planPriceRow}>
                <span className={styles.planPrice}>{PLANS.pro.price}</span>
                <span className={styles.planPeriod}>{PLANS.pro.period}</span>
              </div>
              <p className={styles.planDesc}>{PLANS.pro.description}</p>
            </div>
            <div className={styles.planCta}>
              {isPro ? (
                <span className={styles.ctaCurrent}>Current plan</span>
              ) : (
                <button
                  className={styles.ctaPrimary}
                  onClick={handleUpgrade}
                  disabled={busy || isLoading}
                >
                  {busy
                    ? "Starting checkout…"
                    : isLoading
                    ? "Loading…"
                    : isAuthenticated
                    ? "Upgrade to Pro"
                    : "Sign up & upgrade"}
                </button>
              )}
            </div>
            <div className={styles.featureList}>
              {PLANS.pro.features.map((f, i) => (
                <div key={i} className={styles.featureRow}>
                  <span className={styles.featureLabel}>{f.label}</span>
                  <span className={`${styles.featureDetail} ${styles.featureDetailPro}`}>{f.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.faqSection}>
          <h2 className={styles.faqTitle}>Common questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQ}>Can I cancel anytime?</h3>
              <p className={styles.faqA}>
                Yes. Pro is billed monthly through Gumroad. Cancel anytime from your Gumroad dashboard — no lock-in.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQ}>What happens when I upgrade?</h3>
              <p className={styles.faqA}>
                You'll be redirected to Gumroad to complete payment. Once confirmed, your account is upgraded instantly — no page refresh needed.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQ}>Is the free tier limited?</h3>
              <p className={styles.faqA}>
                Free gives you full access to all 10 agents with the default configuration. Pro unlocks custom tickers, all companies, and extended history.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQ}>How do refunds work?</h3>
              <p className={styles.faqA}>
                Gumroad handles refunds. If you request one within 30 days, your account reverts to Free automatically.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}