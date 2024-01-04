<script lang="ts" setup>
import NavBar from "~/components/NavBar.vue";
</script>

<template>
  <div class="layout" data-theme="light">
    <NavBar />
    <div class="mt-4 container mx-auto">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}
</style>
