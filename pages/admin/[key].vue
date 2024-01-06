<script lang="ts" setup>
import LinkCard from "~/components/LinkCard.vue";
import VisitLine from "~/components/VisitLine.vue";
import type { Link, LinkQrConfig } from "~/model/api/link";
import type { Visit } from "~/model/api/visit";
import LinkQrCodeWithEdit from "~/components/LinkQrCodeWithEdit.vue";

useRequireAuthenticated();

const { key: urlKey } = useRoute().params;

const { data: link } = await useFetchWithAuth<Link>(`/api/links/${urlKey}`);
const { data: visits } = await useFetchWithAuth<Visit[]>(
  `/api/links/${urlKey}/visits`,
);

const onUpdated = (newLink: Link) => {
  if (link.value?.key !== newLink.key) {
    navigateTo(buildNavigateToAdminLink(newLink.key));
  }
  link.value = newLink;
};

const onQrCodeUpdated = (config: LinkQrConfig) => {
  if (link.value) {
    link.value = { ...link.value, qrConfig: config };
  }
};
</script>

<template>
  <div v-if="link">
    <LinkCard :link="link" :full-width="true" />
    <LinkQrCodeWithEdit :link="link" class="mt-4" @updated="onQrCodeUpdated" />
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
