export interface User {
  id: number;
  username: string;
}

export type QrPattern =
  "square" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded";

export interface QrConfig {
  pattern: QrPattern;
  ink: string;
  paper: string;
  logo: string | null;
}

export interface LinkRecord {
  id: number;
  key: string;
  url: string;
  qrConfig: QrConfig | null;
  totalVisits: number;
  createdAt: string;
}

export interface LinkPage {
  links: Omit<LinkRecord, "qrConfig">[];
  workspace: { totalLinks: number; totalVisits: number };
  total: number;
  page: number;
  pageSize: number;
}

export interface Visit {
  id: number;
  createdAt: string;
  visitor: string | null;
  userAgent: string | null;
  country: string | null;
  city: string | null;
}

export interface LinkStats {
  totalVisits: number;
  uniqueVisitors: number;
  daily: { date: string; visits: number }[];
  visits: Visit[];
  totalRows: number;
  page: number;
  pageSize: number;
}
