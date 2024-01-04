<script lang="ts" setup>
import type {Visit} from "~/model/api/visit";
import DateSpan from "~/components/DateSpan.vue";

const props = defineProps<{
  visit: Visit;
}>();
</script>

<template>
  <div class="flex justify-between">
    <div class="div">
      <div class="text-amber-500">{{ visit.ip }}</div>
      <DateSpan :date="visit.createdAt" />
    </div>
    <div class="div">
      <div v-if="visit.country">Country: {{ visit.country }}</div>
      <div v-if="visit.city">City: {{ visit.city }}</div>
    </div>
  </div>
</template>
