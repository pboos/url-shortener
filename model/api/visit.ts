export interface Visit {
  id: number;
  linkId: number;
  ip?: string;
  userAgent?: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}
