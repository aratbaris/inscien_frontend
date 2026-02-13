// ─── Existing Brief types ───

export interface BriefItem {
  timestamp: string;
  source: string;
  title: string;
  url: string;
  extended_headline: string | null;
  key_entities: string[];
}

export interface AvailableDate {
  key: string;
  label: string;
  date_et: string;
  is_weekend: boolean;
}

export interface BriefResponse {
  status: string;
  agent: string;
  day_key: string;
  day_label: string;
  available_dates: AvailableDate[];
  items: BriefItem[];
  item_count: number;
}

// ─── NEW: Notification types ───

export interface NotificationItem {
  title: string;
  timestamp: string;
  source: string;
  url: string;
  score: number;
}

export interface TopicNotification {
  notification_id: string;
  topic_id: string;
  topic_name: string;
  week_start: string;
  week_end: string;
  significance: "high" | "medium" | "low" | "none";
  significance_reason: string;
  headline: string;
  summary: string;
  agent_path: string;
  items: NotificationItem[];
  item_count: number;
  created_at: string;
}

export interface NotificationWeek {
  week_end: string;
  week_start: string;
  notification_count: number;
}

export interface NotificationsResponse {
  status: string;
  week_end: string;
  week_start: string;
  notifications: TopicNotification[];
  notification_count: number;
  available_weeks: NotificationWeek[];
}

export interface NotificationCountResponse {
  count: number;
  week_end: string;
}