"use client";

import { type ReactNode } from "react";
import { useAuth, type AccessLevel } from "@/lib/auth";

interface AccessGateProps {
  /** Minimum access level required to see children */
  requires: AccessLevel;
  /** Content to render when access is granted */
  children: ReactNode;
  /**
   * Optional label for context, e.g. "full timeline", "remaining steps".
   * Defaults are provided per access level.
   */
  featureLabel?: string;
  /** If true, show nothing instead of the CTA (for subtle gating) */
  silent?: boolean;
}

/**
 * Wraps any content block. If the user's tier is insufficient,
 * renders an inline sign-in or upgrade prompt instead of children.
 *
 * Usage:
 *   <AccessGate requires="auth" featureLabel="the timeline view">
 *     <TimelineView data={data} />
 *   </AccessGate>
 */
export function AccessGate({
  requires,
  children,
  featureLabel,
  silent = false,
}: AccessGateProps) {
  const { canAccess, login, tier, isLoading } = useAuth();

  // While auth is loading, show nothing (prevents flash)
  if (isLoading) return null;

  // Access granted — render children
  if (canAccess(requires)) {
    return <>{children}</>;
  }

  // Silent mode — hide content without showing a CTA
  if (silent) return null;

  // Determine what to show
  const needsAuth = requires === "auth" && tier === "anon";
  const needsPro = requires === "pro" && (tier === "anon" || tier === "auth");

  const label = featureLabel || (needsPro ? "this feature" : "this content");

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {needsAuth && (
          <>
            <div style={styles.title}>Sign in to continue</div>
            <div style={styles.desc}>
              Sign in with Google to access {label}. It's free.
            </div>
            <button
              style={styles.primaryBtn}
              onClick={() => login(window.location.pathname)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.opacity = "0.85")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.opacity = "1")
              }
            >
              Sign in with Google
            </button>
          </>
        )}

        {needsPro && (
          <>
            <div style={styles.icon}>⚡</div>
            <div style={styles.title}>Pro feature</div>
            <div style={styles.desc}>
              Upgrade to Pro to access {label}.
            </div>
            {tier === "anon" ? (
              <button
                style={styles.primaryBtn}
                onClick={() => login(window.location.pathname)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.opacity = "0.85")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.opacity = "1")
                }
              >
                Sign in first
              </button>
            ) : (
              <button
                style={styles.primaryBtn}
                onClick={() => (window.location.href = "/pricing")}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.opacity = "0.85")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.opacity = "1")
                }
              >
                Upgrade to Pro
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Inline styles (no CSS module needed — this is a shared primitive) ─── */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "40px 0",
  },
  card: {
    maxWidth: 380,
    width: "100%",
    textAlign: "center",
    padding: "40px 32px",
    background: "#ffffff",
    border: "1px solid #dddde3",
    borderRadius: 8,
  },
  icon: {
    fontSize: 28,
    marginBottom: 12,
  },
  title: {
    fontFamily: 'var(--font-serif), "Source Serif 4", Georgia, serif',
    fontSize: 18,
    fontWeight: 500,
    color: "#1a1a1f",
    marginBottom: 6,
    letterSpacing: "-0.01em",
  },
  desc: {
    fontSize: 13.5,
    color: "#4a4a56",
    lineHeight: 1.55,
    marginBottom: 20,
  },
  primaryBtn: {
    height: 38,
    padding: "0 22px",
    background: "#1a1a1f",
    color: "#ffffff",
    border: "none",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.15s",
  },
  secondaryBtn: {
    height: 38,
    padding: "0 22px",
    background: "#ffffff",
    color: "#1a1a1f",
    border: "1px solid #dddde3",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  },
};