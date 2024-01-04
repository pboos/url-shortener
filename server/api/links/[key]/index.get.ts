import { optionalAuth } from "~/server/utils/auth";
import { type Link } from "~/model/link";
import { type LinkPublic } from "~/model/linkPublic";
import { requireLinkInPath } from "~/server/utils/links";

export default defineEventHandler((event) => {
  const link = requireLinkInPath(event);

  const authUser = optionalAuth(event);
  if (authUser) {
    return {
      id: link.id,
      userId: link.userId,
      key: link.key,
      url: link.url,
      totalVisits: link.totalVisits,
      createdAt: new Date(link.createdAt).toISOString(),
    } satisfies Link;
  }

  return {
    key: link.key,
    url: link.url,
  } satisfies LinkPublic;
});
