import { optionalAuth } from "~/server/utils/auth";
import type { LinkPublic } from "~/model/api/linkPublic";
import { requireLinkInPath } from "~/server/utils/links";

export default defineEventHandler((event) => {
  const link = requireLinkInPath(event);

  const authUser = optionalAuth(event);
  if (authUser) {
    return mapDbLinkToLink(link);
  }

  return {
    key: link.key,
    url: link.url,
  } satisfies LinkPublic;
});
