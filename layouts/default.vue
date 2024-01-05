<script lang="ts" setup>
import NavBar from "~/components/NavBar.vue";
</script>

<template>
  <div class="min-h-screen" data-theme="light">
    <NavBar />
    <div class="mt-4 container mx-auto">
      <slot />
    </div>
  </div>
</template>
