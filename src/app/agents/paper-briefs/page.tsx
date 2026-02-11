"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import { AgentHeader, StatusBadge } from "@/components/agent";

// ─── Episode Data ───
const AUDIO_BASE = "/audio/paper-briefs";

interface Episode {
  id: number;
  title: string;
  authors: string;
  venue: string;
  year: number;
  citations: number;
  link: string;
  durationSeconds: number;
  audioFile: string;
  summary: string;
}

const EPISODES: Episode[] = [
  {
    id: 2,
    title: "Modeling and Forecasting Realized Volatility",
    authors: "Torben G. Andersen, Tim Bollerslev, Francis X. Diebold, Paul Labys",
    venue: "Econometrica",
    year: 2003,
    citations: 5300,
    link: "https://www.jstor.org/stable/3082068",
    durationSeconds: 500,
    audioFile: "episode02.mp3",
    summary:
      "How high-frequency intraday returns can be used to construct nonparametric realized volatility measures, and why long-memory models applied to these measures dramatically improve out-of-sample forecasting of asset return volatility across multiple horizons.",
  },
  {
    id: 1,
    title: "Tail Risk and Asset Prices",
    authors: "Bryan Kelly, Hao Jiang",
    venue: "The Review of Financial Studies",
    year: 2014,
    citations: 1000,
    link: "https://www.jstor.org/stable/24466856",
    durationSeconds: 562,
    audioFile: "episode01.mp3",
    summary:
      "How to measure tail risk when extreme events are too rare to estimate from aggregate data and why a cross-sectional approach using individual stock crashes predicts market returns, prices risk, and forecasts real economic downturns.",
  },
];

// ─── Helpers ───

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmtTime(sec: number) {
  if (!sec || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmtCitations(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ─── Components ───

function PlayIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function PaperIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

// ─── Main Page ───

export default function PaperBriefsPage() {
  const [currentEp, setCurrentEp] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedIdRef = useRef<number | null>(null);

  const latest = EPISODES[0];

  const playEpisode = useCallback((ep: Episode) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (loadedIdRef.current === ep.id) {
      if (audio.paused) {
        audio.play().catch(() => {});
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
      return;
    }

    loadedIdRef.current = ep.id;
    setCurrentEp(ep);
    setProgress(0);
    setCurrentTime(0);
    audio.src = `${AUDIO_BASE}/${ep.audioFile}`;
    audio.load();
    audio.play().catch(() => {});
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  };

  return (
    <div className={styles.page}>
      <audio ref={audioRef} preload="metadata" />

      <AgentHeader
        domain="Research"
        title="Volatility & Risk Modeling"
        description="Each episode walks through one influential paper: the problem it tackled, the core insight, why it works, and what it changed. No equations, no jargon walls. Just the ideas, explained for a quantitatively literate audience in under ten minutes."
        meta={[
          { label: "Episodes", value: String(EPISODES.length) },
          { label: "Cadence", value: "Weekly" },
          { label: "Status", value: <StatusBadge status="live" /> },
        ]}
      />

      <main className={styles.content}>
        {/* Latest Episode Hero */}
        <section className={styles.latestSection}>
          <div className={styles.latestLabel}>Latest Episode</div>
          <div className={styles.latestCard}>
            <div className={styles.latestLeft}>
              <div className={styles.epNumber}>EP {latest.id}</div>
              <h2 className={styles.latestTitle}>{latest.title}</h2>
              <p className={styles.latestAuthors}>{latest.authors}</p>
              <p className={styles.latestAffiliations}>University of Pennsylvania · Duke University · NYU Stern</p>
              <p className={styles.latestSummary}>{latest.summary}</p>
              <div className={styles.latestMeta}>
                <span>{latest.venue} {latest.year}</span>
                <span className={styles.dot} />
                <span>{fmtDuration(latest.durationSeconds)}</span>
                <span className={styles.dot} />
                <span>{fmtCitations(latest.citations)} citations</span>
              </div>
              <div className={styles.latestActions}>
                <button className={styles.playBtn} onClick={() => playEpisode(latest)}>
                  {currentEp?.id === latest.id && isPlaying ? (
                    <><PauseIcon size={20} /> Pause</>
                  ) : (
                    <><PlayIcon size={20} /> Play Episode</>
                  )}
                </button>
                <a href={latest.link} target="_blank" rel="noopener noreferrer" className={styles.paperLink}>
                  <PaperIcon /> Read Paper
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Archive */}
        <section className={styles.archiveSection}>
          <h3 className={styles.archiveTitle}>All Episodes</h3>
          <div className={styles.episodeList}>
            {EPISODES.map((ep) => (
              <div key={ep.id} className={`${styles.episodeRow} ${currentEp?.id === ep.id ? styles.episodeRowActive : ""}`}>
                <button className={styles.episodePlayBtn} onClick={() => playEpisode(ep)} aria-label={`Play episode ${ep.id}`}>
                  {currentEp?.id === ep.id && isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
                </button>
                <div className={styles.episodeNum}>{ep.id}</div>
                <div className={styles.episodeInfo}>
                  <div className={styles.episodeTitle}>{ep.title}</div>
                  <div className={styles.episodeAuthors}>{ep.authors} · {ep.venue} {ep.year}</div>
                </div>
                <div className={styles.episodeMeta}>
                  <span className={styles.episodeCitations}>{fmtCitations(ep.citations)} cit.</span>
                  <span className={styles.episodeDuration}>{fmtDuration(ep.durationSeconds)}</span>
                </div>
                <a href={ep.link} target="_blank" rel="noopener noreferrer" className={styles.episodePaperLink} aria-label="Read paper">
                  <PaperIcon />
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Persistent Audio Player */}
      {currentEp && (
        <div className={styles.player}>
          <div className={styles.playerInner}>
            <button className={styles.playerPlayBtn} onClick={() => currentEp && playEpisode(currentEp)}>
              {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
            </button>
            <div className={styles.playerInfo}>
              <div className={styles.playerTitle}>EP {currentEp.id}: {currentEp.title}</div>
              <div className={styles.playerTime}>{fmtTime(currentTime)} / {fmtTime(duration)}</div>
            </div>
            <div className={styles.playerBar} onClick={seekTo}>
              <div className={styles.playerBarTrack}>
                <div className={styles.playerBarFill} style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}