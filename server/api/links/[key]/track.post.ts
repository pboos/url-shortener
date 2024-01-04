import geoip from "geoip-lite";
import { requireLinkInPath } from "~/server/utils/links";
import { clientInfo } from "~/server/utils/clientInfo";
import { type InsertVisit, visits } from "~/server/db/schema";
import { db } from "~/server/db/sqlite-service";

export default defineEventHandler((event) => {
  const link = requireLinkInPath(event);
  const clientInfoData = clientInfo(event);
  // eslint-disable-next-line import/no-named-as-default-member
  const geo = clientInfoData.ip ? geoip.lookup(clientInfoData.ip) : null;

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
