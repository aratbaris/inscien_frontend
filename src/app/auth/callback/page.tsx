"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

function CallbackHandler() {
  const { setTokens } = useAuth();
  const processed = useRef(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    // Tokens are in the URL fragment (after #)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access = params.get("access");
    const refresh = params.get("refresh");

    // "next" is in the query string
    const next = searchParams.get("next") || "/";

    if (access && refresh) {
      setTokens(access, refresh);
      // Clean the URL then redirect
      window.history.replaceState(null, "", "/auth/callback");
      setTimeout(() => {
        window.location.href = next;
      }, 100);
    } else {
      // No tokens — redirect to login
      window.location.href = "/login?error=auth_failed";
    }
  }, [setTokens, searchParams]);

  return <>Signing you in…</>;
}

export default function AuthCallbackPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f7f9",
        fontFamily: "var(--font-sans), -apple-system, sans-serif",
        color: "#8a8a98",
        fontSize: "14px",
      }}
    >
      <Suspense fallback="Signing you in…">
        <CallbackHandler />
      </Suspense>
    </div>
  );
}