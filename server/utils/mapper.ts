import { type Link } from "~/model/link";
import { type SelectLink } from "~/server/db/schema";

export const mapDbLinkToLink = (link: SelectLink): Link => ({
  id: link.id,
  userId: link.userId,
  key: link.key,
  url: link.url,
  totalVisits: link.totalVisits,
  createdAt: new Date(link.createdAt).toISOString(),
});
