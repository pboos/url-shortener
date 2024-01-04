<script lang="ts" setup>
import LinkCard from "~/components/LinkCard.vue";
import type {Link} from "~/model/api/link";
import type {Visit} from "~/model/api/visit";

const { key: urlKey } = useRoute().params;

const { data: link } = await useFetchWithAuth<Link>(`/api/links/${urlKey}`);

const { data: visits } = await useFetchWithAuth<Visit[]>(`/api/links/${urlKey}/visits`);
</script>

<template>
  <LinkCard v-if="link" :link="link" :full-width="true"/>

  <div v-if="visits" class="mt-4">
    <h2 class="text-2xl">Visits</h2>
    <Visit v-for="visit in visits" :key="visit.id" :visit="visit" class="mt-4"/>
  </div>
</template>
