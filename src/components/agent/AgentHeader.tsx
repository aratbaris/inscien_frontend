import styles from "./AgentHeader.module.css";

export interface MetaItem {
  label: string;
  value: string | React.ReactNode;
}

interface AgentHeaderProps {
  domain: string;
  title: string;
  description: string;
  meta: MetaItem[];
}

export function AgentHeader({ domain, title, description, meta }: AgentHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <a href="/" className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.backArrow}>
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.backLabel}>FinanceLab</span>
        </a>
      </div>
      <div className={styles.headerMain}>
        <div>
          <div className={styles.domain}>{domain}</div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.desc}>{description}</p>
        </div>
        <div className={styles.meta}>
          {meta.map((m, i) => (
            <div key={i} className={styles.metaItem}>
              <div className={styles.metaVal}>{m.value}</div>
              <div className={styles.metaKey}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}