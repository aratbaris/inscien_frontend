import styles from "./AgentStates.module.css";

/* ─── Loading ─── */

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading…" }: LoadingStateProps) {
  return (
    <div className={styles.state}>
      <div className={styles.spinner} />
      <p className={styles.stateText}>{message}</p>
    </div>
  );
}

/* ─── Error ─── */

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.state}>
      <p className={styles.errorText}>{message}</p>
      {onRetry && (
        <button className={styles.retry} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

/* ─── Empty ─── */

interface EmptyStateProps {
  message?: string;
  hint?: string;
}

export function EmptyState({
  message = "No data available.",
  hint,
}: EmptyStateProps) {
  return (
    <div className={styles.state}>
      <p className={styles.stateText}>{message}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}