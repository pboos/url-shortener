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

// TODO allow DELETE
// TODO allow EDIT
</script>

<template>
  <div>
    <LinkCard v-if="link" :link="link" :full-width="true" />

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
