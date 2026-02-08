"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import styles from "./page.module.css";
import { AccessGate } from "@/components/AccessGate";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const COLORS = [
  "#1e4fd8",
  "#e67e22",
  "#2ecc71",
  "#e74c3c",
  "#9b59b6",
  "#1abc9c",
  "#f39c12",
  "#3498db",
];

// ─── Types ───

interface CardItem {
  label: string;
  value: string;
}

interface SeriesData {
  name: string;
  dates: string[];
  values: (number | null)[];
}

interface Band {
  start: string;
  end: string;
  regime: string;
}

interface Block {
  kind: string;
  content?: string;
  cards?: CardItem[];
  title?: string;
  series?: SeriesData[] | SeriesData;
  data?: Record<string, unknown>[];
  x_key?: string;
  y_key?: string;
  x_suffix?: string;
  y_suffix?: string;
  color_key?: string;
  headers?: string[];
  rows?: string[][];
  bands?: Band[];
  history?: SeriesData;
  percentiles?: {
    dates: string[];
    p5: (number | null)[];
    p50: (number | null)[];
    p95: (number | null)[];
  };
}

interface Section {
  id: string;
  title: string;
  description: string;
  blocks: Block[];
}

interface Report {
  title: string;
  subtitle: string;
  updated_at: string;
  data_range: {
    daily_start: string;
    daily_end: string;
    monthly_start: string;
    monthly_end: string;
  };
  sections: Section[];
}

// ─── Helpers ───

function getYearTicks(
  data: Record<string, unknown>[],
  dateKey: string,
  maxTicks = 10
): string[] {
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
  for (let i = 0; i < entries.length; i += step) {
    result.push(entries[i][1]);
  }
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
  if (val.length === 10 && val[4] === "-") {
    return `${val.substring(5, 7)}/${val.substring(0, 4)}`;
  }
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
  return <p className={styles.textBlock}>{content}</p>;
}

