import { lookup } from "geoip-lite";
import { requireLinkInPath } from "~/server/utils/links";
import { clientInfo } from "~/server/utils/clientInfo";
import { InsertVisit, visits } from "~/server/db/schema";
import { db } from "~/server/db/sqlite-service";

export default defineEventHandler((event) => {
  const link = requireLinkInPath(event);
  const clientInfoData = clientInfo(event);
  const geo = clientInfoData.ip ? lookup(clientInfoData.ip) : null;

  const newVisit: InsertVisit = {
    linkId: link.id,
    ip: clientInfoData.ip ?? "",
    userAgent: clientInfoData.userAgent,
    country: geo?.country,
    region: geo?.region,
    city: geo?.city,
    latitude: geo?.ll?.[0],
    longitude: geo?.ll?.[1],
  };
  try {
    db.insert(visits).values(newVisit).run();
  } catch (e) {
    console.error(e);
  }
});
