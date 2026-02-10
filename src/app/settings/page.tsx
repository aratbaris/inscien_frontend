"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import styles from "./page.module.css";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !user) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  const initials =
    ((user.first_name?.[0] || "") + (user.last_name?.[0] || "")).toUpperCase() ||
    user.email[0].toUpperCase();

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  function handleSignOut() {
    logout();
    window.location.href = "/";
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <a href="/" className={styles.backLink}>
            ← FinanceLab
          </a>
        </div>
        <div className={styles.headerMain}>
          <div>
            <div className={styles.pageDomain}>Account</div>
            <h1 className={styles.pageTitle}>Settings</h1>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile</h2>
          <div className={styles.profileCard}>
            <div className={styles.avatarRow}>
              {user.picture_url ? (
                <img
                  src={user.picture_url}
                  alt={fullName}
                  className={styles.avatar}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={styles.avatarFallback}>{initials}</div>
              )}
              <div className={styles.profileInfo}>
                {fullName && <div className={styles.profileName}>{fullName}</div>}
                <div className={styles.profileEmail}>{user.email}</div>
              </div>
            </div>
            <div className={styles.profileMeta}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Provider</span>
                <span className={styles.metaValue}>Google</span>
              </div>
              {user.created_at && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Member since</span>
                  <span className={styles.metaValue}>
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Subscription</h2>
          <div className={styles.subscriptionCard}>
            <div className={styles.subscriptionInfo}>
              <div className={styles.subscriptionPlan}>
                <span className={styles.subscriptionPlanName}>
                  {user.tier === "pro" ? "Pro" : "Free"}
                </span>
                {user.tier === "pro" && (
                  <span className={styles.proBadge}>Active</span>
                )}
              </div>
              <p className={styles.subscriptionDesc}>
                {user.tier === "pro"
                  ? "You have full access to all tickers, companies, timelines, and extended history."
                  : "You're on the free tier. Upgrade to Pro for full access to all features."}
              </p>
            </div>
            {user.tier === "pro" ? (
              <a
                href="https://app.gumroad.com/library"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.manageBtn}
              >
                Manage subscription
              </a>
            ) : (
              <a href="/pricing" className={styles.upgradeBtn}>
                Upgrade to Pro
              </a>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Session</h2>
          <div className={styles.sessionCard}>
            <p className={styles.sessionDesc}>
              Sign out of your InScien account on this device.
            </p>
            <button className={styles.signOutBtn} onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}