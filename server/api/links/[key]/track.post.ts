import geoip from "geoip-lite";
import {requireLinkInPath} from "~/server/utils/links";
import {clientInfo} from "~/server/utils/clientInfo";
import {InsertVisit, visits} from "~/server/db/schema";
import {db} from "~/server/db/sqlite-service";

export default defineEventHandler(async (event) => {
  console.log('track.post.ts');

  const link = requireLinkInPath(event);
  const clientInfoData = clientInfo(event);
  const geo = clientInfoData.ip ? geoip.lookup(clientInfoData.ip) : null;

  const newVisit: InsertVisit = {
    linkId: link.id,
    ip: clientInfoData.ip ?? '',
    userAgent: clientInfoData.userAgent,
    country: geo?.country,
    region: geo?.region,
    city: geo?.city,
    latitude: geo?.ll?.[0],
    longitude: geo?.ll?.[1],
  };
  console.log(newVisit);
  try {
    db.insert(visits).values(newVisit).run();
  } catch (e) {
    console.error(e);
  }
});
