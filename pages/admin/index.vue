<script setup lang="ts">
import type { Link } from "~/model/api/link";
import LinkCard from "~/components/LinkCard.vue";
import CreateLinkForm from "~/components/CreateLinkForm.vue";

useRequireAuthenticated();

const { data: links, refresh: refreshLinks } =
  await useFetchWithAuth<Link[]>("/api/links");
</script>

<template>
  <section>
    <h1 class="text-2xl font-bold">Dashboard</h1>
    <CreateLinkForm @created="refreshLinks" />
    <div class="links-wrapper mt-10">
      <LinkCard
        v-for="link in links"
        :key="link.id"
        :link="link"
        class="mt-4"
      />
    </div>
  </section>
</template>
