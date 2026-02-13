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

// ─── NEW: Notification API ───

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
    return { count: 0, week_end: "" };
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