<script lang="ts" setup>
import NavBar from "~/components/NavBar.vue";
</script>

<template>
  <div class="layout">
    <NavBar />
    <slot />
  </div>
</template>

<style scoped>
.layout {
  @apply text-white/70 bg-black relative;
  min-height: 100vh;
}
</style>
