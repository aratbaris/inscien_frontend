"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./paper-brief.module.css";
import { AgentHeader, StatusBadge } from "@/components/agent";

const AUDIO_BASE = "/audio/paper-briefs";

// ─── Props ───

export interface PaperBriefAgentProps {
  episodeNumber: number;
  title: string;
  authors: string;
  affiliations: string;
  venue: string;
  year: number;
  citations: number;
  paperUrl: string;
  audioFile: string;
  durationSeconds: number;
  summary: string;
  /** Optional deeper discussion sections */
  sections?: {
    heading: string;
    body: string;
  }[];
}

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

// ─── Icons ───

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

function BackIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 12L6 8l4-4" />
    </svg>
  );
}

// ─── Main Component ───

export default function PaperBriefAgent({
  episodeNumber,
  title,
  authors,
  affiliations,
  venue,
  year,
  citations,
  paperUrl,
  audioFile,
  durationSeconds,
  summary,
  sections,
}: PaperBriefAgentProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.src || audio.src === "") {
      audio.src = `${AUDIO_BASE}/${audioFile}`;
      audio.load();
    }

    if (audio.paused) {
      audio.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

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
        title={`Paper Brief: ${title}`}
        description={`EP ${episodeNumber} · ${authors}`}
        meta={[
          { label: "Venue", value: `${venue} ${year}` },
          { label: "Duration", value: fmtDuration(durationSeconds) },
          { label: "Citations", value: fmtCitations(citations) },
          { label: "Status", value: <StatusBadge status="live" /> },
        ]}
      />

      <main className={styles.content}>
        {/* Back link */}
        <a href="/agents/deep-research/volatility-risk" className={styles.backLink}>
          <BackIcon /> All episodes
        </a>

        {/* Paper card */}
        <div className={styles.paperCard}>
          <div className={styles.epBadge}>EP {episodeNumber}</div>
          <h2 className={styles.paperTitle}>{title}</h2>
          <p className={styles.paperAuthors}>{authors}</p>
          <p className={styles.paperAffiliations}>{affiliations}</p>
          <p className={styles.paperSummary}>{summary}</p>

          <div className={styles.paperMeta}>
            <span>{venue} {year}</span>
            <span className={styles.dot} />
            <span>{fmtDuration(durationSeconds)}</span>
            <span className={styles.dot} />
            <span>{fmtCitations(citations)} citations</span>
          </div>

          <div className={styles.paperActions}>
            <button className={styles.playBtn} onClick={togglePlay}>
              {isPlaying ? (
                <><PauseIcon size={20} /> Pause</>
              ) : (
                <><PlayIcon size={20} /> Play Episode</>
              )}
            </button>
            <a href={paperUrl} target="_blank" rel="noopener noreferrer" className={styles.paperLink}>
              <PaperIcon /> Read Paper
            </a>
          </div>
        </div>

        {/* Optional deeper sections */}
        {sections && sections.length > 0 && (
          <div className={styles.sectionsWrap}>
            {sections.map((sec, i) => (
              <div key={i} className={styles.section}>
                <h3 className={styles.sectionHeading}>{sec.heading}</h3>
                <p className={styles.sectionBody}>{sec.body}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Persistent player */}
      {(isPlaying || currentTime > 0) && (
        <div className={styles.player}>
          <div className={styles.playerInner}>
            <button className={styles.playerPlayBtn} onClick={togglePlay}>
              {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
            </button>
            <div className={styles.playerInfo}>
              <div className={styles.playerTitle}>EP {episodeNumber}: {title}</div>
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