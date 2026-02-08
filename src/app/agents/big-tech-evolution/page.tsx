"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";
import { AccessGate } from "@/components/AccessGate";
import { useAuth } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Company Registry ───

interface CompanyDef {
  id: string;
  label: string;
  fallbackTitle: string;
  fallbackSubtitle: string;
}

const COMPANIES: CompanyDef[] = [
  { id: "openai", label: "OpenAI", fallbackTitle: "OpenAI Developments", fallbackSubtitle: "Product launches, API changes, policy shifts, and ecosystem developments." },
  { id: "google", label: "Google", fallbackTitle: "Google Developments", fallbackSubtitle: "Search, cloud, AI, and platform developments across Alphabet." },
  { id: "microsoft", label: "Microsoft", fallbackTitle: "Microsoft Developments", fallbackSubtitle: "Azure, Copilot, enterprise, and ecosystem developments." },
  { id: "apple", label: "Apple", fallbackTitle: "Apple Developments", fallbackSubtitle: "Hardware, software, services, and platform strategy." },
  { id: "nvidia", label: "NVIDIA", fallbackTitle: "NVIDIA Developments", fallbackSubtitle: "GPU, data center, AI infrastructure, and autonomous systems." },
  { id: "tiktok", label: "TikTok", fallbackTitle: "TikTok Developments", fallbackSubtitle: "Platform, creator economy, regulatory, and commerce developments." },
];

const DEFAULT_COMPANY = COMPANIES[0];

// ─── Types ───

interface EvidenceItem {
  title: string;
  source: string;
  url: string;
  use_dt_utc: string;
}

interface NodeDetail {
  label: string;
  lane: string;
  mentions: number;
  bullets: string[];
  evidence: EvidenceItem[];
}

interface MapNode {
  id: string;
  label: string;
  lane: string;
}

interface MapDataset {
  topicId: string;
  headerTitle: string;
  headerSubtitle: string;
  mapNodes: MapNode[];
  nodeDetailsById: Record<string, NodeDetail>;
}

interface TimelineDay {
  day: string;
  nodes: {
    id: string;
    label: string;
    lane: string;
    mentions: number;
    bullets: string[];
    evidence: EvidenceItem[];
  }[];
}

interface TimelineResponse {
  status: string;
  topicId: string;
  lastUpdatedUtc: string;
  days: TimelineDay[];
}

// ─── Helpers ───

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return `${months[m]} ${d}`;
}

function formatEvidenceDate(ts: string): string {
  if (!ts) return "";
  return formatDate(ts.substring(0, 10));
}

// ─── Components ───

function EvidenceCard({ item }: { item: EvidenceItem }) {
  return (
    <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className={styles.evidenceCard}>
      <div className={styles.evidenceTitle}>{item.title}</div>
      <div className={styles.evidenceMeta}>
        <span className={styles.evidenceSource}>{item.source}</span>
        {item.use_dt_utc && (
          <>
            <span className={styles.evidenceDot}>·</span>
            <span>{formatEvidenceDate(item.use_dt_utc)}</span>
          </>
        )}
      </div>
    </a>
  );
}

// ─── Company Selector ───

