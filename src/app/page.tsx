"use client";

import { useAuth } from "@/lib/auth";
import Landing from "./Landing";
import Dashboard from "./Dashboard";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  // Avoid flash: show nothing until auth state resolves
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f7f7f9",
        }}
      />
    );
  }

  return isAuthenticated ? <Dashboard /> : <Landing />;
}