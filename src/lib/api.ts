const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Existing Brief API ───

export async function fetchAgentBrief(
  agent: string,
  day: string = "latest",
  limit: number = 30
) {
  const params = new URLSearchParams({ day, limit: String(limit) });
  const res = await fetch(`${API_BASE}/api/v1/briefs/${agent}?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

// ─── Weekly Notification API ───

export async function fetchNotifications(
  week: string = "latest",
  topic?: string
) {
  const params = new URLSearchParams({ week });
  if (topic) params.set("topic", topic);

  const res = await fetch(`${API_BASE}/api/v1/notifications?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchNotificationCount() {
  const res = await fetch(`${API_BASE}/api/v1/notifications/count`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return { count: 0, weekly_count: 0, analysis_count: 0, techmap_count: 0, week_end: "", latest_event_date: "", techmap_week_end: "" };
  }

  return res.json();
}

export async function fetchNotificationWeeks() {
  const res = await fetch(`${API_BASE}/api/v1/notifications/weeks`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

// ─── Analysis Events API ───

export async function fetchAnalysisEvents(
  date: string = "recent",
  ticker?: string,
  days: number = 7
) {
  const params = new URLSearchParams({ date, days: String(days) });
  if (ticker) params.set("ticker", ticker);

  const res = await fetch(`${API_BASE}/api/v1/notifications/analysis?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

// ─── Techmap Highlights API (new) ───

export async function fetchTechmapHighlights(weeks: number = 1) {
  const params = new URLSearchParams({ weeks: String(weeks) });

  const res = await fetch(`${API_BASE}/api/v1/notifications/techmaps?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}