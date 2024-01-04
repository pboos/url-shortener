<script lang="ts" setup>

const params = useRoute().params;
const urlKey = params.id;

// const link = useAsyncData(async () => {
//   await useFetch(`/api/links/${urlKey}`);
//   return {};
// });

console.log('sending link request');
await useFetch(`/api/links/${urlKey}`);

console.log('sending track request');
await useFetch(`/api/links/${urlKey}/track`, {method: 'POST'});

// const { data } = await client
//     .from("links")
//     .select("*")
//     .eq("key", params.id)
//     .single();

// if (data) {
//   const clickData: any = {};
//
//   const ua = useUserAgent();
//
//   console.log({ ua });
//
//   if (ua) {
//     clickData.user_agent = ua.userAgent;
//     clickData.ip = ua.ip;
//
//     if (ua.ip) {
//       const geo = geoip.lookup(ua.ip);
//       if (geo) {
//         clickData.country = geo.country;
//         clickData.city = geo.city;
//       }
//     }
//   }
//
//   const click = await client.from("clicks").insert({
//     link_id: data.id,
//     ...clickData,
//   });
//
//   console.log({ click });
//
//   // TODO use correct url
//   navigateTo('https://www.getyourguide.com');
// } else {
//   throw createError({
//     statusCode: 404,
//     message: "Link not found",
//   });
// }
</script>

<template>
  <div class="grid place-content-center h-screen">Redirecting...</div>
</template>
