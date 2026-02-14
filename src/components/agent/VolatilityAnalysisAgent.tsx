"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import styles from "./volatility-analysis.module.css";
import { AgentHeader, StatusBadge, LoadingState, ErrorState } from "@/components/agent";
import { AccessGate } from "@/components/AccessGate";
import { useAuth } from "@/lib/auth";
import { getAnalysisSections } from "@/lib/agent-access";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceArea,
} from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const COLORS = [
  "#1e4fd8",
  "#e67e22",
  "#2ecc71",
  "#e74c3c",
  "#9b59b6",
  "#1abc9c",
];

// ─── Types ───

interface CardItem { label: string; value: string; color?: string }
interface SeriesData { name: string; dates: string[]; values: (number | null)[] }
interface BandData { label: string; y_min: number; y_max: number; color: string; opacity?: number }

interface Block {
  kind: string;
  content?: string;
  cards?: CardItem[];
  title?: string;
  series?: SeriesData[] | SeriesData;
  bands?: BandData[];
  data?: Record<string, unknown>[];
  x_key?: string;
  y_key?: string;
  x_suffix?: string;
  y_suffix?: string;
  color_key?: string;
  headers?: string[];
  rows?: string[][];
}

interface Section { id: string; title: string; description: string; blocks: Block[] }

interface Report {
  title: string;
  subtitle: string;
  ticker: string;
  updated_at: string;
  data_range: { start: string; end: string };
  sections: Section[];
}

// ─── Props ───

export interface VolatilityAnalysisAgentProps {
  /** Fixed ticker symbol, e.g. "SPY", "AAPL" */
  ticker: string;
  /** Page title shown in agent header */
  title: string;
  /** Description shown in agent header */
  description: string;
  /** Domain tag shown above the title */
  domain?: string;
  /** Data source label in footer */
  dataSource?: string;
  /** Optional override for the API endpoint (full path after API_BASE, e.g. "/api/v1/analysis/spy") */
  apiEndpoint?: string;
}

// ─── Helpers ───

function getYearTicks(data: Record<string, unknown>[], dateKey: string, maxTicks = 10): string[] {
  const seen = new Map<string, string>();
  for (const row of data) {
    const d = String(row[dateKey] || "");
    if (d.length >= 4) {
      const yr = d.substring(0, 4);
      if (!seen.has(yr)) seen.set(yr, d);
    }
  }
  const entries = Array.from(seen.entries());
  if (entries.length <= maxTicks) return entries.map((e) => e[1]);
  const step = Math.ceil(entries.length / maxTicks);
  const result: string[] = [];
  for (let i = 0; i < entries.length; i += step) result.push(entries[i][1]);
  const last = entries[entries.length - 1][1];
  if (result[result.length - 1] !== last) result.push(last);
  return result;
}

function formatYear(val: string) {
  if (!val) return "";
  if (val.length >= 4) return val.substring(0, 4);
  return String(val);
}

function formatDateDetailed(val: string) {
  if (!val) return "";
  if (val.length === 10 && val[4] === "-") return `${val.substring(5, 7)}/${val.substring(0, 4)}`;
  return String(val);
}

// ─── Block Renderers ───