function CompanySelector({
  companies,
  activeId,
  onChange,
  loading,
  hasPro,
  onLocked,
}: {
  companies: CompanyDef[];
  activeId: string;
  onChange: (id: string) => void;
  loading: boolean;
  hasPro: boolean;
  onLocked: () => void;
}) {
  return (
    <div className={styles.companySelector}>
      {companies.map((c, idx) => {
        const isFree = idx === 0;
        const locked = !isFree && !hasPro;
        return (
          <div key={c.id} className={styles.companyChipWrap}>
            <button
              className={`${styles.companyChip} ${activeId === c.id ? styles.companyChipActive : ""} ${locked ? styles.companyChipLocked : ""}`}
              onClick={() => {
                if (locked) {
                  onLocked();
                  return;
                }
                onChange(c.id);
              }}
              disabled={loading}
            >
              {c.label}
            </button>
            {locked && <div className={styles.companyChipTooltip}>Pro feature</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Map View ───

function MapView({ data }: { data: MapDataset }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const lanes: Record<string, MapNode[]> = {};
  for (const node of data.mapNodes) {
    const lane = node.lane || "Other";
    if (!lanes[lane]) lanes[lane] = [];
    lanes[lane].push(node);
  }

  const selectedDetail = selectedNodeId ? data.nodeDetailsById[selectedNodeId] : null;

  return (
    <div className={styles.mapLayout}>
      <div className={styles.mapPanel}>
        {Object.entries(lanes).map(([lane, nodes]) => (
          <div key={lane} className={styles.laneGroup}>
            <div className={styles.laneName}>{lane}</div>
            <div className={styles.laneNodes}>
              {nodes.map((node) => {
                const detail = data.nodeDetailsById[node.id];
                const count = detail?.evidence?.length || 0;
                const isSelected = selectedNodeId === node.id;
                return (
                  <button
                    key={node.id}
                    className={`${styles.mapNode} ${isSelected ? styles.mapNodeSelected : ""}`}
                    onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                  >
                    <span className={styles.mapNodeLabel}>{node.label}</span>
                    {count > 0 && <span className={styles.mapNodeCount}>{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.detailPanel}>
        {!selectedDetail && (
          <div className={styles.detailEmpty}>
            <p className={styles.detailEmptyTitle}>Select a topic</p>
            <p className={styles.detailEmptyHint}>Click a node on the map to see material headlines and sources.</p>
          </div>
        )}
        {selectedDetail && (
          <div className={styles.detailContent}>
            <div className={styles.detailHeader}>
              <h3 className={styles.detailTitle}>{selectedDetail.label}</h3>
              <div className={styles.detailHeaderMeta}>
                <span className={styles.detailCount}>{selectedDetail.evidence?.length || 0} sources</span>
                <button className={styles.detailClose} onClick={() => setSelectedNodeId(null)}>✕</button>
              </div>
            </div>
            {selectedDetail.lane && <div className={styles.detailLane}>{selectedDetail.lane}</div>}
            <div className={styles.detailEvidence}>
              {selectedDetail.evidence?.map((ev, idx) => (
                <EvidenceCard key={`${ev.url}-${idx}`} item={ev} />
              ))}
              {(!selectedDetail.evidence || selectedDetail.evidence.length === 0) && (
                <p className={styles.detailNoEvidence}>No sources available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Timeline View ───

function TimelineView({ data }: { data: TimelineResponse }) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (key: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className={styles.timeline}>
      {data.days.map((day) => (
        <div key={day.day} className={styles.timelineDay}>
          <div className={styles.timelineDayHeader}>
            <div className={styles.timelineDot} />
            <span className={styles.timelineDayLabel}>{day.day}</span>
          </div>
          <div className={styles.timelineNodes}>
            {day.nodes.map((node) => {
              const nodeKey = `${day.day}-${node.id}`;
              const isExpanded = expandedNodes.has(nodeKey);
              return (
                <div key={nodeKey} className={styles.timelineNode}>
                  <div className={styles.timelineNodeHeader}>
                    <div className={styles.timelineNodeInfo}>
                      <div className={styles.timelineNodeLabel}>{node.label}</div>
                      <div className={styles.timelineNodeLane}>{node.lane}</div>
                    </div>
                    <div className={styles.timelineNodeRight}>
                      <span className={styles.timelineNodeCount}>{node.evidence?.length || 0}</span>
                      <button className={styles.timelineToggle} onClick={() => toggleNode(nodeKey)}>
                        {isExpanded ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  {isExpanded && node.evidence && node.evidence.length > 0 && (
                    <div className={styles.timelineEvidence}>
                      {node.evidence.map((ev, idx) => (
                        <EvidenceCard key={`${ev.url}-${idx}`} item={ev} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {data.days.length === 0 && <div className={styles.timelineEmpty}>No timeline data available.</div>}
    </div>
  );
}

// ─── Main Page ───

export default function BigTechEvolutionPage() {
  const [activeCompany, setActiveCompany] = useState<CompanyDef>(DEFAULT_COMPANY);
  const [view, setView] = useState<"map" | "timeline">("map");
  const [mapData, setMapData] = useState<MapDataset | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canAccess, login } = useAuth();

  const loadData = useCallback(async (company: CompanyDef) => {
    setLoading(true);
    setError(null);
    setMapData(null);
    setTimelineData(null);
    try {
      const [mapRes, timelineRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/techmap/topic/${company.id}`, { cache: "no-store" }),
        fetch(`${API_BASE}/api/v1/techmap/topic/${company.id}/daily?days=14`, { cache: "no-store" }),
      ]);
      if (!mapRes.ok) throw new Error(`Map API error: ${mapRes.status}`);
      if (!timelineRes.ok) throw new Error(`Timeline API error: ${timelineRes.status}`);
      setMapData(await mapRes.json());
      setTimelineData(await timelineRes.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeCompany);
  }, [activeCompany, loadData]);

  const handleCompanyChange = (id: string) => {
    const found = COMPANIES.find((c) => c.id === id);
    if (found && found.id !== activeCompany.id) {
      setActiveCompany(found);
    }
  };

  const nodeCount = mapData?.mapNodes?.length || 0;
  const evidenceCount = mapData
    ? Object.values(mapData.nodeDetailsById || {}).reduce((sum, d) => sum + (d.evidence?.length || 0), 0)
    : 0;

  const hasTimeline = canAccess("auth");
  const hasPro = canAccess("pro");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <a href="/" className={styles.backLink}>← InScien</a>
        </div>
        <div className={styles.headerMain}>
          <div>
            <div className={styles.agentDomain}>Technology</div>
            <h1 className={styles.agentTitle}>Big Tech Evolution</h1>
            <p className={styles.agentDesc}>
              Structured topic maps tracking product launches, strategy shifts, and ecosystem developments across major technology companies. Updated daily.
            </p>
          </div>
          <div className={styles.agentMeta}>
            <div className={styles.metaItem}>
              <div className={styles.metaVal}>{COMPANIES.length}</div>
              <div className={styles.metaKey}>Companies</div>
            </div>
            <div className={styles.metaItem}>
              <div className={styles.metaVal}>{nodeCount}</div>
              <div className={styles.metaKey}>Topics</div>
            </div>
            <div className={styles.metaItem}>
              <div className={styles.metaVal}>{evidenceCount}</div>
              <div className={styles.metaKey}>Sources</div>
            </div>
            <div className={styles.metaItem}>
              <div className={styles.statusLive}>Live</div>
              <div className={styles.metaKey}>Status</div>
            </div>
          </div>
        </div>
      </header>

      {/* Company selector + view toggle row */}
      <div className={styles.controlsBar}>
        <CompanySelector
          companies={COMPANIES}
          activeId={activeCompany.id}
          onChange={handleCompanyChange}
          loading={loading}
          hasPro={hasPro}
          onLocked={() => { window.location.href = "/pricing"; }}
        />
        <div className={styles.viewToggle}>
          <button className={`${styles.viewTab} ${view === "map" ? styles.viewTabActive : ""}`} onClick={() => setView("map")}>Map</button>
          {hasTimeline ? (
            <button
              className={`${styles.viewTab} ${view === "timeline" ? styles.viewTabActive : ""}`}
              onClick={() => setView("timeline")}
            >
              Timeline
            </button>
          ) : (
            <div className={styles.viewTabLockedWrap}>
              <button
                className={`${styles.viewTab} ${styles.viewTabLocked}`}
                onClick={() => login(window.location.pathname)}
              >
                Timeline
              </button>
              <div className={styles.viewTabTooltip}>Sign in to access timeline</div>
            </div>
          )}
        </div>
      </div>

      {/* Active company sub-header */}
      {mapData && !loading && (
        <div className={styles.companyHeader}>
          <h2 className={styles.companyTitle}>{mapData.headerTitle || activeCompany.fallbackTitle}</h2>
          <p className={styles.companySubtitle}>{mapData.headerSubtitle || activeCompany.fallbackSubtitle}</p>
        </div>
      )}

      <main className={styles.content}>
        {loading && <div className={styles.loading}>Loading {activeCompany.label} topic map...</div>}
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={() => loadData(activeCompany)} className={styles.retry}>Retry</button>
          </div>
        )}
        {!loading && !error && view === "map" && mapData && <MapView data={mapData} />}
        {!loading && !error && view === "timeline" && hasTimeline && timelineData && <TimelineView data={timelineData} />}
        {!loading && !error && view === "timeline" && !hasTimeline && (
          <AccessGate requires="auth" featureLabel="the 14-day timeline">
            <div />
          </AccessGate>
        )}
      </main>
    </div>
  );
}