function DataTable({
  headers,
  rows,
  title,
}: {
  headers: string[];
  rows: string[][];
  title?: string;
}) {
  return (
    <div className={styles.tableWrap}>
      {title && <h4 className={styles.chartTitle}>{title}</h4>}
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MultiLineChart({
  series,
  title,
  ySuffix,
}: {
  series: SeriesData[];
  title?: string;
  ySuffix?: string;
}) {
  const { sampled, ticks } = useMemo(() => {
    const dateSet = new Map<string, Record<string, number | string | null>>();
    for (const s of series) {
      for (let i = 0; i < s.dates.length; i++) {
        const d = s.dates[i];
        if (!dateSet.has(d)) dateSet.set(d, { date: d });
        const row = dateSet.get(d)!;
        row[s.name] = s.values[i];
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
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={formatYear}
            ticks={ticks}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `${v}${ySuffix || ""}`}
            width={60}
          />
          <Tooltip
            formatter={(value) => [
              `${typeof value === "number" ? value.toFixed(2) : value}${ySuffix || ""}`,
            ]}
            labelFormatter={(label) => formatDateDetailed(String(label))}
          />
          <Legend />
          {series.map((s, i) => (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              strokeWidth={1.5}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SimpleBarChart({
  data,
  xKey,
  yKey,
  ySuffix,
  xSuffix,
  colorKey,
  title,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  ySuffix?: string;
  xSuffix?: string;
  colorKey?: string;
  title?: string;
}) {
  const ticks = useMemo(() => {
    if (data.length <= 20) return undefined;
    const vals = data.map((d) => d[xKey]);
    const step = Math.max(1, Math.ceil(vals.length / 15));
    return vals.filter((_, i) => i % step === 0).map(String);
  }, [data, xKey]);

  return (
    <div className={styles.chartContainer}>
      {title && <h4 className={styles.chartTitle}>{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ebebf0" />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string | number) => `${v}${xSuffix || ""}`}
            ticks={ticks}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `${v}${ySuffix || ""}`}
            width={50}
          />
          <Tooltip
            formatter={(value) => [
              `${typeof value === "number" ? value.toFixed(2) : value}${ySuffix || ""}`,
            ]}
          />
          <ReferenceLine y={0} stroke="#8a8a98" strokeDasharray="3 3" />
          <Bar dataKey={yKey} radius={[2, 2, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={
                  colorKey && entry[colorKey]
                    ? String(entry[colorKey])
                    : COLORS[0]
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SimulationChart({ block }: { block: Block }) {
  const history = block.history;
  const pctls = block.percentiles;
  if (!history || !pctls) return null;

  const { sampled, ticks } = useMemo(() => {
    const data: Record<string, unknown>[] = [];
    if (history.dates && history.values) {
      for (let i = 0; i < history.dates.length; i++) {
        data.push({ date: history.dates[i], History: history.values[i] });
      }
    }
    if (pctls.dates) {
      for (let i = 0; i < pctls.dates.length; i++) {
        data.push({
          date: pctls.dates[i],
          Median: pctls.p50[i],
          "5th pct": pctls.p5[i],
          "95th pct": pctls.p95[i],
        });
      }
    }
    const maxPoints = 500;
    const step = Math.max(1, Math.floor(data.length / maxPoints));
    const s = data.filter((_, i) => i % step === 0 || i === data.length - 1);
    const t = getYearTicks(s, "date");
    return { sampled: s, ticks: t };
  }, [history, pctls]);

  return (
    <div className={styles.chartContainer}>
      {block.title && <h4 className={styles.chartTitle}>{block.title}</h4>}
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={sampled} margin={{ top: 8, right: 24, bottom: 8, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ebebf0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={formatYear}
            ticks={ticks}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => v.toLocaleString()}
            width={70}
          />
          <Tooltip
            labelFormatter={(label) => formatDateDetailed(String(label))}
            formatter={(value) => [
              typeof value === "number" ? value.toLocaleString() : String(value),
            ]}
          />
          <Legend />
          <Line type="monotone" dataKey="History" stroke="#1a1a1f" dot={false} strokeWidth={1.5} connectNulls />
          <Line type="monotone" dataKey="Median" stroke="#1e4fd8" dot={false} strokeWidth={2} connectNulls />
          <Line type="monotone" dataKey="5th pct" stroke="#e74c3c" dot={false} strokeWidth={1} strokeDasharray="4 4" connectNulls />
          <Line type="monotone" dataKey="95th pct" stroke="#2ecc71" dot={false} strokeWidth={1} strokeDasharray="4 4" connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AreaChartWithBands({ block }: { block: Block }) {
  const series = block.series as SeriesData;
  if (!series || !series.dates) return null;

  const { sampled, ticks } = useMemo(() => {
    const data = series.dates.map((d, i) => ({ date: d, value: series.values[i] }));
    const maxPoints = 500;
    const step = Math.max(1, Math.floor(data.length / maxPoints));
    const s = data.filter((_, i) => i % step === 0 || i === data.length - 1);
    const t = getYearTicks(s, "date");
    return { sampled: s, ticks: t };
  }, [series]);

  return (
    <div className={styles.chartContainer}>
      {block.title && <h4 className={styles.chartTitle}>{block.title}</h4>}
      {block.bands && (
        <div className={styles.bandLegend}>
          <span className={styles.bandDot} style={{ background: "rgba(0,128,0,0.3)" }} /> Low
          <span className={styles.bandDot} style={{ background: "rgba(255,165,0,0.3)" }} /> Medium
          <span className={styles.bandDot} style={{ background: "rgba(255,0,0,0.3)" }} /> High
        </div>
      )}
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={sampled} margin={{ top: 8, right: 24, bottom: 8, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ebebf0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={formatYear}
            ticks={ticks}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `${v}${block.y_suffix || ""}`}
            width={60}
          />
          <Tooltip
            formatter={(value) => [
              `${typeof value === "number" ? value.toFixed(2) : value}${block.y_suffix || ""}`,
            ]}
            labelFormatter={(label) => formatDateDetailed(String(label))}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#1e4fd8"
            fill="rgba(30,79,216,0.08)"
            strokeWidth={1.5}
            dot={false}
          />
        </AreaChart>
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
      return block.headers && block.rows ? (
        <DataTable headers={block.headers} rows={block.rows} title={block.title} />
      ) : null;

    case "line_chart":
      if (Array.isArray(block.series)) {
        return (
          <MultiLineChart
            series={block.series}
            title={block.title}
            ySuffix={block.y_suffix}
          />
        );
      }
      if (block.series && !Array.isArray(block.series)) {
        return (
          <MultiLineChart
            series={[block.series]}
            title={block.title}
            ySuffix={block.y_suffix}
          />
        );
      }
      return null;

    case "bar_chart":
      return block.data ? (
        <SimpleBarChart
          data={block.data as Record<string, unknown>[]}
          xKey={block.x_key || "x"}
          yKey={block.y_key || "y"}
          ySuffix={block.y_suffix}
          xSuffix={block.x_suffix}
          colorKey={block.color_key}
          title={block.title}
        />
      ) : null;

    case "simulation_chart":
      return <SimulationChart block={block} />;

    case "area_chart_with_bands":
      return <AreaChartWithBands block={block} />;

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

// ─── Main Page ───

export default function MarketReturnsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Free section count: anonymous users see the first section only
  const FREE_SECTIONS = 1;

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/analysis/market-returns`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setReport(data);
      if (data.sections?.length) setActiveSection(data.sections[0].id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useEffect(() => {
    if (!report) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    for (const section of report.sections) {
      const el = document.getElementById(section.id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [report]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <a href="/" className={styles.backLink}>
            ← InScien
          </a>
        </div>
        <div className={styles.headerMain}>
          <div>
            <div className={styles.agentDomain}>Markets</div>
            <h1 className={styles.agentTitle}>
              {report?.title || "S&P 500 Market Returns Analysis"}
            </h1>
            <p className={styles.agentDesc}>
              {report?.subtitle ||
                "Comprehensive risk, return, and regime analysis."}
            </p>
          </div>
          <div className={styles.agentMeta}>
            {report?.data_range && (
              <div className={styles.metaItem}>
                <div className={styles.metaVal}>
                  {report.data_range.monthly_start.substring(0, 4)}–
                  {report.data_range.monthly_end.substring(0, 4)}
                </div>
                <div className={styles.metaKey}>Data range</div>
              </div>
            )}
            <div className={styles.metaItem}>
              <div className={styles.metaVal}>5</div>
              <div className={styles.metaKey}>Sections</div>
            </div>
            <div className={styles.metaItem}>
              <div className={styles.statusLive}>Live</div>
              <div className={styles.metaKey}>Status</div>
            </div>
          </div>
        </div>
      </header>

      {report && (
        <nav className={styles.sectionNav}>
          <div className={styles.sectionNavInner}>
            {report.sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`${styles.sectionNavItem} ${
                  activeSection === s.id ? styles.sectionNavActive : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById(s.id)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {s.title}
              </a>
            ))}
          </div>
        </nav>
      )}

      <main className={styles.content}>
        {loading && (
          <div className={styles.loading}>Computing analysis...</div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={loadReport} className={styles.retry}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && report && (
          <div className={styles.sections}>
            {/* Free sections — always visible */}
            {report.sections.slice(0, FREE_SECTIONS).map((section) => (
              <SectionRenderer key={section.id} section={section} />
            ))}

            {/* Gated sections — require auth */}
            {report.sections.length > FREE_SECTIONS && (
              <AccessGate requires="auth" featureLabel="the full analysis">
                {report.sections.slice(FREE_SECTIONS).map((section) => (
                  <SectionRenderer key={section.id} section={section} />
                ))}
              </AccessGate>
            )}
          </div>
        )}

        {!loading && !error && report && (
          <div className={styles.reportFooter}>
            <span>Data: Yahoo Finance (^GSPC)</span>
            <span>
              Updated: {new Date(report.updated_at).toLocaleDateString()}
            </span>
          </div>
        )}
      </main>
    </div>
  );
}