function CardGrid({ cards }: { cards: CardItem[] }) {
  return (
    <div className={styles.cardGrid}>
      {cards.map((c, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardValue}>{c.value}</div>
          <div className={styles.cardLabel}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function TextBlock({ content }: { content: string }) {
  // Simple markdown: **bold**, *italic*, and - as em dash
  const html = content
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
  return <p className={styles.textBlock} dangerouslySetInnerHTML={{ __html: html }} />;
}

function DataTable({ headers, rows, title }: { headers: string[]; rows: string[][]; title?: string }) {
  return (
    <div className={styles.tableWrap}>
      {title && <h4 className={styles.chartTitle}>{title}</h4>}
      <table className={styles.table}>
        <thead><tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, ri) => <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function MultiLineChart({ series, title, ySuffix, bands }: { series: SeriesData[]; title?: string; ySuffix?: string; bands?: BandData[] }) {
  const { sampled, ticks } = useMemo(() => {
    const dateSet = new Map<string, Record<string, number | string | null>>();
    for (const s of series) {
      for (let i = 0; i < s.dates.length; i++) {
        const d = s.dates[i];
        if (!dateSet.has(d)) dateSet.set(d, { date: d });
        dateSet.get(d)![s.name] = s.values[i];
      }
    }
    const data = Array.from(dateSet.values()).sort((a, b) =>
      String(a.date || "").localeCompare(String(b.date || ""))
    );
    const maxPoints = 600;
    const step = Math.max(1, Math.floor(data.length / maxPoints));
    const s = data.filter((_, i) => i % step === 0 || i === data.length - 1);
    const t = getYearTicks(s, "date");
    return { sampled: s, ticks: t };
  }, [series]);

  return (
    <div className={styles.chartContainer}>
      {title && <h4 className={styles.chartTitle}>{title}</h4>}
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={sampled} margin={{ top: 8, right: 24, bottom: 8, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ebebf0" />
          {bands && bands.map((band, i) => (
            <ReferenceArea
              key={`band-${i}`}
              y1={band.y_min}
              y2={band.y_max}
              fill={band.color}
              fillOpacity={band.opacity ?? 0.08}
              ifOverflow="extendDomain"
              label={undefined}
            />
          ))}
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={formatYear} ticks={ticks} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}${ySuffix || ""}`} width={60} />
          <Tooltip
            formatter={(value) => [`${typeof value === "number" ? value.toFixed(2) : value}${ySuffix || ""}`]}
            labelFormatter={(label) => formatDateDetailed(String(label))}
          />
          <Legend />
          {series.map((s, i) => (
            <Line key={s.name} type="monotone" dataKey={s.name} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={1.5} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {bands && bands.length > 0 && (
        <div className={styles.bandLegend}>
          {bands.map((band, i) => (
            <span key={i} className={styles.bandLegendItem}>
              <span className={styles.bandLegendSwatch} style={{ backgroundColor: band.color, opacity: 0.4 }} />
              {band.label} ({band.y_max >= 100 ? `${band.y_min}%+` : `${band.y_min}-${band.y_max}%`})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SimpleBarChart({ data, xKey, yKey, ySuffix, xSuffix, title }: {
  data: Record<string, unknown>[]; xKey: string; yKey: string; ySuffix?: string; xSuffix?: string; title?: string;
}) {
  return (
    <div className={styles.chartContainer}>
      {title && <h4 className={styles.chartTitle}>{title}</h4>}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ebebf0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} tickFormatter={(v: string | number) => `${v}${xSuffix || ""}`} minTickGap={40} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}${ySuffix || ""}`} width={50} />
          <Tooltip formatter={(value) => [`${typeof value === "number" ? value.toFixed(2) : value}${ySuffix || ""}`]} />
          <Bar dataKey={yKey} fill={COLORS[0]} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.kind) {
    case "card_grid":
      return block.cards ? <CardGrid cards={block.cards} /> : null;
    case "text":
      return block.content ? <TextBlock content={block.content} /> : null;
    case "table":
      return block.headers && block.rows ? <DataTable headers={block.headers} rows={block.rows} title={block.title} /> : null;
    case "line_chart": {
      const s = Array.isArray(block.series) ? block.series : block.series ? [block.series] : [];
      return s.length ? <MultiLineChart series={s} title={block.title} ySuffix={block.y_suffix} bands={block.bands} /> : null;
    }
    case "bar_chart":
      return block.data ? <SimpleBarChart data={block.data as Record<string, unknown>[]} xKey={block.x_key || "x"} yKey={block.y_key || "y"} ySuffix={block.y_suffix} xSuffix={block.x_suffix} title={block.title} /> : null;
    default:
      return null;
  }
}

function SectionRenderer({ section }: { section: Section }) {
  return (
    <div id={section.id} className={styles.section}>
      <h2 className={styles.sectionTitle}>{section.title}</h2>
      <p className={styles.sectionDesc}>{section.description}</p>
      <div className={styles.sectionBlocks}>
        {section.blocks.map((block, i) => (
          <BlockRenderer key={`${section.id}-${i}`} block={block} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───

export default function VolatilityAnalysisAgent({
  ticker,
  title,
  description,
  domain = "Markets",
  dataSource = "S3 Parquet (ticker prices)",
  apiEndpoint,
}: VolatilityAnalysisAgentProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { tier } = useAuth();

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = apiEndpoint
        ? `${API_BASE}${apiEndpoint}`
        : `${API_BASE}/api/v1/analysis/volatility-lab?ticker=${encodeURIComponent(ticker)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `API error: ${res.status}`);
      }
      const data = await res.json();
      setReport(data);
      if (data.sections?.length) setActiveSection(data.sections[0].id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [ticker, apiEndpoint]);

  useEffect(() => { loadReport(); }, [loadReport]);

  useEffect(() => {
    if (!report) return;
    observerRef.current = new IntersectionObserver(
      (entries) => { for (const entry of entries) if (entry.isIntersecting) setActiveSection(entry.target.id); },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    for (const section of report.sections) {
      const el = document.getElementById(section.id);
      if (el) observerRef.current.observe(el);
    }
    return () => observerRef.current?.disconnect();
  }, [report]);

  const dataRangeLabel = report?.data_range
    ? `${report.data_range.start.substring(0, 4)}-${report.data_range.end.substring(0, 4)}`
    : null;

  // Resolve access: how many sections to show and what gate to use
  const accessInfo = useMemo(() => {
    if (!report) return null;
    return getAnalysisSections(ticker, tier, report.sections.length);
  }, [ticker, tier, report]);

  return (
    <div className={styles.page}>
      <AgentHeader
        domain={domain}
        title={report?.title || title}
        description={report?.subtitle || description}
        meta={[
          { label: "Ticker", value: ticker },
          ...(dataRangeLabel ? [{ label: "Data range", value: dataRangeLabel }] : []),
          { label: "Sections", value: String(report?.sections?.length || "-") },
          { label: "Status", value: <StatusBadge status="live" /> },
        ]}
      />

      {report && !loading && (
        <nav className={styles.sectionNav}>
          <div className={styles.sectionNavInner}>
            {report.sections.map((s) => (
              <a key={s.id} href={`#${s.id}`}
                className={`${styles.sectionNavItem} ${activeSection === s.id ? styles.sectionNavActive : ""}`}
                onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }); }}
              >{s.title}</a>
            ))}
          </div>
        </nav>
      )}

      <main className={styles.content}>
        {loading && <LoadingState message={`Loading ${ticker} analysis…`} />}
        {error && <ErrorState message={error} onRetry={loadReport} />}
        {!loading && !error && report && accessInfo && (
          <div className={styles.sections}>
            {/* Visible sections (free preview) */}
            {report.sections.slice(0, accessInfo.visibleCount).map((section) => (
              <SectionRenderer key={section.id} section={section} />
            ))}

            {/* Gated sections (if any remain) */}
            {accessInfo.gateType !== "none" && accessInfo.visibleCount < report.sections.length && (
              <AccessGate
                requires={accessInfo.gateType}
                featureLabel={
                  accessInfo.gateType === "pro"
                    ? `the full ${ticker} analysis`
                    : "the full analysis"
                }
              >
                {report.sections.slice(accessInfo.visibleCount).map((section) => (
                  <SectionRenderer key={section.id} section={section} />
                ))}
              </AccessGate>
            )}
          </div>
        )}
        {!loading && !error && report && (
          <div className={styles.reportFooter}>
            <span>Data: {dataSource}</span>
            <span>Updated: {new Date(report.updated_at).toLocaleDateString()}</span>
          </div>
        )}
      </main>
    </div>
  );
}