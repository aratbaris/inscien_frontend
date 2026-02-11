import styles from "./StatusBadge.module.css";

interface StatusBadgeProps {
  status: "live" | "soon";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "live") {
    return <div className={styles.live}>Live</div>;
  }
  return <div className={styles.soon}>Coming soon</div>;
}