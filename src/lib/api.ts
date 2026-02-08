const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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