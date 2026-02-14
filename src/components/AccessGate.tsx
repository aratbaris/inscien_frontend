"use client";

import { type ReactNode } from "react";
import { useAuth, type AccessLevel } from "@/lib/auth";

interface AccessGateProps {
  requires: AccessLevel;
  children: ReactNode;
  featureLabel?: string;
  silent?: boolean;
}

export function AccessGate({
  requires,
  children,
  featureLabel,
  silent = false,
}: AccessGateProps) {
  const { canAccess, login, tier, isLoading } = useAuth();

  if (isLoading) return null;
  if (canAccess(requires)) return <>{children}</>;
  if (silent) return null;

  const needsAuth = requires === "auth" && tier === "anon";
  const needsPro = requires === "pro" && (tier === "anon" || tier === "auth");
  const label = featureLabel || (needsPro ? "this feature" : "this content");

  return (
    <div style={styles.container}>
      <div style={styles.fadeOverlay} />
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#8a8a98" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3.5" y="7" width="9" height="7" rx="1" />
            <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
          </svg>
        </div>

        {needsAuth && (
          <>
            <div style={styles.title}>Sign in to continue</div>
            <div style={styles.desc}>
              Sign in with Google to access {label}. It&apos;s free.
            </div>
            <button
              style={styles.primaryBtn}
              onClick={() => login(window.location.pathname)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#2a2a2f")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#1a1a1f")
              }
            >
              Sign in with Google
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 4 }}>
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}

        {needsPro && (
          <>
            <div style={styles.title}>Upgrade to unlock</div>
            <div style={styles.desc}>
              Access {label} and all premium agents with a Pro subscription.
            </div>
            {tier === "anon" ? (
              <button
                style={styles.primaryBtn}
                onClick={() => login(window.location.pathname)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#2a2a2f")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#1a1a1f")
                }
              >
                Sign in first
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 4 }}>
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <button
                style={styles.primaryBtn}
                onClick={() => (window.location.href = "/pricing")}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#2a2a2f")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#1a1a1f")
                }
              >
                View pricing
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 4 }}>
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 0 48px",
  },
  fadeOverlay: {
    width: "100%",
    height: 80,
    background: "linear-gradient(to bottom, transparent, #f7f7f9)",
    marginBottom: 0,
    pointerEvents: "none",
  },
  card: {
    maxWidth: 400,
    width: "100%",
    textAlign: "center" as const,
    padding: "36px 32px",
    background: "#ffffff",
    border: "1px solid #dddde3",
    borderRadius: 8,
  },
  iconWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: 'var(--serif, "Source Serif 4", Georgia, serif)',
    fontSize: 18,
    fontWeight: 500,
    color: "#1a1a1f",
    marginBottom: 6,
    letterSpacing: "-0.01em",
  },
  desc: {
    fontSize: 13.5,
    color: "#8a8a98",
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
    transition: "background 0.15s",
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
  },
};