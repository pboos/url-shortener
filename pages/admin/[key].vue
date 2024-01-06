<script lang="ts" setup>
import LinkCard from "~/components/LinkCard.vue";
import VisitLine from "~/components/VisitLine.vue";
import type { Link } from "~/model/api/link";
import type { Visit } from "~/model/api/visit";

const { key: urlKey } = useRoute().params;

const { data: link } = await useFetchWithAuth<Link>(`/api/links/${urlKey}`);
const { data: visits } = await useFetchWithAuth<Visit[]>(
  `/api/links/${urlKey}/visits`,
);

const onUpdated = (newLink: Link) => {
  if (link.value?.key !== newLink.key) {
    navigateTo(buildNavigateToAdminLink(newLink.key));
  }
};

const requestUrl = useRequestURL();
const shortUrl = computed(() => {
  if (!link.value) {
    return null;
  }
  const config = useRuntimeConfig();
  let baseUrl = config.app.baseURL.startsWith("http")
    ? config.app.baseURL
    : `${requestUrl.origin}${config.app.baseURL}`;
  baseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${baseUrl}${link.value.key}`;
});

// TODO qr image logo configurable (store on link in database)
</script>

<template>
  <div v-if="link">
    {{ shortUrl }}
    <LinkCard :link="link" :full-width="true" />
    <QRCodeVue3
      v-if="shortUrl"
      :value="shortUrl"
      class="my-4"
      :width="400"
      :height="400"
      :qr-options="{ typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' }"
      :image-options="{
        hideBackgroundDots: true,
        imageSize: 0.5,
        margin: 2,
        crossOrigin: 'anonymous',
      }"
      :dots-options="{
        type: 'square',
        color: '#000000',
        // gradient: {
        //   type: 'linear',
        //   rotation: 0,
        //   colorStops: [
        //     { offset: 0, color: '#26249a' },
        //     { offset: 1, color: '#26249a' },
        //   ],
        // },
      }"
      :background-options="{ color: '#ffffff' }"
      :corners-square-options="{ type: 'square', color: '#000000' }"
      :corners-dot-options="{ type: undefined, color: '#000000' }"
    />
    <UpdateLinkForm :link="link" class="mt-4" @updated="onUpdated" />
    <DeleteLinkCard :link="link" class="mt-4" />

    <div v-if="visits && visits.length" class="mt-4">
      <h2 class="text-2xl">Visits</h2>
      <VisitLine
        v-for="visit in visits"
        :key="visit.id"
        :visit="visit"
        class="mt-4"
      />
    </div>
  </div>
</template>
