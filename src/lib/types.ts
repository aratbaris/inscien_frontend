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