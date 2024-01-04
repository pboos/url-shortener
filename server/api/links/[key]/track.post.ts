import geoip from "geoip-lite";

export default defineEventHandler(async (event) => {
  console.log('track.post.ts');
  const geo = geoip.lookup('212.51.154.64');
  console.log(geo);
  return {geo};
});
