import type { Link } from "~/model/api/link";
import type {Visit} from "~/model/api/visit";
import type {SelectLink, SelectVisit} from "~/server/db/schema";

export const mapDbLinkToLink = (link: SelectLink): Link => ({
  id: link.id,
  userId: link.userId,
  key: link.key,
  url: link.url,
  totalVisits: link.totalVisits,
  createdAt: new Date(link.createdAt).toISOString(),
});

export const mapDbVisitToVisit = (visit: SelectVisit): Visit => ({
  id: visit.id,
  linkId: visit.linkId,
  ip: visit.ip,
  userAgent: visit.userAgent ?? undefined,
  country: visit.country ?? undefined,
  region: visit.region ?? undefined,
  city: visit.city ?? undefined,
  latitude: visit.latitude ?? undefined,
  longitude: visit.longitude ?? undefined,
  createdAt: new Date(visit.createdAt).toISOString(),
});
